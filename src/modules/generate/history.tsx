'use client'

import { useEffect, useState, useRef } from 'react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { formatDistance } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { useLocalStorage } from 'usehooks-ts'
import { Canvas, FabricImage } from 'fabric'
import ImageEditorCanvas from './editor'

import { usePartnerFreeMint } from '@/hooks/usePartnerFreeMint'
import { shareOnX } from '@/lib/share'
import { MintToNFT } from '@/modules/mintToNFT'

import 'react-photo-view/dist/react-photo-view.css'
import { Button } from '@/components/ui/button'

export default function History({ model }: { model: string }) {
  const { refreshPartnerNFTs } = usePartnerFreeMint()
  const [history] = useLocalStorage<any[]>('IMAGINE_HISTORY', [])
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    refreshPartnerNFTs()
  }, [refreshPartnerNFTs])

  const findModelHistory: any[] = (
    history.find((item) => item.model === model)?.lists ?? []
  )
    .sort((a: any, b: any) => +new Date(b.create_at) - +new Date(a.create_at))
    .slice(0, 50)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)

  const openModal = (imageUrl: string) => {
    setCurrentImage(imageUrl)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentImage(null)
  }

  if (!findModelHistory.length) return <div className="py-4">No data</div>

  return (
    <PhotoProvider>
      <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3">
        {findModelHistory.map((item) => (
          <div
            key={item.id}
            className="group overflow-y-hidden relative flex cursor-pointer flex-col justify-between rounded-lg border"
          >
            <Image
              className="h-[25rem] w-full rounded-lg object-cover object-center transition-opacity duration-image"
              unoptimized
              src={item.url}
              alt="img"
              width={item.width}
              height={item.height}
            />

            <div className="absolute h-full w-full bg-gradient-to-t from-zinc-950 via-zinc-900/50" />
            <PhotoView src={item.url}>
              <div className="absolute p-2 bg-white top-4 right-4 rounded-full scale-[0.9] group-hover:scale-[1.4] transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#000000" viewBox="0 0 256 256">
                  <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
                </svg>
              </div>
            </PhotoView>

            {/* Rest of your UI components */}
            <div className="absolute text-white group-hover:translate-y-0 transition translate-y-[3.2rem] z-10 bottom-0 left-0 p-4">
              <div className="line-clamp-2 text-sm text-background">
                {item.prompt}
              </div>
              <div className="my-4 flex flex-col gap-4">
                <div className="text-[13px] leading-[20px] text-[rgb(142,141,145)]">
                  {formatDistance(new Date(item.create_at), new Date(), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              <div className="flex items-center justify-start mt-2">
                <MintToNFT url={item.url} model={model} imageId={item.id} size="sm" />
                <Link href={item.url} download>
                  <Button size="sm" variant="link" className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff" viewBox="0 0 256 256">
                      <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z" />
                    </svg>
                  </Button>
                </Link>
                <Button size="sm" variant="link" className="text-white edit" onClick={() => openModal(item.url)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff" viewBox="0 0 256 256">
                    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
                  </svg>
                </Button>
                <Button
                  size="sm"
                  variant="link"
                  className="text-white"
                  onClick={() => shareOnX(item.id, item.prompt)}
                >
                  <span className="i-ri-twitter-x-fill" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ImageEditorCanvas
        imageUrl={currentImage}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

    </PhotoProvider>
  )
}