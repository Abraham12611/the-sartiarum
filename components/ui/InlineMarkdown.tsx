'use client'

import React from 'react'

/**
 * Lightweight inline markdown renderer.
 * Supports: **bold**, *italic*, `code`, [links](url), line breaks.
 * No external dependencies.
 */
export function InlineMarkdown({ text, style }: { text: string; style?: React.CSSProperties }) {
  const elements = parseInlineMarkdown(text)
  return <span style={style}>{elements}</span>
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  // Split by lines first to handle line breaks
  const lines = text.split('\n')

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) nodes.push(<br key={`br-${lineIdx}`} />)
    const lineNodes = parseLine(line, `l${lineIdx}`)
    nodes.push(...lineNodes)
  })

  return nodes
}

function parseLine(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  // Regex for: **bold**, *italic*, `code`, [text](url)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let i = 0

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const key = `${keyPrefix}-${i++}`

    if (match[2] !== undefined) {
      // **bold**
      nodes.push(
        <strong key={key} style={{ fontWeight: 600 }}>
          {match[2]}
        </strong>
      )
    } else if (match[3] !== undefined) {
      // *italic*
      nodes.push(
        <em key={key} style={{ fontStyle: 'italic' }}>
          {match[3]}
        </em>
      )
    } else if (match[4] !== undefined) {
      // `code`
      nodes.push(
        <code
          key={key}
          style={{
            background: '#f3f4f6',
            padding: '1px 5px',
            borderRadius: 4,
            fontSize: '0.9em',
            fontFamily: 'monospace',
          }}
        >
          {match[4]}
        </code>
      )
    } else if (match[5] !== undefined && match[6] !== undefined) {
      // [text](url)
      nodes.push(
        <a
          key={key}
          href={match[6]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#4F6F3D', textDecoration: 'underline' }}
        >
          {match[5]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}
