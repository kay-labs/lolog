// FlexCarousel은 이미지(src)만 렌더링하므로, 글 정보를 canvas에 그려 카드 이미지로 만든다.

const WIDTH = 600
const HEIGHT = 800
const PADDING = 56
const FONT = '"Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'

const PALETTE = [
  ['#1f2937', '#f9fafb'],
  ['#e5e7eb', '#111827'],
  ['#334155', '#f8fafc'],
  ['#f5f5f4', '#1c1917'],
  ['#3f3f46', '#fafafa'],
  ['#e7e5e4', '#292524'],
]

// 한글은 띄어쓰기 없이 길어질 수 있어서 글자 단위로 줄바꿈한다.
function wrapText(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const char of text) {
    if (ctx.measureText(line + char).width > maxWidth && line) {
      lines.push(line.trimEnd())
      line = char.trimStart()
    } else {
      line += char
    }
  }
  if (line) lines.push(line)
  return lines
}

export function createPostCardImage(post) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  const [bg, fg] = PALETTE[(post.categoryId ?? post.id) % PALETTE.length]
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  ctx.fillStyle = fg
  ctx.textBaseline = 'top'

  ctx.globalAlpha = 0.6
  ctx.font = `500 22px ${FONT}`
  ctx.fillText(`// ${post.categoryName}`, PADDING, PADDING)

  ctx.globalAlpha = 1
  ctx.font = `700 52px ${FONT}`
  const lines = wrapText(ctx, post.title, WIDTH - PADDING * 2)
  const maxLines = 6
  const shown = lines.slice(0, maxLines)
  if (lines.length > maxLines) shown[maxLines - 1] = shown[maxLines - 1].slice(0, -1) + '…'
  shown.forEach((text, i) => ctx.fillText(text, PADDING, 180 + i * 68))

  ctx.globalAlpha = 0.6
  ctx.font = `400 22px ${FONT}`
  ctx.textBaseline = 'bottom'
  ctx.fillText(new Date(post.createdAt).toLocaleDateString('ko-KR'), PADDING, HEIGHT - PADDING)
  if (!post.isPublic) {
    ctx.textAlign = 'right'
    ctx.fillText('비공개', WIDTH - PADDING, HEIGHT - PADDING)
  }

  return canvas.toDataURL('image/png')
}
