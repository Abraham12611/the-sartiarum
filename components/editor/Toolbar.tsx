'use client'

import type { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Quote, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight,
  Undo2, Redo2, Heading1, Heading2, Heading3, Minus,
} from 'lucide-react'

export function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  const activeEditor = editor

  const btn = (active: boolean, disabled = false): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 7,
    border: 'none',
    background: active ? '#eef2e9' : 'transparent',
    color: active ? '#4F6F3D' : '#4F5963',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'background 0.1s, color 0.1s',
  })

  const sep: React.CSSProperties = { width: 1, height: 18, background: '#ede8e1', margin: '0 4px', flexShrink: 0 }

  function setLink() {
    const url = window.prompt('Enter URL')
    if (!url) return
    activeEditor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        padding: '8px 12px',
        borderBottom: '1px solid #ede8e1',
        background: '#fff',
        flexShrink: 0,
      }}
    >
      {/* Headings */}
      <button title="Heading 1" style={btn(activeEditor.isActive('heading', { level: 1 }))}
        onClick={() => activeEditor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 size={14} />
      </button>
      <button title="Heading 2" style={btn(activeEditor.isActive('heading', { level: 2 }))}
        onClick={() => activeEditor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={14} />
      </button>
      <button title="Heading 3" style={btn(activeEditor.isActive('heading', { level: 3 }))}
        onClick={() => activeEditor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={14} />
      </button>

      <div style={sep} />

      {/* Marks */}
      <button title="Bold (Cmd+B)" style={btn(activeEditor.isActive('bold'))}
        onClick={() => activeEditor.chain().focus().toggleBold().run()}>
        <Bold size={14} />
      </button>
      <button title="Italic (Cmd+I)" style={btn(activeEditor.isActive('italic'))}
        onClick={() => activeEditor.chain().focus().toggleItalic().run()}>
        <Italic size={14} />
      </button>
      <button title="Underline (Cmd+U)" style={btn(activeEditor.isActive('underline'))}
        onClick={() => activeEditor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon size={14} />
      </button>

      <div style={sep} />

      {/* Lists */}
      <button title="Bullet list" style={btn(activeEditor.isActive('bulletList'))}
        onClick={() => activeEditor.chain().focus().toggleBulletList().run()}>
        <List size={14} />
      </button>
      <button title="Numbered list" style={btn(activeEditor.isActive('orderedList'))}
        onClick={() => activeEditor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={14} />
      </button>

      <div style={sep} />

      {/* Block */}
      <button title="Blockquote" style={btn(activeEditor.isActive('blockquote'))}
        onClick={() => activeEditor.chain().focus().toggleBlockquote().run()}>
        <Quote size={14} />
      </button>
      <button title="Horizontal rule" style={btn(false)}
        onClick={() => activeEditor.chain().focus().setHorizontalRule().run()}>
        <Minus size={14} />
      </button>

      <div style={sep} />

      {/* Align */}
      <button title="Align left" style={btn(activeEditor.isActive({ textAlign: 'left' }))}
        onClick={() => activeEditor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft size={14} />
      </button>
      <button title="Align center" style={btn(activeEditor.isActive({ textAlign: 'center' }))}
        onClick={() => activeEditor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter size={14} />
      </button>
      <button title="Align right" style={btn(activeEditor.isActive({ textAlign: 'right' }))}
        onClick={() => activeEditor.chain().focus().setTextAlign('right').run()}>
        <AlignRight size={14} />
      </button>

      <div style={sep} />

      {/* Link */}
      <button title="Insert link" style={btn(activeEditor.isActive('link'))} onClick={setLink}>
        <LinkIcon size={14} />
      </button>

      <div style={sep} />

      {/* History */}
      <button title="Undo (Cmd+Z)" style={btn(false, !activeEditor.can().undo())}
        onClick={() => activeEditor.chain().focus().undo().run()}>
        <Undo2 size={14} />
      </button>
      <button title="Redo (Cmd+Shift+Z)" style={btn(false, !activeEditor.can().redo())}
        onClick={() => activeEditor.chain().focus().redo().run()}>
        <Redo2 size={14} />
      </button>
    </div>
  )
}
