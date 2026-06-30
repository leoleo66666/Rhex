const GALLERY_CSS = `
.addon-image-gallery {
  margin: 1.25rem 0;
  border-radius: 0.75rem;
  overflow: hidden;
  background: hsl(var(--muted) / 0.3);
}
.addon-image-gallery-scroll {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  max-height: 480px;
}
.addon-image-gallery-scroll::-webkit-scrollbar {
  display: none;
}
.addon-image-gallery-slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 480px;
}
.addon-image-gallery-slide img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain;
}
.addon-image-gallery-counter {
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 0.75rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  pointer-events: none;
  backdrop-filter: blur(4px);
}
.addon-image-gallery-dots {
  display: flex;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 0;
}
.addon-image-gallery-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: hsl(var(--muted-foreground) / 0.3);
  transition: background 0.2s;
  flex-shrink: 0;
}
.addon-image-gallery-dot.active {
  background: hsl(var(--primary));
}`

function buildGalleryId() {
  return `addon-gallery-${Math.random().toString(36).slice(2, 9)}`
}

function extractImagesFromHtml(block) {
  const imgRegex = /<img\b[^>]*>/gi
  return [...block.matchAll(imgRegex)].map((m) => m[0])
}

function buildGalleryHtml(images, galleryId) {
  if (images.length < 2) return ""

  const counterStyle = images.length > 1
    ? "addon-image-gallery-counter"
    : "addon-image-gallery-counter hidden"

  const slides = images
    .map(
      (img, i) =>
        `<div class="addon-image-gallery-slide" id="${galleryId}-slide-${i}">${img}<span class="${counterStyle}">${i + 1} / ${images.length}</span></div>`,
    )
    .join("\n")

  const dots = images
    .map(
      (_img, i) =>
        `<a href="#${galleryId}-slide-${i}" class="addon-image-gallery-dot" data-gallery-dot="${i}"></a>`,
    )
    .join("\n")

  return `<div class="addon-image-gallery">\n<style>${GALLERY_CSS}</style>\n<div class="addon-image-gallery-scroll">\n${slides}\n</div>\n<div class="addon-image-gallery-dots">\n${dots}\n</div>\n</div>`
}

function findConsecutiveImagesAtStart(html) {
  const imageBlockPattern =
    /^((?:<p[^>]*>\s*(?:<span[^>]*>)?<img\b[^>]*>(?:<\/span>)?\s*<\/p>\s*)+)/

  const match = html.match(imageBlockPattern)
  if (!match) return null

  const block = match[0]
  const images = extractImagesFromHtml(block)
  if (images.length < 2) return null

  return { block, images, length: block.length }
}

function transformPostContent(html) {
  if (!html) return html

  const findResult = findConsecutiveImagesAtStart(html)
  if (!findResult) return html

  const { block, images, length } = findResult
  const galleryId = buildGalleryId()
  const galleryHtml = buildGalleryHtml(images, galleryId)
  const remaining = html.slice(length)

  return galleryHtml + remaining
}

export default {
  async setup(api) {
    api.registerAsyncWaterfallHook({
      key: "image-gallery-consecutive",
      hook: "post.content.render",
      order: 50,
      title: "图片画廊",
      description: "检测帖子开头的多张连续图片，自动合并为可滑动的画廊。",
      transform(context) {
        if (typeof context.value !== "string" || !context.value) {
          return
        }
        return transformPostContent(context.value)
      },
    })
  },
}
