import { useCallback, useState } from 'react'
import { Canvas, FabricImage, Rect } from 'fabric'

interface UseFabricCropProps {
    canvas: Canvas | null
}

interface UseFabricCropReturn {
    isCropping: boolean
    startCropping: () => void
    applyCrop: () => Promise<FabricImage | null>
    cancelCrop: () => void
}

export const useFabricCrop = ({ canvas }: UseFabricCropProps): UseFabricCropReturn => {
    const [isCropping, setIsCropping] = useState(false)
    const [cropRect, setCropRect] = useState<Rect | null>(null)
    const [imageToClip, setImageToClip] = useState<FabricImage | null>(null)

    const cleanup = useCallback(() => {
        setCropRect(null)
        setImageToClip(null)
        setIsCropping(false)
    }, [])

    const startCropping = useCallback(() => {
        if (!canvas) return

        // Find the image object on the canvas
        const objects = canvas.getObjects()
        const image = objects.find(obj => obj instanceof FabricImage)

        if (!image || !(image instanceof FabricImage)) return

        setImageToClip(image)
        const bounds = image.getBoundingRect()

        // Create crop rectangle
        const rect = new Rect({
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            height: bounds.height,
            fill: "rgba(0,0,0,0.3)",
            stroke: "#CDF138",
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            cornerColor: "#CDF138",
            cornerStrokeColor: "black",
            lockRotation: true,
            cornerSize: 10,
            transparentCorners: false,
            hasControls: true,
        })

        canvas.add(rect)
        canvas.setActiveObject(rect)
        canvas.renderAll()

        setCropRect(rect)
        setIsCropping(true)
    }, [canvas])

    const applyCrop = useCallback(async (): Promise<FabricImage | null> => {
        if (!canvas || !cropRect || !imageToClip) return null

        const originalWidth = imageToClip.width! * (imageToClip.scaleX || 1)
        const originalHeight = imageToClip.height! * (imageToClip.scaleY || 1)
        const currentAngle = imageToClip.angle || 0
        const flipX = imageToClip.flipX
        const flipY = imageToClip.flipY

        // Temporarily reset angle for accurate cropping
        imageToClip.set({ angle: 0 })
        canvas.renderAll()

        const rect = cropRect.getBoundingRect()
        const imageRect = imageToClip.getBoundingRect()

        // Calculate relative positions and dimensions
        const relativeLeft = rect.left - imageRect.left
        const relativeTop = rect.top - imageRect.top
        const relativeWidth = rect.width
        const relativeHeight = rect.height

        // Calculate crop dimensions in original image space
        const cropX = (relativeLeft / imageRect.width) * originalWidth
        const cropY = (relativeTop / imageRect.height) * originalHeight
        const cropWidth = (relativeWidth / imageRect.width) * originalWidth
        const cropHeight = (relativeHeight / imageRect.height) * originalHeight

        // Create temporary canvas for cropping
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = cropWidth
        tempCanvas.height = cropHeight
        const tempCtx = tempCanvas.getContext("2d")
        if (!tempCtx) return null

        // Draw cropped section
        const img = imageToClip.getElement() as HTMLImageElement
        tempCtx.drawImage(
            img,
            cropX / (imageToClip.scaleX || 1),
            cropY / (imageToClip.scaleY || 1),
            cropWidth / (imageToClip.scaleX || 1),
            cropHeight / (imageToClip.scaleY || 1),
            0,
            0,
            cropWidth,
            cropHeight
        )

        return new Promise<FabricImage>((resolve) => {
            const croppedImg = new Image()
            croppedImg.src = tempCanvas.toDataURL("image/png")

            croppedImg.onload = () => {
                const croppedFabricImage = new FabricImage(croppedImg)
                croppedFabricImage.set({
                    left: rect.left + rect.width / 2,
                    top: rect.top + rect.height / 2,
                    originX: "center",
                    originY: "center",
                    angle: currentAngle,
                    selectable: false,
                    evented: false,
                    flipX: flipX,
                    flipY: flipY,
                    scaleX: 1,
                    scaleY: 1,
                })

                canvas.remove(imageToClip)
                canvas.remove(cropRect)
                canvas.add(croppedFabricImage)
                canvas.renderAll()

                cleanup()
                resolve(croppedFabricImage)
            }
        })
    }, [canvas, cropRect, imageToClip, cleanup])

    const cancelCrop = useCallback(() => {
        if (!canvas || !cropRect) return

        canvas.remove(cropRect)
        canvas.renderAll()
        cleanup()
    }, [canvas, cropRect, cleanup])

    return {
        isCropping,
        startCropping,
        applyCrop,
        cancelCrop
    }
}