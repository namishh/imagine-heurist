export const detectMobile = (userAgent: string) => {
  //  判断设备类型的逻辑可以根据实际情况修改

  const isMobile = /Mobi|Android/i.test(userAgent)
  return isMobile
}
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // 将空格替换为连字符
    .replace(/[^\w\-]+/g, '') // 移除非单词字符（除了连字符）
    .replace(/\-\-+/g, '-') // 将多个连字符替换为单个连字符
}
