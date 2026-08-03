import {describe, it, expect} from 'vitest'
import {convertToHtmlIfNeeded, trimHtmlWhitespace} from './html-utils'

describe('convertToHtmlIfNeeded', () => {
  it('wraps plain text in a single paragraph, without a leading blank line', () => {
    // Question/category/answer fields (e.g. from /ai/qa) used to render with a genuinely blank
    // line on top, because this used to prepend an empty `<p></p>` just to mark the string as
    // "already html" - real, valid HTML once it reached the rich-text editor.
    expect(convertToHtmlIfNeeded('What is Rust ownership?')).toBe('<p>What is Rust ownership?</p>')
  })

  it('trims leading/trailing whitespace from plain text before wrapping it', () => {
    expect(convertToHtmlIfNeeded('\n  What is Rust ownership?  \n')).toBe('<p>What is Rust ownership?</p>')
  })

  it('converts embedded newlines in plain text to <br>', () => {
    expect(convertToHtmlIfNeeded('Line one\nLine two')).toBe('<p>Line one<br>Line two</p>')
  })

  it('preserves indentation in a fenced code block instead of collapsing it', () => {
    // AI-generated Q&A answers (e.g. from /ai/qa) can include a fenced code example inline in an
    // otherwise plain-text answer - a plain \n -> <br> replace would collapse each line's leading
    // spaces, since normal HTML flow text collapses whitespace outside <pre>.
    const answer = 'Example:\n```kotlin\nfun main() {\n    println("Hi")\n}\n```\nThat prints Hi.'
    expect(convertToHtmlIfNeeded(answer)).toBe(
      '<p>Example:<br><pre><code>fun main() {\n    println(&quot;Hi&quot;)\n}</code></pre><br>That prints Hi.</p>'
    )
  })

  it('escapes HTML-special characters inside a fenced code block', () => {
    const answer = '```\nif (a < b && b > 0) { c = &d; }\n```'
    expect(convertToHtmlIfNeeded(answer)).toBe(
      '<p><pre><code>if (a &lt; b &amp;&amp; b &gt; 0) { c = &amp;d; }</code></pre></p>'
    )
  })

  it('handles a fenced code block with no language tag', () => {
    const answer = '```\n  indented\n    more indented\n```'
    expect(convertToHtmlIfNeeded(answer)).toBe('<p><pre><code>  indented\n    more indented</code></pre></p>')
  })

  it('strips a genuinely empty leading paragraph from already-html input', () => {
    expect(convertToHtmlIfNeeded('<p></p><p>Real content</p>')).toBe('<p>Real content</p>')
  })

  it('strips a leading paragraph containing only &nbsp; or <br>', () => {
    expect(convertToHtmlIfNeeded('<p>&nbsp;</p><p>Real content</p>')).toBe('<p>Real content</p>')
    expect(convertToHtmlIfNeeded('<p><br></p><p>Real content</p>')).toBe('<p>Real content</p>')
  })

  it('leaves already-well-formed html with real content untouched', () => {
    expect(convertToHtmlIfNeeded('<p>Real content</p>')).toBe('<p>Real content</p>')
  })

  it('passes through nullish/empty input unchanged', () => {
    expect(convertToHtmlIfNeeded(undefined)).toBe(undefined)
    expect(convertToHtmlIfNeeded(null)).toBe(null)
    expect(convertToHtmlIfNeeded('')).toBe('')
  })
})

describe('trimHtmlWhitespace', () => {
  it('strips leading and trailing empty paragraphs', () => {
    expect(trimHtmlWhitespace('<p></p><p>Real content</p><p>&nbsp;</p>')).toBe('<p>Real content</p>')
  })

  it('keeps a leading paragraph that contains an image, even with no text', () => {
    const html = '<p><img src="x.png"></p><p>Real content</p>'
    expect(trimHtmlWhitespace(html)).toBe(html)
  })

  it('leaves content with no empty edges untouched', () => {
    const html = '<p>First</p><p>Second</p>'
    expect(trimHtmlWhitespace(html)).toBe(html)
  })
})
