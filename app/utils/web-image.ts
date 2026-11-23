/**
 * Turns a picked photo into a small JPEG data URL that is cheap to store and quick to show:
 * at most `maxSide` pixels on the long edge, and quality lowered until it fits in `maxBytes`.
 * Transparent areas become white. Client only.
 */
export const toWebImage = async (file: File, maxSide = 1000, maxBytes = 180_000): Promise<{ url: string; bytes: number }> => {
  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  try {
    for (let attempt = 0; attempt < 4; attempt++) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (let quality = 0.85; quality >= 0.45; quality -= 0.1) {
        const url = canvas.toDataURL("image/jpeg", quality);
        const bytes = Math.round((url.length - 23) * 0.75);
        if (bytes <= maxBytes) return { url, bytes };
      }
      scale *= 0.75; // still too big at the lowest quality: make it smaller and try again
    }
    throw new Error("too big");
  } finally {
    bitmap.close();
  }
};
