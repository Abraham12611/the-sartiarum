'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { BubbleMenuBar } from './BubbleMenuBar'

/**
 * Custom floating bubble menu — replaces the removed BubbleMenu export
 * from @tiptap/react v3. Positions above the current text selection
 * using the editor view's coordsAtPos API.
 */
export function BubbleMenuWrapper({ editor }: { editor: Editor }) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const update = useCallback(() => {
    if (!editor?.view) return
    const { empty } = editor.state.selection
    if (empty || !editor.view.hasFocus()) { setVisible(false); return }

    try {
      const { from, to } = editor.state.selection
      const fromCoords = editor.view.coordsAtPos(from)
      const toCoords   = editor.view.coordsAtPos(to)
      const container  = editor.view.dom.closest('.tiptap-editor-wrap') ?? editor.view.dom
      const rect       = container.getBoundingClientRect()

      setPos({
        top:  fromCoords.top - rect.top - 52,
        left: (fromCoords.left + toCoords.left) / 2 - rect.left,
      })
      setVisible(true)
    } catch {
      setVisible(false)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return
    editor.on('selectionUpdate', update)
    editor.on('focus', update)
    editor.on('blur', () => setVisible(false))
    return () => {
      editor.off('selectionUpdate', update)
      editor.off('focus', update)
    }
  }, [editor, update])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: Math.max(8, pos.top),
        left: pos.left,
        transform: 'translateX(-50%)',
        zIndex: 200,
        pointerEvents: 'auto',
      }}
    >
      <BubbleMenuBar editor={editor} />
    </div>
  )
}
