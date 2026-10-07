'use client' // canvas + createImageBitmap are browser-only

// Claude reads images best at ≤1568px on the long edge; anything bigger is
// downscaled server-side anyway, so shrinking here just saves upload time.
const MAX_EDGE = 1568
const JPEG_QUALITY = 0.85

export type PreparedPhoto = {
  base64: string
  mediaType: 'image/jpeg'
  previewUrl: string
}

/** Resizes, applies camera rotation, and re-encodes as JPEG (also converts HEIC where the browser can decode it). */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not available')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('Could not encode photo'))), 'image/jpeg', JPEG_QUALITY)
  })
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

  return { base64: dataUrl.slice(dataUrl.indexOf(',') + 1), mediaType: 'image/jpeg', previewUrl: dataUrl }
}
