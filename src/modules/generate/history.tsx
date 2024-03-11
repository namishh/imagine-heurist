'use client'

import { formatDistance } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { useLocalStorage } from 'usehooks-ts'

import { Button } from '@/components/ui/button'

export default function History({ model }: { model: string }) {
  const [history] = useLocalStorage<any[]>('IMAGINE_HISTORY', [])

  const findModelHistory: any[] = (
    history.find((item) => item.model === model)?.lists ?? []
  )
    .sort((a: any, b: any) => +new Date(b.create_at) - +new Date(a.create_at))
    .slice(0, 10)

  if (!findModelHistory.length) return <div className="py-4">No data</div>

  return (
    <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2">
      {findModelHistory.map((item) => (
        <div
          key={item.id}
          className="group flex cursor-pointer flex-col justify-between rounded-lg border p-3 shadow md:p-4"
        >
          <div>
            <Image
              className="mb-4 aspect-[2/1] w-full rounded-lg object-cover object-center transition-opacity duration-image group-hover:opacity-80"
              src={item.url}
              alt="img"
              width={item.width}
              height={item.height}
            />
            <div className="mb-1 md:text-lg">Prompt:</div>
            <div className="line-clamp-3 text-sm text-muted-foreground md:text-base">
              {item.prompt}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Link href={item.url} download>
                <Button size="sm" variant="outline">
                  Download
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const path = item.url.split('/')
                  const name = path[path.length - 1].split('.')[0]
                  const intentUrl =
                    'https://twitter.com/intent/tweet?text=' +
                    encodeURIComponent(
                      'My latest #AIart creation with Imagine #Heurist 🎨',
                    ) +
                    '&url=' +
                    encodeURIComponent(
                      `https://imagine.heurist.ai/share/${name}`,
                    )
                  // "&via=" +
                  // encodeURIComponent("asf") +
                  // "&hashtags=" +
                  // encodeURIComponent("Heurist");
                  window.open(intentUrl, '_blank', 'width=550,height=420')
                }}
              >
                <span className="i-ri-twitter-x-fill" />
              </Button>
            </div>
            <div className="text-[13px] leading-[20px] text-[rgb(142,141,145)]">
              {formatDistance(new Date(item.create_at), new Date(), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}