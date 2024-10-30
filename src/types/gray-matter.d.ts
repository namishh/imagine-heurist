declare module 'gray-matter' {
  function matter(
    content: string,
    options?: any,
  ): {
    data: any
    content: string
    excerpt?: string
  }
  export default matter
}
