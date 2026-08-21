// 啟動點（老師寫好，學生不需調整）
// npm start → 跑這個 → require ./app → app.listen(port)

require('dotenv').config();

const fs = require('node:fs');
const app = require('./app');

const PORT = Number(process.env.PORT) || 3000;
const uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.listen(PORT, () => {
  console.log('========================================');
  console.log('🏋️  健身房會員管理 API');
  console.log(`📁 上傳目錄：${uploadDir}`);
  console.log('========================================');
  console.log(`✅ Server listening on http://localhost:${PORT}`);
  console.log(`📘 Swagger UI: http://localhost:${PORT}/docs`);
  console.log('');
});
