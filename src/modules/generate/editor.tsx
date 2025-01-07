import { useEffect, useState, useRef } from 'react'
import { Canvas, FabricImage } from 'fabric'

interface ImageEditorCanvasProps {
    imageUrl: string | null
    isOpen: boolean
    onClose: () => void
}

const ImageEditorCanvas = ({ imageUrl, isOpen, onClose }: ImageEditorCanvasProps) => {
    const [canvas, setCanvas] = useState<Canvas | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

    useEffect(() => {
        if (!isVisible || !imageUrl || !canvasRef.current) return
        console.log(imageUrl)
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
        img.src = `/_next/image?url=${encodeURIComponent(imageUrl)}&w=1920&q=100`; // Adjust width/quality as needed

        img.onload = () => {
            console.log("IMAGE")
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



    if (!isVisible) return null

    return (
        <div className={`fixed inset-0 z-[1000000000] flex items-center justify-center bg-black transition-opacity duration-300 ${!isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
            }`}>
            <div className={`relative bg-neutral-900 abg-[#CDF138] bg-[linear-gradient(to_right,#cdf13820_1px,transparent_1px),linear-gradient(to_bottom,#cdf13820_1px,transparent_1px)] md:bg-[size:64px_64px] bg-[size:32px_32px] p-4 rounded-none  w-[100vw] h-[100vh] transition-transform duration-300 ${!isAnimating ? 'translate-y-0' : 'translate-y-[200vh]'
                }`}>
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