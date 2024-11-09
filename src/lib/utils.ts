import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the image ID from the mint URL
 * @param {string} url - Mint URL
 * @returns {string} Extracted image ID
 */
export const extractImageId = (url: string): string => {
  const parts = url.split('/')
  const lastPart = parts[parts.length - 1]
  // assuming the url is like xxxx.png?s3signature=yyy
  return lastPart.split('?')[0]
}

// Linear interpolation
export function lerp(a: number, b: number, n: number) {
  return (1 - n) * a + n * b
}

// Get distance between two points
export function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-US', options)
}
