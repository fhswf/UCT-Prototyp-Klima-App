import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

export function renderMarkdown(source) {
  if (!source) return ''
  return DOMPurify.sanitize(md.render(source))
}
