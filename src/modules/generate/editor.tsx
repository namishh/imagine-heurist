import { useEffect, useState, useRef } from 'react'
import { Canvas, FabricImage } from 'fabric'
import { format } from 'date-fns'
import { useFabricCrop } from '@/hooks/useFabricCrop'

interface ImageEditorCanvasProps {
	model: string
	imageUrl: string | null
	isOpen: boolean
	onClose: () => void
}

interface SavedImage {
	name: string
	width: number
	height: number
	create_at: string
	base64: string
}

interface ModelImages {
	name: string
	imgs: SavedImage[]
}

const DB_NAME = 'ImageEditorDB'
const STORE_NAME = 'editedImages'
const DB_VERSION = 1
const MAX_STORAGE_MB = 100

const ImageEditorCanvas = ({ model, imageUrl, isOpen, onClose }: ImageEditorCanvasProps) => {
	const [canvas, setCanvas] = useState<Canvas | null>(null)
	const [isVisible, setIsVisible] = useState(false)
	const [isAnimating, setIsAnimating] = useState(false)
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const originalImageRef = useRef<HTMLImageElement | null>(null)
	const [db, setDb] = useState<IDBDatabase | null>(null)

  const { isCropping, startCropping, applyCrop, cancelCrop } = useFabricCrop({ canvas })

  const handleCropStart = () => {
    startCropping()
  }

  const handleCropApply = async () => {
    const croppedImage = await applyCrop()
    if (croppedImage) {
      originalImageRef.current = croppedImage.getElement() as HTMLImageElement
    }
  }

  const handleCropCancel = () => {
    cancelCrop()
  }


	// Initialize IndexedDB
	useEffect(() => {
		const request = indexedDB.open(DB_NAME, DB_VERSION)

		request.onerror = (event) => {
			console.error("IndexedDB error:", event)
		}

		request.onsuccess = (event) => {
			setDb((event.target as IDBOpenDBRequest).result)
		}

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: 'name' })
				store.createIndex('create_at', 'create_at', { unique: false })
			}
		}

		return () => {
			if (db) {
				db.close()
			}
		}
	}, [])

	const getBase64Size = (base64String: string) => {
		const padding = base64String.endsWith('==') ? 2 : 1
		return (base64String.length * 0.75 - padding) / 1024 / 1024
	}

	const removeOldestImagesIfNeeded = async (newImageSize: number) => {
		if (!db) return

		const transaction = db.transaction(STORE_NAME, 'readwrite')
		const store = transaction.objectStore(STORE_NAME)
		const index = store.index('create_at')

		return new Promise<void>((resolve, reject) => {
			const getAllRequest = index.getAll()

			getAllRequest.onsuccess = async () => {
				const allImages = getAllRequest.result as ModelImages[]
				let totalSize = newImageSize

				allImages.forEach(model => {
					model.imgs.forEach(img => {
						totalSize += getBase64Size(img.base64)
					})
				})

				if (totalSize > MAX_STORAGE_MB) {
					const allImagesFlat = allImages.flatMap(model =>
						model.imgs.map(img => ({ ...img, modelName: model.name }))
					).sort((a, b) => new Date(a.create_at).getTime() - new Date(b.create_at).getTime())

					while (totalSize > MAX_STORAGE_MB && allImagesFlat.length > 0) {
						const oldestImage = allImagesFlat.shift()
						if (oldestImage) {
							const modelTx = db.transaction(STORE_NAME, 'readwrite')
							const modelStore = modelTx.objectStore(STORE_NAME)

							const getModelRequest = modelStore.get(oldestImage.modelName)
							getModelRequest.onsuccess = () => {
								const modelData = getModelRequest.result
								if (modelData) {
									modelData.imgs = modelData.imgs.filter(
										(img: SavedImage) => img.create_at !== oldestImage.create_at
									)
									modelStore.put(modelData)
								}
							}

							totalSize -= getBase64Size(oldestImage.base64)
						}
					}
				}
				resolve()
			}

			getAllRequest.onerror = () => {
				reject(new Error('Failed to get images'))
			}
		})
	}

	const handleRotation = (direction: 'cw' | 'ccw') => {
		if (!canvas) return;

		const image = canvas.getObjects().find(obj => obj instanceof FabricImage);
		if (!image) return;

		const currentAngle = image.angle || 0;
		const rotationAmount = direction === 'cw' ? 90 : -90;
		image.rotate(currentAngle + rotationAmount);

		canvas.centerObject(image);
		canvas.renderAll();
	}

	const handleFlip = (direction: 'horizontal' | 'vertical') => {
		if (!canvas) return;

		const image = canvas.getObjects().find(obj => obj instanceof FabricImage);
		if (!image) return;

		if (direction === 'horizontal') {
			image.set('flipX', !image.flipX);
		} else {
			image.set('flipY', !image.flipY);
		}

		canvas.renderAll();
	}

	const getImageFromCanvas = (useOriginalSize: boolean = true) => {
		if (!canvas || !originalImageRef.current) return null;

		const image = canvas.getObjects().find(obj => obj instanceof FabricImage);
		if (!image) return null;
		const tempCanvas = document.createElement('canvas');
		const tempCtx = tempCanvas.getContext('2d');
		if (!tempCtx) return null;

		const { width: originalWidth, height: originalHeight } = originalImageRef.current;

		let width = originalWidth;
		let height = originalHeight;

		if (image.angle) {
			const radians = (image.angle * Math.PI) / 180;
			const sin = Math.abs(Math.sin(radians));
			const cos = Math.abs(Math.cos(radians));

			width = Math.floor(originalWidth * cos + originalHeight * sin);
			height = Math.floor(originalWidth * sin + originalHeight * cos);
		}

		tempCanvas.width = width;
		tempCanvas.height = height;

		tempCtx.fillStyle = 'white';
		tempCtx.fillRect(0, 0, width, height);

		tempCtx.save();

		tempCtx.translate(width / 2, height / 2);

		if (image.angle) {
			tempCtx.rotate((image.angle * Math.PI) / 180);
		}
		tempCtx.scale(image.flipX ? -1 : 1, image.flipY ? -1 : 1);

		tempCtx.drawImage(
			originalImageRef.current,
			-originalWidth / 2,
			-originalHeight / 2,
			originalWidth,
			originalHeight
		);

		tempCtx.restore();

		return {
			base64: tempCanvas.toDataURL('image/png', 1.0),
			width: width,
			height: height
		};
	};

	const handleSave = async () => {
		if (!db) return;

		const imageData = getImageFromCanvas(true);
		if (!imageData) return;

		const date = new Date()
		const randomString = Math.random().toString(36).substring(2, 8)
		const imageName = `${format(date, 'yyyy-MM-dd')}-${randomString}`

		const savedImage: SavedImage = {
			name: imageName,
			width: imageData.width,
			height: imageData.height,
			create_at: format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
			base64: imageData.base64
		}

		try {
			// Check storage limits before saving
			await removeOldestImagesIfNeeded(getBase64Size(imageData.base64))

			const transaction = db.transaction(STORE_NAME, 'readwrite')
			const store = transaction.objectStore(STORE_NAME)

			const getRequest = store.get(model)

			getRequest.onsuccess = () => {
				const modelData = getRequest.result
				if (modelData) {
					modelData.imgs.push(savedImage)
					store.put(modelData)
				} else {
					store.put({
						name: model,
						imgs: [savedImage]
					})
				}
			}
		} catch (error) {
			console.error('Error saving image:', error)
		}
	}

	const handleDownload = () => {
		const base64Image = getImageFromCanvas(true);
		if (!base64Image) return;

		const link = document.createElement('a');
		link.href = base64Image.base64;
		const date = new Date().toISOString().split('T')[0];
		const randomString = Math.random().toString(36).substring(2, 8);
		link.download = `edited-image-${date}-${randomString}.png`;

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	// Canvas initialization and cleanup
	useEffect(() => {
		if (!isVisible || !imageUrl || !canvasRef.current) return;

		const initCanvas = new Canvas(canvasRef.current, {
			width: window.innerWidth,
			height: window.innerHeight,
			selectionColor: "#CDF13844",
			selectionBorderColor: "#CDF138",
			uniScaleKey: "shiftKey",
			allowTouchScrolling: true,
			preserveObjectStacking: true,
		})

		setCanvas(initCanvas)

		const img = new Image();
		img.crossOrigin = "anonymous";
		img.src = `/_next/image?url=${encodeURIComponent(imageUrl)}&w=1920&q=100`;

		img.onload = () => {
			originalImageRef.current = img;

			const fabricImage = new FabricImage(img, {
				selectable: false,
				evented: false,
			});

			const maxWidth = window.innerWidth * 0.8;
			const maxHeight = window.innerHeight * 0.8;

			if (fabricImage.width > maxWidth || fabricImage.height > maxHeight) {
				const scaleFactorWidth = maxWidth / fabricImage.width;
				const scaleFactorHeight = maxHeight / fabricImage.height;
				const scaleFactor = Math.min(scaleFactorWidth, scaleFactorHeight);
				fabricImage.scale(scaleFactor);
			}

			initCanvas.add(fabricImage);
			initCanvas.centerObject(fabricImage);
			initCanvas.renderAll();
		};

		return () => {
			initCanvas.dispose()
		}
	}, [isVisible, imageUrl])

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true)
			setIsAnimating(true)
			const timer = setTimeout(() => setIsAnimating(false), 300)
			return () => clearTimeout(timer)
		} else {
			setIsAnimating(true)
			const timer = setTimeout(() => setIsVisible(false), 300)
			return () => clearTimeout(timer)
		}
	}, [isOpen])

	if (!isVisible) return null
	return (
		<div className={`fixed inset-0 z-[1000000000] flex items-center justify-center bg-transparent transition-opacity duration-300`}>
			<div className={`relative bg-neutral-900 bg-[linear-gradient(to_right,#cdf13820_1px,transparent_1px),linear-gradient(to_bottom,#cdf13820_1px,transparent_1px)] md:bg-[size:64px_64px] bg-[size:32px_32px] p-0 rounded-none  w-[100vw] h-[100vh] transition-transform duration-300 ${!isAnimating ? 'translate-y-0' : 'translate-y-[200vh]'
				}`}>
				<div className="flex absolute z-[1000000000000000] bg-neutral-950 p-2 gap-2 left-1/2 rounded-lg -translate-x-1/2 top-4">
					<svg onClick={() => {
						if (!isCropping) {
							handleCropStart()
						}
					}} className='cursor-pointer hover:fill-[#CDF138] transition' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 256 256"><path d="M240,192a8,8,0,0,1-8,8H200v32a8,8,0,0,1-16,0V200H64a8,8,0,0,1-8-8V72H24a8,8,0,0,1,0-16H56V24a8,8,0,0,1,16,0V184H232A8,8,0,0,1,240,192ZM96,72h88v88a8,8,0,0,0,16,0V64a8,8,0,0,0-8-8H96a8,8,0,0,0,0,16Z"></path></svg>
					<svg className='crop-btn cursor-pointer hover:fill-[#CDF138] transition' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 256 256"><path d="M195.88,96c.07-1.31.12-2.63.12-4A68,68,0,0,0,60,92c0,1.33,0,2.65.12,4A68,68,0,1,0,128,213.65,68,68,0,1,0,195.88,96ZM128,193.47a51.89,51.89,0,0,1-16-35.38,67.55,67.55,0,0,0,31.9,0A51.89,51.89,0,0,1,128,193.47ZM128,144a51.93,51.93,0,0,1-14.08-1.95A52.06,52.06,0,0,1,128,118.53a52.06,52.06,0,0,1,14.08,23.52A51.93,51.93,0,0,1,128,144Zm-28.77-8.71A52.19,52.19,0,0,1,77.92,106a51.88,51.88,0,0,1,36.79,3.28A68.17,68.17,0,0,0,99.23,135.29Zm42.06-26.06A51.88,51.88,0,0,1,178.08,106a52.19,52.19,0,0,1-21.31,29.34A68.17,68.17,0,0,0,141.29,109.23ZM128,40A52.06,52.06,0,0,1,180,89.91,67.72,67.72,0,0,0,128,98.35a67.72,67.72,0,0,0-51.95-8.44A52.06,52.06,0,0,1,128,40ZM40,156a52,52,0,0,1,23.23-43.29A68.36,68.36,0,0,0,96.12,152c-.07,1.31-.12,2.63-.12,4a67.74,67.74,0,0,0,18.71,46.77A52,52,0,0,1,40,156Zm124,52a51.65,51.65,0,0,1-22.71-5.23A67.74,67.74,0,0,0,160,156c0-1.33-.05-2.65-.12-4a68.36,68.36,0,0,0,32.89-39.33A52,52,0,0,1,164,208Z"></path></svg>
					<svg onClick={() => handleFlip("horizontal")} className='flip-horizontal cursor-pointer hover:fill-[#CDF138] transition' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 256 256"><path d="M107.18,24.33a15.86,15.86,0,0,0-17.92,9.45l-.06.14-64,159.93A16,16,0,0,0,40,216h64a16,16,0,0,0,16-16V40A15.85,15.85,0,0,0,107.18,24.33ZM104,200H40l.06-.15L104,40Zm126.77-6.15-64-159.93-.06-.14A16,16,0,0,0,136,40V200a16,16,0,0,0,16,16h64a16,16,0,0,0,14.78-22.15ZM152,200V40l63.93,159.84.06.15Z"></path></svg>
					<svg onClick={() => handleFlip("vertical")} className='flip-vertical cursor-pointer hover:fill-[#CDF138] transition' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 256 256"><path d="M56,120H216a16,16,0,0,0,6.23-30.74l-.14-.06-159.93-64A16,16,0,0,0,40,40v64A16,16,0,0,0,56,120Zm0-80,.15.06L216,104H56l0-64Zm160,96H56a16,16,0,0,0-16,16v64a16,16,0,0,0,22.15,14.78l159.93-64,.14-.06A16,16,0,0,0,216,136ZM56.15,215.93,56,216V152H216Z"></path></svg>
					<svg onClick={() => handleRotation('cw')} className='rotate-cw cursor-pointer hover:fill-[#CDF138] transition' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 256 256"><path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path></svg>
					<svg onClick={() => handleRotation('ccw')} className='rotate-ccw cursor-pointer hover:fill-[#CDF138] transition' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0  256 256"><path d="M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z"></path></svg>
					<svg onClick={handleDownload} className='download-btn cursor-pointer hover:fill-[#CDF138] transition' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 256 256"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"></path></svg>
					<svg onClick={handleSave} className='save-btn cursor-pointer hover:fill-[#CDF138] transition' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 256 256"><path d="M219.31,72,184,36.69A15.86,15.86,0,0,0,172.69,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V83.31A15.86,15.86,0,0,0,219.31,72ZM168,208H88V152h80Zm40,0H184V152a16,16,0,0,0-16-16H88a16,16,0,0,0-16,16v56H48V48H172.69L208,83.31ZM160,72a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h56A8,8,0,0,1,160,72Z"></path></svg>
				</div>

				{isCropping && (
					<div className="absolute z-[10000000000] bottom-4 p-2 gap-4 left-1/2 -translate-x-1/2 w-full ] flex items-center justify-center">
						<p onClick={handleCropApply} className="font-semibold cursor-pointer text-sm px-4 py-[4px] bg-[#CDF138] hover:bg-[#CDF138]/80 transition rounded-sm">Apply Crop</p>

						<p onClick={handleCropCancel} className="font-semibold cursor-pointer text-sm text-neutral-900 px-4 py-[4px] hover:bg-neutral-200 transition rounded-sm bg-neutral-100">Cancel Crop</p>
					</div>
					)}
				<button
					onClick={onClose}
					className="absolute z-[10000000000] top-4 right-4 p-2 rounded-full hover:bg-neutral-800"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 256 256">
						<path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
					</svg>
				</button>
				<canvas ref={canvasRef} className="w-full h-full" />
			</div>
		</div>
	)
}

export default ImageEditorCanvas