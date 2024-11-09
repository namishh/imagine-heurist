import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Image from 'next/image'
import Link from 'next/link'

import { formatDate } from '@/lib/utils'

export const generateMetadata = () => {
  return {
    title: 'Blog | Heurist Imagine',
    description:
      'AI image generation tutorials, prompting tips, educational contents about Stable Diffusion, Flux, and open source AI.',
  }
}

export default async function BlogIndexPage() {
  const postsDirectory = path.join(process.cwd(), 'src/content')
  const filenames = await fs.readdir(postsDirectory)

  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(postsDirectory, filename)
      const fileContents = await fs.readFile(filePath, 'utf8')
      const { data } = matter(fileContents)
      const { slug, date, featured_image = '', description = '' } = data
      // 使用 data 中的字段，如果不存在则使用默认值或从文件名生成
      const title = data.title || filename.replace(/\.md$/, '')

      return {
        slug,
        title,
        date: formatDate(date),
        description,
        featured_image,
      }
    }),
  )

  // 按日期排序，最新的文章在前
  posts.sort((a, b) => {
    if (!a.date) return 1 // 没有日期的文章排在最后
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <main>
      <div className="mx-auto max-w-5xl px-6 pb-20 md:max-w-[1440px]">
        <div className="my-10 text-5xl font-semibold">Blog</div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              className="rounded-2xl border p-4 shadow-[0_1px_6px_#00000014]"
            >
              <div className="mb-4 flex h-48 overflow-hidden rounded-lg">
                <Image
                  src={post.featured_image}
                  width={0}
                  height={212}
                  sizes="100vw"
                  className="flex-1 rounded-lg object-cover transition-transform duration-300 hover:scale-[1.03] hover:opacity-80"
                  alt={post.title}
                />
              </div>

              <div className="mb-1 text-[18px] font-semibold leading-[1.33] -tracking-[0.36px]">
                {post.title}
              </div>
              <div className="line-clamp-3 text-[16px] leading-[1.5] text-[#424149]/90">
                {post.description}
              </div>
              <div className="mt-4 text-[13px] leading-5 text-[#8e8d91]">
                {post.date}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
