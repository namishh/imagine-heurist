import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

type Props = Promise<{ slug: string }>

export default async function Share(props: { params: Props }) {
  const params = await props.params
  let { slug } = params

  // back compatible
  if (!slug.includes('.')) slug = slug + '.png'

  const url = `https://d1dagtixswu0qn.cloudfront.net/${slug}`

  return (
    <div className="container py-16 pb-20 text-center">
      <div className="mb-2 flex justify-center">
        <Image
          className="rounded-md"
          src={url}
          alt="imagine"
          width={500}
          height={500}
        />
      </div>

      <div className="flex justify-center gap-2">
        <Link href="/">
          <Button variant="secondary" size="sm">
            Redirect to Index
          </Button>
        </Link>
        <Link href={url} download>
          <Button size="sm" variant="outline">
            Download
          </Button>
        </Link>
      </div>
    </div>
  )
}
