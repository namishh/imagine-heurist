'use client'

import { useEffect } from 'react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { formatDistance } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { useLocalStorage } from 'usehooks-ts'

import { usePartnerFreeMint } from '@/hooks/usePartnerFreeMint'
import { shareOnX } from '@/lib/share'
import { MintToNFT } from '@/modules/mintToNFT'

import 'react-photo-view/dist/react-photo-view.css'

import { Button } from '@/components/ui/button'

export default function History({ model }: { model: string }) {
  const { refreshPartnerNFTs } = usePartnerFreeMint()

  const [history] = useLocalStorage<any[]>('IMAGINE_HISTORY', [])

  // Run refreshPartnerNFTs once on mount
  useEffect(() => {
    refreshPartnerNFTs()
  }, [refreshPartnerNFTs])

  const findModelHistory: any[] = (
    history.find((item) => item.model === model)?.lists ?? []
  )
    .sort((a: any, b: any) => +new Date(b.create_at) - +new Date(a.create_at))
    .slice(0, 50)

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
            <div className="absolute h-full w-full bg-gradient-to-t from-zinc-950 via-zinc-900/50"></div>
            <div className='absolute text-white group-hover:translate-y-0 transition translate-y-[3.2rem] z-10 bottom-0 left-0 p-4'>
              <div className="mb-1">Prompt:</div>
              <div className="line-clamp-3 text-sm text-background">
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
                  <MintToNFT
                    url={item.url}
                    model={model}
                    imageId={item.id}
                    size="sm"
                  />
                  <Link href={item.url} download>
                    <Button size="sm" variant="link" className='text-white'>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff" viewBox="0 0 256 256"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"></path></svg>
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="link"
                    className='text-white'
                    asChild
                  >
                    <PhotoView src={item.url}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff" viewBox="0 0 256 256"><path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"></path></svg>
                    </PhotoView>
                  </Button>
                  <Button
                    size="sm"
                    variant="link"
                    className='text-white'
                    onClick={() => shareOnX(item.id, item.prompt)}
                  >
                    <span className="i-ri-twitter-x-fill" />
                  </Button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </PhotoProvider>
  )
}
