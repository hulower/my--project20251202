/**
 * 將文字轉換為粒子座標點
 * @param {string} text - 要渲染的文字
 * @param {number} fontSize - 字體大小
 * @returns {Float32Array} - 粒子位置數組 [x, y, z, x, y, z, ...]
 */
export function getTextParticles(text, fontSize = 100) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = 500;
  const height = 300;
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  ctx.font = `bold ${fontSize}px Arial, "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const points = [];

  // 掃描像素
  for (let y = 0; y < height; y += 4) { // 步長越大，粒子越稀疏
    for (let x = 0; x < width; x += 4) {
      const i = (y * width + x) * 4;
      const r = data[i];
      // 如果像素夠亮，則視為粒子
      if (r > 128) {
        // 將 2D 座標轉換為 3D 座標中心化
        points.push((x - width / 2) * 0.1); // x
        points.push(-(y - height / 2) * 0.1); // y (canvas y 是向下的，3D 是向上的)
        points.push(0); // z 初始為 0
      }
    }
  }

  return new Float32Array(points);
}
