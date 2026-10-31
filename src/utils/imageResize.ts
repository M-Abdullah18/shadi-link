/**
 * Resizes an image file in the browser to max 1280px width and ~300 KB before upload
 */
export async function resizeImageInBrowser(
  file: File,
  maxWidth = 1280,
  maxSizeBytes = 350 * 1024
): Promise<{ blob: Blob; contentType: 'image/jpeg' | 'image/png' | 'image/webp' }> {
  return new Promise((resolve, reject) => {
    // If the file is already small (e.g. < 300 KB) and already a supported type
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale if wider than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // Draw and compress to WebP or JPEG
        ctx.drawImage(img, 0, 0, width, height);

        const tryCompression = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              // If still larger than target and quality > 0.4, reduce quality
              if (blob.size > maxSizeBytes && quality > 0.45) {
                tryCompression(quality - 0.15);
              } else {
                resolve({
                  blob,
                  contentType: 'image/jpeg',
                });
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompression(0.85);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
