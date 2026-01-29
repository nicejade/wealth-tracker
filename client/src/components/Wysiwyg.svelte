<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { Editor } from '@tiptap/core'
  import StarterKit from '@tiptap/starter-kit'
  import Highlight from '@tiptap/extension-highlight'
  import Underline from '@tiptap/extension-underline'
  import Subscript from '@tiptap/extension-subscript'
  import Superscript from '@tiptap/extension-superscript'
  import TextStyle from '@tiptap/extension-text-style'
  import FontFamily from '@tiptap/extension-font-family'
  import { Color } from '@tiptap/extension-color'
  import Bold from '@tiptap/extension-bold'
  import Link from '@tiptap/extension-link'
  import Image from '@tiptap/extension-image'
  import Table from '@tiptap/extension-table'
  import TableRow from '@tiptap/extension-table-row'
  import TableHeader from '@tiptap/extension-table-header'
  import TableCell from '@tiptap/extension-table-cell'
  import { Markdown } from 'tiptap-markdown'
  import SvgIcon from './SvgIcon.svelte'
  import { trackEvent } from '../helper/analytics'

  // Props
  export let content = ''
  export let placeholder = 'Start writing...'
  export let editable = true
  export let class_ = ''
  export let minHeight = '200px'
  export let maxHeight = '400px'

  // Event dispatcher
  const dispatch = createEventDispatcher()

  // Component state
  let editor
  let editorElement
  let isInitialized = false
  let componentId = `wysiwyg`

  // Toolbar button states
  let toolbarStates = {
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    subscript: false,
    superscript: false,
    highlight: false,
    code: false,
    link: true,
  }

  // Custom extensions
  const FontSizeTextStyle = TextStyle.extend({
    addAttributes() {
      return {
        fontSize: {
          default: null,
          parseHTML: (element) => element.style.fontSize,
          renderHTML: (attributes) => {
            if (!attributes.fontSize) {
              return {}
            }
            return { style: 'font-size: ' + attributes.fontSize }
          },
        },
      }
    },
  })

  const CustomBold = Bold.extend({
    renderHTML({ HTMLAttributes }) {
      return ['span', { ...HTMLAttributes, style: 'font-weight: bold;' }, 0]
    },
    excludes: '',
  })

  // Initialize editor
  function initializeEditor() {
    if (!editorElement || isInitialized) return

    try {
      editor = new Editor({
        element: editorElement,
        extensions: [
          StarterKit.configure({
            bold: false,
          }),
          CustomBold,
          Highlight,
          Underline,
          Subscript,
          Superscript,
          TextStyle,
          FontSizeTextStyle,
          Color,
          FontFamily,
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              class: 'underline underline-offset-4 hover:decoration-brand decoration-link',
            },
          }),
          Image.configure({
            HTMLAttributes: {
              class: 'max-w-full h-auto rounded-lg',
            },
          }),
          Table.configure({
            resizable: true,
            HTMLAttributes: {
              class: 'border-collapse border border-gray-300 dark:border-gray-600',
            },
          }),
          TableRow,
          TableHeader.configure({
            HTMLAttributes: {
              class:
                'border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 font-semibold',
            },
          }),
          TableCell.configure({
            HTMLAttributes: {
              class: 'border border-gray-300 dark:border-gray-600 px-3 py-2',
            },
          }),
          Markdown.configure({
            html: true, // Allow HTML input/output
            tightLists: true, // No <p> inside <li> in markdown output
            tightListClass: 'tight', // Add class to <ul> allowing you to remove <p> margins when tight
            bulletListMarker: '-', // <li> prefix in markdown output
            linkify: false, // Create links from "https://..." text
            breaks: false, // New lines (\n) in markdown input are converted to <br>
            transformPastedText: true, // Allow to paste markdown text in the editor
            transformCopiedText: true, // Copied text is transformed to markdown
          }),
        ],
        content: content,
        editable: editable,
        editorProps: {
          attributes: {
            class:
              'format lg:format-lg dark:format-invert focus:outline-none format-blue max-w-none prose prose-base mx-auto focus:outline-none',
            style: `min-height: ${minHeight}; max-height: ${maxHeight}; overflow-y: auto;`,
          },
        },
        onUpdate: ({ editor }) => {
          const html = editor.getHTML()
          content = html
          dispatch('update', { content: html, editor })
          updateToolbarStates()
        },
        onSelectionUpdate: ({ editor }) => {
          updateToolbarStates()
          dispatch('selectionUpdate', { editor })
        },
        onFocus: ({ editor }) => {
          dispatch('focus', { editor })
        },
        onBlur: ({ editor }) => {
          dispatch('blur', { editor })
        },
      })

      isInitialized = true
      updateToolbarStates()
      dispatch('ready', { editor })
    } catch (error) {
      console.error('Failed to initialize WYSIWYG editor:', error)
      dispatch('error', { error })
    }
  }

  // Update toolbar button states
  function updateToolbarStates() {
    if (!editor) return

    toolbarStates = {
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
      subscript: editor.isActive('subscript'),
      superscript: editor.isActive('superscript'),
      highlight: editor.isActive('highlight'),
      code: editor.isActive('code'),
      link: editor.isActive('link'),
    }
  }

  // Toolbar actions
  const toolbarActions = {
    toggleBold: () => editor?.chain().focus().toggleBold().run(),
    toggleItalic: () => editor?.chain().focus().toggleItalic().run(),
    toggleUnderline: () => editor?.chain().focus().toggleUnderline().run(),
    toggleStrike: () => editor?.chain().focus().toggleStrike().run(),
    toggleSubscript: () => editor?.chain().focus().toggleSubscript().run(),
    toggleSuperscript: () => editor?.chain().focus().toggleSuperscript().run(),
    toggleHighlight: () => {
      const isHighlighted = editor?.isActive('highlight')
      editor
        ?.chain()
        .focus()
        .toggleHighlight({
          color: isHighlighted ? undefined : '#ffc078',
        })
        .run()
    },
    toggleCode: () => editor?.chain().focus().toggleCode().run(),
    setFontSize: (size) => editor?.chain().focus().setMark('textStyle', { fontSize: size }).run(),
    setColor: (color) => editor?.chain().focus().setColor(color).run(),
    resetColor: () => editor?.commands.unsetColor(),
    setFontFamily: (family) => editor?.chain().focus().setFontFamily(family).run(),
    toggleLink: () => {
      const isActive = editor?.isActive('link')
      if (isActive) {
        editor?.chain().focus().unsetLink().run()
      } else {
        const url = window.prompt('Enter URL:')
        if (url) {
          editor?.chain().focus().setLink({ href: url }).run()
        }
      }
    },
    insertImage: () => {
      const url = window.prompt('Enter image URL:')
      if (url) {
        editor?.chain().focus().setImage({ src: url }).run()
      }
    },
    insertTable: () => {
      editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    },
    deleteTable: () => editor?.chain().focus().deleteTable().run(),
    addColumnBefore: () => editor?.chain().focus().addColumnBefore().run(),
    addColumnAfter: () => editor?.chain().focus().addColumnAfter().run(),
    deleteColumn: () => editor?.chain().focus().deleteColumn().run(),
    addRowBefore: () => editor?.chain().focus().addRowBefore().run(),
    addRowAfter: () => editor?.chain().focus().addRowAfter().run(),
    deleteRow: () => editor?.chain().focus().deleteRow().run(),
    toggleHeaderColumn: () => editor?.chain().focus().toggleHeaderColumn().run(),
    toggleHeaderRow: () => editor?.chain().focus().toggleHeaderRow().run(),
    toggleHeaderCell: () => editor?.chain().focus().toggleHeaderCell().run(),
    mergeCells: () => editor?.chain().focus().mergeCells().run(),
    splitCell: () => editor?.chain().focus().splitCell().run(),
    // Markdown actions
    importMarkdown: () => {
      const markdown = window.prompt('Enter Markdown text:')
      if (markdown) {
        editor?.commands.setContent(markdown)
      }
    },
    exportMarkdown: () => {
      const markdown = editor?.storage.markdown.getMarkdown()
      if (markdown) {
        trackEvent('insight-export-markdown')
        // Create a downloadable file
        const blob = new Blob([markdown], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'document.md'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    },
    copyMarkdown: () => {
      const markdown = editor?.storage.markdown.getMarkdown()
      if (markdown && navigator.clipboard) {
        navigator.clipboard
          .writeText(markdown)
          .then(() => {
            // You could show a toast notification here
            console.log('Markdown copied to clipboard')
          })
          .catch((err) => {
            console.error('Failed to copy markdown:', err)
          })
      }
    },
  }

  // Lifecycle
  onMount(() => {
    initializeEditor()

    // Add click outside listener with capture phase for better event handling
    document.addEventListener('click', handleClickOutside, true)

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  })

  onDestroy(() => {
    if (editor) {
      editor.destroy()
      editor = null
      isInitialized = false
    }
  })

  // Reactive statements
  $: if (editor && content !== editor.getHTML()) {
    editor.commands.setContent(content, false)
  }

  $: if (editor && editor.isEditable !== editable) {
    editor.setEditable(editable)
  }

  // Public methods
  export function getEditor() {
    return editor
  }

  export function getContent() {
    return editor?.getHTML() || ''
  }

  export function setContent(newContent) {
    if (editor) {
      editor.commands.setContent(newContent, false)
      content = newContent
    }
  }

  export function focus() {
    editor?.commands.focus()
  }

  export function blur() {
    editor?.commands.blur()
  }

  // Markdown methods
  export function getMarkdown() {
    return editor?.storage.markdown.getMarkdown() || ''
  }

  export function setMarkdown(markdown) {
    if (editor) {
      editor.commands.setContent(markdown, false)
      content = editor.getHTML()
    }
  }

  // Dropdown states
  let showFontSizeDropdown = false
  let showColorDropdown = false
  let showFontFamilyDropdown = false
  let showTableDropdown = false
  let showMarkdownDropdown = false
  let customColor = '#e66465'

  // Configuration data
  const fontSizes = [
    { value: '12px', label: '12px (Tiny)', class: 'text-xs' },
    { value: '14px', label: '14px (Small)', class: 'text-sm' },
    { value: '16px', label: '16px (Default)', class: 'text-base' },
    { value: '18px', label: '18px (Lead)', class: 'text-lg' },
    { value: '24px', label: '24px (Large)', class: 'text-2xl' },
    { value: '36px', label: '36px (Huge)', class: 'text-4xl' },
  ]

  const colorPalette = [
    { hex: '#1A56DB', name: 'Blue' },
    { hex: '#0E9F6E', name: 'Green' },
    { hex: '#FACA15', name: 'Yellow' },
    { hex: '#F05252', name: 'Red' },
    { hex: '#FF8A4C', name: 'Orange' },
    { hex: '#0694A2', name: 'Teal' },
    { hex: '#B4C6FC', name: 'Light indigo' },
    { hex: '#8DA2FB', name: 'Indigo' },
    { hex: '#5145CD', name: 'Purple' },
    { hex: '#771D1D', name: 'Brown' },
    { hex: '#FCD9BD', name: 'Light orange' },
    { hex: '#99154B', name: 'Bordo' },
    { hex: '#7E3AF2', name: 'Dark Purple' },
    { hex: '#CABFFD', name: 'Light' },
    { hex: '#D61F69', name: 'Dark Pink' },
    { hex: '#F8B4D9', name: 'Pink' },
    { hex: '#F6C196', name: 'Cream' },
    { hex: '#A4CAFE', name: 'Light Blue' },
    { hex: '#B43403', name: 'Orange Brown' },
    { hex: '#FCE96A', name: 'Light Yellow' },
    { hex: '#1E429F', name: 'Navy Blue' },
    { hex: '#768FFD', name: 'Light Purple' },
    { hex: '#BCF0DA', name: 'Light Green' },
    { hex: '#EBF5FF', name: 'Sky Blue' },
    { hex: '#16BDCA', name: 'Cyan' },
    { hex: '#E74694', name: 'Pink' },
    { hex: '#83B0ED', name: 'Darker Sky Blue' },
    { hex: '#03543F', name: 'Forest Green' },
    { hex: '#111928', name: 'Black' },
    { hex: '#4B5563', name: 'Stone' },
    { hex: '#6B7280', name: 'Gray' },
    { hex: '#D1D5DB', name: 'Light Gray' },
    { hex: '#F3F4F6', name: 'Cloud Gray' },
    { hex: '#F9FAFB', name: 'Heaven Gray' },
  ]

  const fontFamilies = [
    { value: 'Inter, ui-sans-serif', label: 'Default' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: "'Courier New', monospace", label: 'Courier New' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: "'Lucida Sans Unicode', sans-serif", label: 'Lucida Sans Unicode' },
    { value: 'Tahoma, sans-serif', label: 'Tahoma' },
    { value: "'Times New Roman', serif", label: 'Times New Roman' },
    { value: "'Trebuchet MS', sans-serif", label: 'Trebuchet MS' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
  ]

  // Event handlers
  function handleFontSizeSelect(size) {
    toolbarActions.setFontSize(size)
    showFontSizeDropdown = false
  }

  function handleColorSelect(color) {
    toolbarActions.setColor(color)
    showColorDropdown = false
  }

  function handleCustomColorChange(event) {
    const color = event.target.value
    toolbarActions.setColor(color)
  }

  function handleResetColor() {
    toolbarActions.resetColor()
    showColorDropdown = false
  }

  function handleFontFamilySelect(family) {
    toolbarActions.setFontFamily(family)
    showFontFamilyDropdown = false
  }

  // Helper function to close all dropdowns
  function closeAllDropdowns() {
    showFontSizeDropdown = false
    showColorDropdown = false
    showFontFamilyDropdown = false
    showTableDropdown = false
    showMarkdownDropdown = false
  }

  // Close dropdowns when clicking outside
  function handleClickOutside(event) {
    // Don't close if clicking inside the editor itself
    if (event.target.closest('.w-full.rounded-lg.border')) {
      return
    }

    // Check if the click is outside any dropdown container
    const dropdownContainers = [
      '.font-size-dropdown',
      '.color-dropdown',
      '.font-family-dropdown',
      '.table-dropdown',
      '.markdown-dropdown',
    ]

    const isClickInsideDropdown = dropdownContainers.some((selector) =>
      event.target.closest(selector),
    )

    if (!isClickInsideDropdown) {
      closeAllDropdowns()
    }
  }
</script>

<div
  class="w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700 {class_}">
  <div class="border-b border-gray-200 px-3 py-2 dark:border-gray-600">
    <div class="flex flex-wrap items-center">
      <div class="flex flex-wrap items-center space-x-1 rtl:space-x-reverse">
        <button
          type="button"
          class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white {toolbarStates.bold
            ? 'bg-gray-200 dark:bg-gray-600'
            : ''}"
          on:click={toolbarActions.toggleBold}
          title="Bold (Ctrl+B)"
          aria-pressed={toolbarStates.bold}>
          <svg
            class="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 5h4.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0-7H6m2 7h6.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0 0H6" />
          </svg>
          <span class="sr-only">Bold</span>
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white {toolbarStates.italic
            ? 'bg-gray-200 dark:bg-gray-600'
            : ''}"
          on:click={toolbarActions.toggleItalic}
          title="Italic (Ctrl+I)"
          aria-pressed={toolbarStates.italic}>
          <svg
            class="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m8.874 19 6.143-14M6 19h6.33m-.66-14H18" />
          </svg>
          <span class="sr-only">Italic</span>
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white {toolbarStates.underline
            ? 'bg-gray-200 dark:bg-gray-600'
            : ''}"
          on:click={toolbarActions.toggleUnderline}
          title="Underline (Ctrl+U)"
          aria-pressed={toolbarStates.underline}>
          <svg
            class="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="2"
              d="M6 19h12M8 5v9a4 4 0 0 0 8 0V5M6 5h4m4 0h4" />
          </svg>
          <span class="sr-only">Underline</span>
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white {toolbarStates.strike
            ? 'bg-gray-200 dark:bg-gray-600'
            : ''}"
          on:click={toolbarActions.toggleStrike}
          title="Strikethrough"
          aria-pressed={toolbarStates.strike}>
          <svg
            class="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 6.2V5h12v1.2M7 19h6m.2-14-1.677 6.523M9.6 19l1.029-4M5 5l6.523 6.523M19 19l-7.477-7.477" />
          </svg>
          <span class="sr-only">Strike</span>
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white {toolbarStates.subscript
            ? 'bg-gray-200 dark:bg-gray-600'
            : ''}"
          on:click={toolbarActions.toggleSubscript}
          title="Subscript"
          aria-pressed={toolbarStates.subscript}>
          <svg
            class="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19.9999 21h-4v-.5c1.0989-1.0329 3.75-2.5 3.75-3.5v-1.0001c0-.5523-.4477-.9999-1-.9999h-1.75c-.5523 0-1 .4477-1 1M3.99986 6l9.26894 11.5765M13.1219 6 3.85303 17.5765" />
          </svg>
          <span class="sr-only">Subscript</span>
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white {toolbarStates.superscript
            ? 'bg-gray-200 dark:bg-gray-600'
            : ''}"
          on:click={toolbarActions.toggleSuperscript}
          title="Superscript"
          aria-pressed={toolbarStates.superscript}>
          <svg
            class="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21.0002 11h-4l-.0001-.5C18.099 9.46711 20.7502 8 20.7502 7V5.99989c0-.55228-.4478-.99989-1-.99989h-1.75c-.5523 0-1 .44772-1 1M5.37837 7.98274 14.6473 19.5593m-.5251-11.25583L4.85547 19.8773" />
          </svg>
          <span class="sr-only">Superscript</span>
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white {toolbarStates.highlight
            ? 'bg-gray-200 dark:bg-gray-600'
            : ''}"
          on:click={toolbarActions.toggleHighlight}
          title="Highlight"
          aria-pressed={toolbarStates.highlight}>
          <svg
            class="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="2"
              d="M9 19.2H5.5c-.3 0-.5-.2-.5-.5V16c0-.2.2-.4.5-.4h13c.3 0 .5.2.5.4v2.7c0 .3-.2.5-.5.5H18m-6-1 1.4 1.8h.2l1.4-1.7m-7-5.4L12 4c0-.1 0-.1 0 0l4 8.8m-6-2.7h4m-7 2.7h2.5m5 0H17" />
          </svg>
          <span class="sr-only">Highlight</span>
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white {toolbarStates.code
            ? 'bg-gray-200 dark:bg-gray-600'
            : ''}"
          on:click={toolbarActions.toggleCode}
          title="Code"
          aria-pressed={toolbarStates.code}>
          <svg
            class="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14" />
          </svg>
          <span class="sr-only">Code</span>
        </button>
        <!-- Font Size Dropdown -->
        <div class="font-size-dropdown relative">
          <button
            type="button"
            class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
            on:click={() => {
              closeAllDropdowns()
              showFontSizeDropdown = !showFontSizeDropdown
            }}
            title="Font Size">
            <svg
              class="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3" />
            </svg>
            <span class="sr-only">Text size</span>
          </button>

          {#if showFontSizeDropdown}
            <div
              class="absolute left-0 top-full z-10 mt-1 w-72 rounded-sm border bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
              <ul class="space-y-1 text-sm font-medium">
                {#each fontSizes as size}
                  <li>
                    <button
                      type="button"
                      class="flex w-full items-center justify-between rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600 {size.class}"
                      on:click={() => {
                        closeAllDropdowns()
                        handleFontSizeSelect(size.value)
                      }}>
                      {size.label}
                    </button>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
        <!-- Color Picker Dropdown -->
        <div class="color-dropdown relative">
          <button
            type="button"
            class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
            on:click={() => {
              closeAllDropdowns()
              showColorDropdown = !showColorDropdown
            }}
            title="Text Color">
            <svg
              class="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="24"
              fill="none"
              viewBox="0 0 25 24">
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
                d="m6.532 15.982 1.573-4m-1.573 4h-1.1m1.1 0h1.65m-.077-4 2.725-6.93a.11.11 0 0 1 .204 0l2.725 6.93m-5.654 0H8.1m.006 0h5.654m0 0 .617 1.569m5.11 4.453c0 1.102-.854 1.996-1.908 1.996-1.053 0-1.907-.894-1.907-1.996 0-1.103 1.907-4.128 1.907-4.128s1.909 3.025 1.909 4.128Z" />
            </svg>
            <span class="sr-only">Text color</span>
          </button>

          {#if showColorDropdown}
            <div
              class="absolute left-0 top-full z-10 mt-1 w-48 rounded-sm border bg-white p-2 shadow-lg">
              <div
                class="group mb-3 grid grid-cols-6 items-center gap-1 rounded-lg p-1.5 hover:bg-gray-100">
                <input
                  type="color"
                  bind:value={customColor}
                  on:input={handleCustomColorChange}
                  class="col-span-6 h-8 w-full rounded-md border border-gray-200 bg-gray-50 p-px px-1 hover:bg-gray-50 group-hover:bg-gray-50" />
              </div>
              <div class="mb-3 grid grid-cols-6 gap-1">
                {#each colorPalette as color}
                  <button
                    type="button"
                    style="background-color: {color.hex}"
                    class="h-6 w-6 rounded-md transition-transform hover:scale-110"
                    on:click={() => {
                      closeAllDropdowns()
                      handleColorSelect(color.hex)
                    }}
                    title={color.name}>
                    <span class="sr-only">{color.name}</span>
                  </button>
                {/each}
              </div>
              <button
                type="button"
                class="w-full rounded-lg bg-white py-1.5 text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-700"
                on:click={handleResetColor}>
                Reset Color
              </button>
            </div>
          {/if}
        </div>
        <!-- Font Family Dropdown -->
        <div class="font-family-dropdown relative">
          <button
            type="button"
            class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
            on:click={() => {
              closeAllDropdowns()
              showFontFamilyDropdown = !showFontFamilyDropdown
            }}
            title="Font Family">
            <svg
              class="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m10.6 19 4.298-10.93a.11.11 0 0 1 .204 0L19.4 19m-8.8 0H9.5m1.1 0h1.65m7.15 0h-1.65m1.65 0h1.1m-7.7-3.985h4.4M3.021 16l1.567-3.985m0 0L7.32 5.07a.11.11 0 0 1 .205 0l2.503 6.945h-5.44Z" />
            </svg>
            <span class="sr-only">Font family</span>
          </button>

          {#if showFontFamilyDropdown}
            <div
              class="absolute left-0 top-full z-10 mt-1 w-48 rounded-sm border bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
              <ul class="space-y-1 text-sm font-medium">
                {#each fontFamilies as font}
                  <li>
                    <button
                      type="button"
                      class="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                      style="font-family: {font.value}"
                      on:click={() => {
                        closeAllDropdowns()
                        handleFontFamilySelect(font.value)
                      }}>
                      {font.label}
                    </button>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>

        <!-- Separator -->
        <div class="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

        <!-- Link Button -->
        <button
          type="button"
          class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white {toolbarStates.link
            ? 'bg-gray-200 dark:bg-gray-600'
            : ''}"
          on:click={toolbarActions.toggleLink}
          title="Link"
          aria-pressed={toolbarStates.link}>
          <svg
            class="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961" />
          </svg>
          <span class="sr-only">Link</span>
        </button>

        <!-- Image Button -->
        <button
          type="button"
          class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
          on:click={toolbarActions.insertImage}
          title="Insert Image">
          <svg
            class="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 18V8a1 1 0 0 1 1-1h1.5l1.707-1.707A1 1 0 0 1 8.914 5h6.172a1 1 0 0 1 .707.293L17.5 7H19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
            <path
              stroke="currentColor"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span class="sr-only">Insert Image</span>
        </button>

        <!-- Table Dropdown -->
        <div class="table-dropdown relative">
          <button
            type="button"
            class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
            on:click={() => {
              closeAllDropdowns()
              showTableDropdown = !showTableDropdown
            }}
            title="Table">
            <svg
              class="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 6h18M3 10h18m-9 4h9m-9 4h9M3 14h6m-6 4h6" />
            </svg>
            <span class="sr-only">Table</span>
          </button>

          {#if showTableDropdown}
            <div
              class="absolute left-0 top-full z-10 mt-1 w-48 rounded-sm border bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
              <ul class="space-y-1 text-sm font-medium">
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                    on:click={() => {
                      closeAllDropdowns()
                      toolbarActions.insertTable()
                      showTableDropdown = false
                    }}>
                    Insert Table
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                    on:click={() => {
                      closeAllDropdowns()
                      toolbarActions.deleteTable()
                      showTableDropdown = false
                    }}>
                    Delete Table
                  </button>
                </li>
                <li>
                  <hr class="my-1 border-gray-200 dark:border-gray-600" />
                </li>
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                    on:click={() => {
                      toolbarActions.addColumnBefore()
                      showTableDropdown = false
                    }}>
                    Add Column Before
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                    on:click={() => {
                      toolbarActions.addColumnAfter()
                      showTableDropdown = false
                    }}>
                    Add Column After
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                    on:click={() => {
                      toolbarActions.deleteColumn()
                      showTableDropdown = false
                    }}>
                    Delete Column
                  </button>
                </li>
                <li>
                  <hr class="my-1 border-gray-200 dark:border-gray-600" />
                </li>
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                    on:click={() => {
                      toolbarActions.addRowBefore()
                      showTableDropdown = false
                    }}>
                    Add Row Before
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                    on:click={() => {
                      toolbarActions.addRowAfter()
                      showTableDropdown = false
                    }}>
                    Add Row After
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                    on:click={() => {
                      toolbarActions.deleteRow()
                      showTableDropdown = false
                    }}>
                    Delete Row
                  </button>
                </li>
              </ul>
            </div>
          {/if}
        </div>

        <!-- Separator -->
        <div class="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

        <!-- Markdown Dropdown -->
        <div class="markdown-dropdown relative">
          <button
            type="button"
            class="cursor-pointer rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
            on:click={() => {
              closeAllDropdowns()
              showMarkdownDropdown = !showMarkdownDropdown
            }}
            title="Markdown">
            <SvgIcon name="markdown" color="#6b7280" />
            <span class="sr-only">Markdown</span>
          </button>

          {#if showMarkdownDropdown}
            <div
              class="absolute left-0 top-full z-10 mt-1 w-48 rounded-sm border bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
              <ul class="space-y-1 text-sm font-medium">
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                    on:click={() => {
                      toolbarActions.importMarkdown()
                      showMarkdownDropdown = false
                    }}>
                    Import Markdown
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                    on:click={() => {
                      toolbarActions.exportMarkdown()
                      showMarkdownDropdown = false
                    }}>
                    Export Markdown
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                    on:click={() => {
                      toolbarActions.copyMarkdown()
                      showMarkdownDropdown = false
                    }}>
                    Copy as Markdown
                  </button>
                </li>
              </ul>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Editor Content Area -->
  <div class="rounded-b-lg bg-white px-4 py-2 dark:bg-gray-800">
    <label for={componentId} class="sr-only">{placeholder}</label>
    <div
      bind:this={editorElement}
      id={componentId}
      class="block w-full border-0 bg-white px-0 text-sm text-gray-800 focus:ring-0">
    </div>
  </div>
</div>
