import mammoth from 'mammoth'

export type SupportedFileType = 'txt' | 'md' | 'docx'

export function getSupportedExtension(filename: string): SupportedFileType | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'txt' || ext === 'md' || ext === 'docx') return ext
  return null
}

export async function parseFileToHtml(
  buffer: Buffer,
  fileType: SupportedFileType
): Promise<string> {
  if (fileType === 'docx') {
    const result = await mammoth.convertToHtml({ buffer })
    return result.value
  }

  const text = buffer.toString('utf-8')

  if (fileType === 'md') {
    return markdownToHtml(text)
  }

  // Plain text: wrap paragraphs
  return text
    .split(/\n\n+/)
    .map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function markdownToHtml(md: string): string {
  return md
    .split('\n')
    .map((line) => {
      if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
      if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return `<li>${line.slice(2)}</li>`
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return `<p><strong>${line.slice(2, -2)}</strong></p>`
      }
      if (line.trim() === '') return ''
      return `<p>${line}</p>`
    })
    .join('\n')
}
