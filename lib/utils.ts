import { clsx, type ClassValue } from 'clsx'
import { tailwindMerge as twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
