export interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function cropAndCompress(
  imageSrc: string,
  croppedAreaPixels: CroppedArea,
  targetSizeKB = 250,
  maxDimension = 1200,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  let { width, height } = croppedAreaPixels;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  ctx.drawImage(
    image,
    croppedAreaPixels.x, croppedAreaPixels.y,
    width, height,
    0, 0,
    canvas.width, canvas.height,
  );

  const targetBytes = targetSizeKB * 1024;
  let quality = 0.85;
  let blob = await canvasToBlob(canvas, quality);

  if (blob.size > targetBytes) {
    let lo = 0.1, hi = 0.85;
    for (let i = 0; i < 6; i++) {
      quality = (lo + hi) / 2;
      blob = await canvasToBlob(canvas, quality);
      if (blob.size > targetBytes) hi = quality;
      else lo = quality;
    }
  }

  return new File([blob], 'image.jpg', { type: 'image/jpeg' });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality);
  });
}
