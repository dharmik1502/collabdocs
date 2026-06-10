type Mark = { type: string }

type JSONContent = {
  type: string
  attrs?: Record<string, unknown>
  content?: JSONContent[]
  marks?: Mark[]
  text?: string
}

function applyMarks(text: string, marks: Mark[] = []): string {
  let result = text
  for (const mark of marks) {
    if (mark.type === 'bold') result = `**${result}**`
    else if (mark.type === 'italic') result = `*${result}*`
    else if (mark.type === 'code') result = `\`${result}\``
  }
  return result
}

function inlineNodes(nodes: JSONContent[] = []): string {
  return nodes
    .map((n) => {
      if (n.type === 'text') return applyMarks(n.text ?? '', n.marks)
      if (n.type === 'hardBreak') return '  \n'
      return inlineNodes(n.content)
    })
    .join('')
}

function convertNode(node: JSONContent): string {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(convertNode).join('\n')
    case 'paragraph': {
      const text = inlineNodes(node.content)
      return text ? text + '\n' : ''
    }
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1
      return '#'.repeat(level) + ' ' + inlineNodes(node.content) + '\n'
    }
    case 'bulletList':
      return (
        (node.content ?? [])
          .map((item) => {
            const inner = (item.content ?? []).map(convertNode).join('')
            return `- ${inner.trim()}`
          })
          .join('\n') + '\n'
      )
    case 'orderedList':
      return (
        (node.content ?? [])
          .map((item, i) => {
            const inner = (item.content ?? []).map(convertNode).join('')
            return `${i + 1}. ${inner.trim()}`
          })
          .join('\n') + '\n'
      )
    case 'blockquote':
      return (node.content ?? []).map((n) => '> ' + convertNode(n)).join('')
    case 'codeBlock': {
      const lang = (node.attrs?.language as string) ?? ''
      return `\`\`\`${lang}\n${inlineNodes(node.content)}\n\`\`\`\n`
    }
    case 'horizontalRule':
      return '---\n'
    case 'text':
      return applyMarks(node.text ?? '', node.marks)
    default:
      return inlineNodes(node.content)
  }
}

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gis, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gis, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gis, '### $1\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gis, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gis, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gis, '*$1*')
    .replace(/<li[^>]*>(.*?)<\/li>/gis, '- $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

export function tiptapToMarkdown(raw: string, title?: string): string {
  const header = title ? `# ${title}\n\n` : ''
  if (!raw) return header

  try {
    const parsed = JSON.parse(raw)
    if (parsed.__html) return header + htmlToMarkdown(parsed.__html)
    return header + convertNode(parsed as JSONContent)
  } catch {
    return header + raw
  }
}
