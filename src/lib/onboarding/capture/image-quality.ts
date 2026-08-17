export type ImageQualityResult = {
  sharp: boolean;
  glare: boolean;
  variance: number;
  glarePct: number;
};

export type ImageQualityState = ImageQualityResult | "checking" | null;

/** Laplacian variance (blur) + near-white fraction (glare) — ported from prototype shared.js */
export function analyzeImage(url: string): Promise<ImageQualityResult | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const W = 160;
      const H = Math.max(1, Math.round((img.height / img.width) * W));
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0, W, H);
      const d = ctx.getImageData(0, 0, W, H).data;
      const g = new Float32Array(W * H);
      let bright = 0;
      for (let i = 0; i < W * H; i++) {
        const v = 0.299 * d[i * 4]! + 0.587 * d[i * 4 + 1]! + 0.114 * d[i * 4 + 2]!;
        g[i] = v;
        if (v > 245) bright++;
      }
      let sum = 0;
      let sumSq = 0;
      let n = 0;
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          const lap =
            g[i - W]! + g[i + W]! + g[i - 1]! + g[i + 1]! - 4 * g[i]!;
          sum += lap;
          sumSq += lap * lap;
          n++;
        }
      }
      const variance = sumSq / n - (sum / n) ** 2;
      const glarePct = (bright / (W * H)) * 100;
      resolve({
        sharp: variance > 60,
        glare: glarePct > 14,
        variance: Math.round(variance),
        glarePct: Math.round(glarePct),
      });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
