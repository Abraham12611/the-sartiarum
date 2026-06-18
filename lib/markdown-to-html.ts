import { marked } from 'marked'

/**
 * Convert markdown text to HTML suitable for Tiptap's insertContent().
 * Handles headings, bold, italic, lists, code blocks, links, etc.
 */
export function markdownToHtml(markdown: string): string {
  // Configure marked for clean output
  marked.setOptions({
    gfm: true,
    breaks: true,
  })

  const html = marked.parse(markdown)
  // marked.parse returns string | Promise<string> depending on config
  // With synchronous config (no async extensions), it's always a string
  return html as string
}
