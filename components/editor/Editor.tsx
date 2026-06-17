'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
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

export interface WriterEditorHandle {
  getJSON: () => unknown
  getSelectionText: () => string
  getLastSelectionText: () => string
  getPlainText: () => string
  insertAtCursor: (text: string) => void
  replaceSelection: (text: string) => void
  replaceLastSelection: (text: string) => void
  focus: () => void
}

export const Editor = forwardRef<WriterEditorHandle, EditorProps>(
  function EditorComponent({ content, focusMode, onUpdate, onSaveNow }, ref) {
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
    const lastSelectionTextRef = useRef('')
    const lastSelectionRangeRef = useRef<{ from: number; to: number } | null>(null)

    const editor = useEditor({
      extensions: [
        StarterKit.configure({ codeBlock: { languageClassPrefix: 'language-' } }),
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
        CharacterCount,
        FocusExtension.configure({ className: 'has-focus', mode: 'deepest' }),
        Typography,
        Placeholder.configure({
          placeholder: 'Start writing… or describe what you want in the Compose panel.',
        }),
      ],
      content: (content && Object.keys(content as object).length > 0 ? content : undefined) as any,
      onUpdate: ({ editor: current }) => {
        const json = current.getJSON()
        const words = current.storage.characterCount.words()
        onUpdate(json, words)
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(() => onSaveNow(), 10000)
      },
      onSelectionUpdate: ({ editor: current }) => {
        const { from, to } = current.state.selection
        if (from === to) return
        lastSelectionRangeRef.current = { from, to }
        lastSelectionTextRef.current = current.state.doc.textBetween(from, to, ' ')
      },
      onBlur: () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        onSaveNow()
      },
    })

    useEffect(
      () => () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      },
      [],
    )

    useImperativeHandle(ref, () => ({
      getJSON: () => editor?.getJSON() ?? {},
      getSelectionText: () => {
        if (!editor) return ''
        const { from, to } = editor.state.selection
        if (from === to) return ''
        return editor.state.doc.textBetween(from, to, ' ')
      },
      getLastSelectionText: () => lastSelectionTextRef.current,
      getPlainText: () => editor?.getText() ?? '',
      insertAtCursor: (text: string) => {
        if (!editor || !text.trim()) return
        editor.chain().focus().insertContent(text).run()
      },
      replaceSelection: (text: string) => {
        if (!editor || !text.trim()) return
        const { from, to } = editor.state.selection
        if (from === to) {
          editor.chain().focus().insertContent(text).run()
          return
        }
        editor.chain().focus().insertContentAt({ from, to }, text).run()
      },
      replaceLastSelection: (text: string) => {
        if (!editor || !text.trim()) return
        const range = lastSelectionRangeRef.current
        if (!range || range.from === range.to) {
          editor.chain().focus().insertContent(text).run()
          return
        }
        editor.chain().focus().insertContentAt(range, text).run()
      },
      focus: () => {
        editor?.chain().focus().run()
      },
    }), [editor])

    const wordCount = editor?.storage.characterCount.words() ?? 0
    const readTime = Math.max(1, Math.ceil(wordCount / 200))

    return (
      <div
        className={`tiptap-editor-wrap ${focusMode ? 'focus-mode' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Toolbar editor={editor} />
        {editor && <BubbleMenuWrapper editor={editor} />}
        {editor && <SlashMenu editor={editor} />}
        <div className="tiptap-editor" style={{ flex: 1, overflowY: 'auto' }}>
          <EditorContent editor={editor} style={{ height: '100%' }} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 64px',
            borderTop: '1px solid #ede8e1',
            fontSize: 12,
            color: '#9AA4A0',
            background: '#fff',
            flexShrink: 0,
          }}
        >
          <span>
            {wordCount.toLocaleString()} words · {readTime} min read
          </span>
        </div>
      </div>
    )
  },
)
