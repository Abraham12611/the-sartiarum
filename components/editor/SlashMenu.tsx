'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus } from 'lucide-react'

const COMMANDS = [
  { id: 'h1', label: 'Heading 1', description: 'Large section heading', icon: <Heading1 size={16} />, action: (e: Editor) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { id: 'h2', label: 'Heading 2', description: 'Medium section heading', icon: <Heading2 size={16} />, action: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: 'h3', label: 'Heading 3', description: 'Small section heading', icon: <Heading3 size={16} />, action: (e: Editor) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { id: 'bullet', label: 'Bullet list', description: 'Unordered list', icon: <List size={16} />, action: (e: Editor) => e.chain().focus().toggleBulletList().run() },
  { id: 'ordered', label: 'Numbered list', description: 'Ordered list', icon: <ListOrdered size={16} />, action: (e: Editor) => e.chain().focus().toggleOrderedList().run() },
  { id: 'quote', label: 'Quote', description: 'Block quotation', icon: <Quote size={16} />, action: (e: Editor) => e.chain().focus().toggleBlockquote().run() },
  { id: 'divider', label: 'Divider', description: 'Horizontal rule', icon: <Minus size={16} />, action: (e: Editor) => e.chain().focus().setHorizontalRule().run() },
]

export function SlashMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)

  const filtered = COMMANDS.filter(c => query === '' || c.label.toLowerCase().includes(query.toLowerCase()))
  const close = useCallback(() => { setOpen(false); setQuery(''); setSelectedIdx(0) }, [])

  useEffect(() => {
    if (!editor) return
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') { close(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); return }
      if (e.key === 'Enter') {
        e.preventDefault()
        const cmd = filtered[selectedIdx]
        if (cmd) { const { from } = editor.state.selection; editor.chain().focus().deleteRange({ from: from - query.length - 1, to: from }).run(); cmd.action(editor); close() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, filtered, selectedIdx, query, editor, close])

  useEffect(() => {
    if (!editor) return
    const unsub = editor.on('update', () => {
      const { state } = editor
      const { from } = state.selection
      const text = state.doc.textBetween(Math.max(0, from - 30), from, '\n', '\0')
      const m = text.match(/\/(\w*)$/)
      if (m) {
        setQuery(m[1]); setOpen(true); setSelectedIdx(0)
        const coords = editor.view.coordsAtPos(from)
        const container = editor.view.dom.closest('.tiptap-editor-wrap') ?? editor.view.dom
        const rect = container.getBoundingClientRect()
        setPos({ top: coords.bottom - rect.top + 8, left: coords.left - rect.left })
      } else { close() }
    })
    return () => { unsub }
  }, [editor, close])

  if (!open || filtered.length === 0 || !pos) return null

  return (
    <div className="slash-menu" style={{ top: pos.top, left: Math.max(0, pos.left) }}>
      {filtered.map((cmd, i) => (
        <button key={cmd.id} onClick={() => { const { from } = editor.state.selection; editor.chain().focus().deleteRange({ from: from - query.length - 1, to: from }).run(); cmd.action(editor); close() }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '9px 14px', border: 'none', background: i === selectedIdx ? '#f0ede8' : 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
          <span style={{ color: '#4F6F3D', display: 'flex' }}>{cmd.icon}</span>
          <div><p style={{ fontSize: 13.5, fontWeight: 600, color: '#141516', margin: 0 }}>{cmd.label}</p><p style={{ fontSize: 11.5, color: '#9AA4A0', margin: 0 }}>{cmd.description}</p></div>
        </button>
      ))}
    </div>
  )
}
