'use client'

import type { Editor } from '@tiptap/react'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, Heading1, Heading2, Heading3, Minus } from 'lucide-react'

export function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  const btn = (active: boolean, disabled = false): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 7, border: 'none', background: active ? '#eef2e9' : 'transparent', color: active ? '#4F6F3D' : '#4F5963', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 })
  const sep: React.CSSProperties = { width: 1, height: 18, background: '#ede8e1', margin: '0 4px', flexShrink: 0 }
  function setLink() { const url = window.prompt('Enter URL'); if (!url) return; editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run() }
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, padding: '8px 12px', borderBottom: '1px solid #ede8e1', background: '#fff', flexShrink: 0 }}>
      <button title="H1" style={btn(editor.isActive('heading', { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={14} /></button>
      <button title="H2" style={btn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={14} /></button>
      <button title="H3" style={btn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={14} /></button>
      <div style={sep} />
      <button title="Bold" style={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></button>
      <button title="Italic" style={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></button>
      <button title="Underline" style={btn(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={14} /></button>
      <div style={sep} />
      <button title="Bullet list" style={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={14} /></button>
      <button title="Numbered list" style={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></button>
      <div style={sep} />
      <button title="Blockquote" style={btn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={14} /></button>
      <button title="Divider" style={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={14} /></button>
      <div style={sep} />
      <button title="Align left" style={btn(editor.isActive({ textAlign: 'left' }))} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={14} /></button>
      <button title="Align center" style={btn(editor.isActive({ textAlign: 'center' }))} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={14} /></button>
      <button title="Align right" style={btn(editor.isActive({ textAlign: 'right' }))} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={14} /></button>
      <div style={sep} />
      <button title="Link" style={btn(editor.isActive('link'))} onClick={setLink}><LinkIcon size={14} /></button>
      <div style={sep} />
      <button title="Undo" style={btn(false, !editor.can().undo())} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={14} /></button>
      <button title="Redo" style={btn(false, !editor.can().redo())} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={14} /></button>
    </div>
  )
}
