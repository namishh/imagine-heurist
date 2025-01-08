'use client'

import { useEffect } from 'react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import Image from 'next/image'
import { useLocalStorage } from 'usehooks-ts'

import { usePartnerFreeMint } from '@/hooks/usePartnerFreeMint'
import { shareOnX } from '@/lib/share'

import 'react-photo-view/dist/react-photo-view.css'
import { Button } from '@/components/ui/button'

export default function Edits({ model }: { model: string }) {
  const { refreshPartnerNFTs } = usePartnerFreeMint()
  const [edits] = useLocalStorage<any[]>('EDIT_HISTORY', [])

  useEffect(() => {
    refreshPartnerNFTs()
  }, [refreshPartnerNFTs])

  console.log(edits)

  const findModelHistory: any[] = edits.find((item) => item.name === model)?.imgs ?? []
  findModelHistory.sort((a: any, b: any) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime());

  if (!findModelHistory.length) return <div className="py-4">No data</div>

  return (
    <PhotoProvider>
      <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3">
        {findModelHistory.map((item, j) => (
          <div
            key={j}
            className="group overflow-y-hidden relative flex cursor-pointer flex-col justify-between rounded-lg border"
          >
            <Image
              className="h-[25rem] w-full rounded-lg object-cover object-center transition-opacity duration-image"
              unoptimized
              src={item.base64}
              width = {item.width}
              height = {item.height}
              alt="img"
            />

            <div className="absolute h-full w-full bg-gradient-to-t from-zinc-950 via-zinc-900/50" />
            <PhotoView src={item.base64}>
              <div className="absolute p-2 bg-white top-4 right-4 rounded-full scale-[0.9] group-hover:scale-[1.4] transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#000000" viewBox="0 0 256 256">
                  <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
                </svg>
              </div>
            </PhotoView>
          </div>
        ))}
      </div>

    </PhotoProvider>
  )
}