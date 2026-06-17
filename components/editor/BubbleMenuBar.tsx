'use client'

import type { Editor } from '@tiptap/react'
import { Bold, Italic, Underline as UnderlineIcon, RefreshCw, Minus, Expand } from 'lucide-react'

type BubbleAiAction = 'rewrite' | 'summarize' | 'expand'

export function BubbleMenuBar({
  editor,
  onAiAction,
}: {
  editor: Editor
  onAiAction?: (action: BubbleAiAction) => void
}) {
  const btn = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 6,
    border: 'none',
    background: active ? '#eef2e9' : 'transparent',
    color: active ? '#4F6F3D' : '#141516',
    cursor: 'pointer',
    fontSize: 12,
    transition: 'background 0.1s',
  })

  const sep: React.CSSProperties = { width: 1, height: 16, background: '#ede8e1', margin: '0 3px', flexShrink: 0 }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '4px 8px',
        background: '#fff',
        border: '1px solid #ede8e1',
        borderRadius: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      }}
    >
      {/* Format */}
      <button style={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
        <Bold size={13} />
      </button>
      <button style={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
        <Italic size={13} />
      </button>
      <button style={btn(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
        <UnderlineIcon size={13} />
      </button>

      <div style={sep} />

      {/* AI action stubs (wired in Day 3) */}
      <button
        onMouseDown={(event) => event.preventDefault()}
        style={{ ...btn(false), gap: 4, paddingInline: 8, fontSize: 12, fontWeight: 600, width: 'auto', color: '#4F5963' }}
        title="Rewrite selection (Day 3)"
        onClick={() => onAiAction?.('rewrite')}
      >
        <RefreshCw size={12} /> Rewrite
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        style={{ ...btn(false), gap: 4, paddingInline: 8, fontSize: 12, fontWeight: 600, width: 'auto', color: '#4F5963' }}
        title="Summarize selection (Day 3)"
        onClick={() => onAiAction?.('summarize')}
      >
        <Minus size={12} /> Summarize
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        style={{ ...btn(false), gap: 4, paddingInline: 8, fontSize: 12, fontWeight: 600, width: 'auto', color: '#4F5963' }}
        title="Expand selection (Day 3)"
        onClick={() => onAiAction?.('expand')}
      >
        <Expand size={12} /> Expand
      </button>
    </div>
  )
}
