<script>
  import Wysiwyg from '../components/Wysiwyg.svelte'
  
  let wysiwygRef
  let content = '# Hello Markdown\n\nThis is a **bold** text and this is *italic*.\n\n- Item 1\n- Item 2\n- Item 3\n\n```javascript\nconsole.log("Hello World")\n```'
  
  function handleUpdate(event) {
    console.log('Content updated:', event.detail.content)
  }
  
  function testMarkdownMethods() {
    if (wysiwygRef) {
      console.log('Current Markdown:', wysiwygRef.getMarkdown())
      
      // Test setting markdown
      const testMarkdown = `# Test Markdown

This is a test of the **Markdown** functionality.

## Features

- [x] Bold text
- [x] Italic text  
- [x] Lists
- [x] Code blocks
- [x] Links: [Google](https://google.com)

\`\`\`javascript
function hello() {
  console.log("Hello from markdown!")
}
\`\`\`

> This is a blockquote

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`
      
      wysiwygRef.setMarkdown(testMarkdown)
    }
  }
</script>

<div class="container mx-auto p-6">
  <h1 class="text-3xl font-bold mb-6">Markdown WYSIWYG Test</h1>
  
  <div class="mb-4 space-x-4">
    <button 
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      on:click={testMarkdownMethods}>
      Test Markdown Methods
    </button>
  </div>
  
  <div class="mb-6">
    <h2 class="text-xl font-semibold mb-2">WYSIWYG Editor with Markdown Support</h2>
    <Wysiwyg 
      bind:this={wysiwygRef}
      bind:content={content}
      placeholder="Start typing or paste markdown..."
      on:update={handleUpdate}
      minHeight="300px"
      maxHeight="600px"
    />
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <h3 class="text-lg font-semibold mb-2">HTML Output</h3>
      <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto max-h-64">{content}</pre>
    </div>
    
    <div>
      <h3 class="text-lg font-semibold mb-2">Markdown Output</h3>
      <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto max-h-64">{wysiwygRef ? wysiwygRef.getMarkdown() : 'Loading...'}</pre>
    </div>
  </div>
  
  <div class="mt-6">
    <h3 class="text-lg font-semibold mb-2">Instructions</h3>
    <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
      <li>Type markdown syntax directly in the editor (e.g., **bold**, *italic*, # heading)</li>
      <li>Paste markdown text - it will be automatically converted</li>
      <li>Use the Markdown dropdown to import, export, or copy markdown</li>
      <li>Copy text from the editor - it will be in markdown format</li>
      <li>Click "Test Markdown Methods" to see programmatic markdown setting</li>
    </ul>
  </div>
</div>
