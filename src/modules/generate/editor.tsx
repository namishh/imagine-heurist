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
    const canvas = new Canvas(canvasRef.current)
    setCanvas(canvas)
    return () => {
      canvas.dispose()
    }
  }, [isVisible, imageUrl])

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-[1000000000] flex items-center justify-center bg-black transition-opacity duration-300 ${
      !isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
    }`}>
      <div className={`relative bg-white p-4 rounded-lg w-[60vw] h-[80vh] transition-transform duration-300 ${
        !isAnimating ? 'translate-y-0' : 'translate-y-[200vh]'
      }`}>
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000" viewBox="0 0 256 256">
            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
          </svg>
        </button>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  )
}

export default ImageEditorCanvas