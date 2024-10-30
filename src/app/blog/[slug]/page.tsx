// src/app/blog/[slug]/page.tsx
import { promises as fs } from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import matter from 'gray-matter'
import { Metadata } from 'next'
import Link from 'next/link'

import { slugify } from '@/lib/commonFn'

type Props = {
  params: { slug: string }
}
// 动态生成 metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  const postsDirectory = path.join(process.cwd(), 'src/content')
  const filePath = path.join(postsDirectory, `${slug}.md`)
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found | Heurist AI',
      description: "Sorry, we couldn't find the post you were looking for.",
    }
  }
  try {
    const fileContents = await fs.readFile(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    const excerpt = content.slice(0, 160).trim() // 使用内容的前160个字符作为描述

    return {
      title: `${data.title} | AI virtual idols`,
      description: data.description || excerpt,
      openGraph: {
        title: `${data.title} | AI virtual idols`,
        description: data.description || excerpt,
        type: 'article',
      },
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return {
      title: 'article not found | my blog',
      description: "Sorry, we couldn't find the article you were looking for.",
    }
  }
}
// 这个函数的作用是根据给定的 slug 获取对应的博客文章内容
// 它会遍历 src/content 目录下的所有文件，找到匹配的文章
// 如果找到匹配的文章，返回文章的元数据、内容和特色图片
// 如果没有找到匹配的文章，返回 null

async function getPostBySlug(slug: string) {
  const postsDirectory = path.join(process.cwd(), 'src/content')
  const filenames = await fs.readdir(postsDirectory)

  // 按日期排序文章
  const sortedFilenames = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(postsDirectory, filename)
      const fileContents = await fs.readFile(filePath, 'utf8')
      const { data } = matter(fileContents)
      return { filename, date: new Date(data.date) }
    }),
  ).then((files) => files.sort((a, b) => b.date.getTime() - a.date.getTime()))

  let prevPost = null
  let nextPost = null
  let currentIndex = -1

  for (let i = 0; i < sortedFilenames.length; i++) {
    const filename = sortedFilenames[i].filename
    const filePath = path.join(postsDirectory, filename)
    const fileContents = await fs.readFile(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    if (slugify(data.slug) === slug) {
      currentIndex = i
      if (i > 0) {
        const prevFilePath = path.join(
          postsDirectory,
          sortedFilenames[i - 1].filename,
        )
        const prevFileContents = await fs.readFile(prevFilePath, 'utf8')
        const { data: prevData } = matter(prevFileContents)
        prevPost = { title: prevData.title, slug: slugify(prevData.slug) }
      }
      if (i < sortedFilenames.length - 1) {
        const nextFilePath = path.join(
          postsDirectory,
          sortedFilenames[i + 1].filename,
        )
        const nextFileContents = await fs.readFile(nextFilePath, 'utf8')
        const { data: nextData } = matter(nextFileContents)
        nextPost = { title: nextData.title, slug: slugify(nextData.slug) }
      }
      return {
        data,
        content,
        featured_image: data.featured_image || null,
        prevPost,
        nextPost,
      }
    }
  }

  return null
}
const PostPage = async ({ params }: any) => {
  const { slug } = params
  const post = await getPostBySlug(slug)

  if (!post) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div>
          <Link className="hover:underline" href="/blog">
            &lt; Back to Blog
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Post Not Found</h1>
          <p className="mt-2">
            Sorry, we couldn't find the post you were looking for.
          </p>
        </div>
      </main>
    )
  }

  const { content, prevPost, nextPost } = post

  return (
    <main className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <article className="prose prose-xl prose-stone mb-12">
          <Link className="hover:underline" href="/blog">
            &lt; Back to Blog
          </Link>
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {prevPost && (
            <Link href={`/blog/${prevPost.slug}`} className="block">
              <div className="h-full rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg">
                <p className="mb-2 text-sm text-gray-500">Previous</p>
                <h3 className="text-xl font-semibold text-gray-800">
                  {prevPost.title}
                </h3>
              </div>
            </Link>
          )}
          {nextPost && (
            <Link href={`/blog/${nextPost.slug}`} className="block">
              <div className="h-full rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg">
                <p className="mb-2 text-right text-sm text-gray-500">Next</p>
                <h3 className="text-xl font-semibold text-gray-800">
                  {nextPost.title}
                </h3>
              </div>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}

export default PostPage

// 这个函数的作用是生成静态页面参数
// generateStaticParams 函数是 Next.js 中用于静态站点生成（SSG）的一个重要函数
// 它的主要目的是在构建时预先生成所有可能的动态路由参数

// 具体来说，这个函数做了以下几件事：
// 1. 读取 src/content 目录下的所有文件
// 2. 解析每个文件的 frontmatter 数据
// 3. 提取每篇博客文章的 slug
// 4. 返回一个包含所有 slug 的数组

// 这样做的好处是：
// - 提高性能：预先生成静态页面，减少服务器负载
// - 改善SEO：静态页面更容易被搜索引擎索引
// - 提升用户体验：静态页面加载速度更快

// 注意：这个函数返回的数组会被 Next.js 用来在构建时生成所有可能的静态路径
// 每个路径都会对应一个预渲染的 HTML 文件

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'src/content')
  const filenames = await fs.readdir(postsDirectory)
  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(postsDirectory, filename)
      const fileContents = await fs.readFile(filePath, 'utf8')
      const { data } = matter(fileContents)

      return {
        title: data.title || filename.replace(/\.md$/, ''),
        slug: data.slug,
      }
    }),
  )
  return posts.map((post) => ({
    slug: slugify(post.slug),
  }))
}
