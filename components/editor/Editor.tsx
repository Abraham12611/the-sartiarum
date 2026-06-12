'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count'
import FocusExtension from '@tiptap/extension-focus'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import { Toolbar } from './Toolbar'
import { BubbleMenuBar } from './BubbleMenuBar'
import { SlashMenu } from './SlashMenu'

interface EditorProps {
  content: unknown
  focusMode: boolean
  onUpdate: (content: unknown, wordCount: number) => void
  onSaveNow: () => void
}

export function Editor({ content, focusMode, onUpdate, onSaveNow }: EditorProps) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: { languageClassPrefix: 'language-' } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      CharacterCount,
      FocusExtension.configure({ className: 'has-focus', mode: 'deepest' }),
      Typography,
      Placeholder.configure({ placeholder: 'Start writing… or describe what you want in the Compose panel.' }),
    ],
    content: (content && Object.keys(content as object).length > 0 ? content : undefined) as any,
    editorProps: {
      attributes: { class: 'tiptap-editor', style: 'height: 100%; min-height: 400px;' },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      const words = editor.storage.characterCount.words()
      onUpdate(json, words)

      // Auto-save debounce 10s
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => { onSaveNow() }, 10000)
    },
    onBlur: () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      onSaveNow()
    },
  })

  useEffect(() => () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
  }, [])

  const wordCount = editor?.storage.characterCount.words() ?? 0
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden', position: 'relative' }}
      className={focusMode ? 'focus-mode' : ''}
    >
      {/* Toolbar */}
      <Toolbar editor={editor} />

      {/* Bubble menu on selection */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top-start' }}
          shouldShow={({ editor, view, state, from, to }) => {
            const { doc, selection } = state
            const { empty } = selection
            return !empty && view.hasFocus()
          }}
        >
          <BubbleMenuBar editor={editor} />
        </BubbleMenu>
      )}

      {/* Slash menu */}
      {editor && <SlashMenu editor={editor} />}

      {/* Editor content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <EditorContent editor={editor} style={{ height: '100%' }} />
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 64px',
          borderTop: '1px solid #ede8e1',
          fontSize: 12,
          color: '#9AA4A0',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <span>{wordCount.toLocaleString()} words · {readTime} min read</span>
      </div>
    </div>
  )
}
