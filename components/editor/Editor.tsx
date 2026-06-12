'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count'
import FocusExtension from '@tiptap/extension-focus'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import { Toolbar } from './Toolbar'
import { BubbleMenuWrapper } from './BubbleMenuWrapper'
import { SlashMenu } from './SlashMenu'

interface EditorProps {
  content: unknown
  focusMode: boolean
  onUpdate: (content: unknown, wordCount: number) => void
  onSaveNow: () => void
}

export function Editor({ content, focusMode, onUpdate, onSaveNow }: EditorProps) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

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
    onUpdate: ({ editor }) => {
      const json  = editor.getJSON()
      const words = editor.storage.characterCount.words()
      onUpdate(json, words)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => onSaveNow(), 10000)
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
  const readTime  = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div
      className={`tiptap-editor-wrap ${focusMode ? 'focus-mode' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden', position: 'relative' }}
    >
      <Toolbar editor={editor} />
      {editor && <BubbleMenuWrapper editor={editor} />}
      {editor && <SlashMenu editor={editor} />}
      <div className="tiptap-editor" style={{ flex: 1, overflowY: 'auto' }}>
        <EditorContent editor={editor} style={{ height: '100%' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 64px', borderTop: '1px solid #ede8e1', fontSize: 12, color: '#9AA4A0', background: '#fff', flexShrink: 0 }}>
        <span>{wordCount.toLocaleString()} words · {readTime} min read</span>
      </div>
    </div>
  )
}
