function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = (error) => {
      URL.revokeObjectURL(url)
      reject(error)
    }
    image.src = url
  })
}

function canvasToDataUrl(canvas, quality = 0.82) {
  return canvas.toDataURL('image/jpeg', quality)
}

export async function fileToDataUrl(file, options = {}) {
  const { maxWidth = 1200, maxHeight = 1600, quality = 0.82 } = options
  const image = await loadImage(file)

  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
  const width = Math.round(image.width * scale)
  const height = Math.round(image.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0, width, height)

  return canvasToDataUrl(canvas, quality)
}
