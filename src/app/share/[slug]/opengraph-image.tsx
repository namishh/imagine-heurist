/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Created with Heurist Imagine'
export const size = {
  width: 1200,
  height: 630,
}

// https://d1dagtixswu0qn.cloudfront.net/imagine-08139a61a4.png

export default async function Image({ params }: { params: { slug: string } }) {
  let { slug } = params
  
  // back compatible
  if (!slug.includes(".")) slug = slug + ".png"

  // Font
  // const interSemiBold = fetch(
  //   new URL("./Inter-SemiBold.ttf", import.meta.url)
  // ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={`https://d1dagtixswu0qn.cloudfront.net/${slug}`}
          alt={slug}
        />
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      // fonts: [
      //   {
      //     name: "Inter",
      //     data: await interSemiBold,
      //     style: "normal",
      //     weight: 400,
      //   },
      // ],
    },
  )
}
