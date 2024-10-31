// src/app/blog/page.tsx
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Image from 'next/image'
import Link from 'next/link'

export const generateMetadata = () => {
  return {
    title: 'Blog | Heurist Imagine',
    description: 'AI image generation tutorials, prompting tips, educational contents about Stable Diffusion, Flux, and open source AI.',
  }
}
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-US', options)
}

const BlogIndexPage = async () => {
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
    <main className="container m-auto px-20 py-20">
      <div className="">
        <h1 className="mb-2 text-center text-2xl font-bold">Blog Posts</h1>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <Link href={`/blog/${post.slug}`}>
                <article className="p-5">
                  <div className="img-box">
                    {post.featured_image ? (
                      <Image
                        src={post.featured_image}
                        width={0}
                        height={200}
                        sizes="100vw"
                        className="h-40 w-full object-cover"
                        alt={post.title}
                      />
                    ) : (
                      <div className="h-40 w-full bg-slate-300"></div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold">{post.title}</h2>
                  <div className="">
                    <span itemProp="datePublished">{post.date}</span>
                  </div>
                  <p className="text">{post.description}</p>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

export default BlogIndexPage
