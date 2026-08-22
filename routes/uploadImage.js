const express = require('express');
const fs = require('node:fs');
const { formidable } = require('formidable');

// ⚠️ 寫作業前先 `npm start` 打開 http://localhost:3000/docs 看 Swagger UI 的規格。
// 💡 /* 作答區 ... */ 是答題提示區，取消註解後填入你的程式碼。

const uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads';
const maxFileSize = (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;

fs.mkdirSync(uploadDir, { recursive: true });

const router = express.Router();

// ───────────────────────────────────────────────────────────
// TODO 任務五：POST /
//   （實際 URL 是 /uploadImage，因為 app.js 把這個 router 掛在 '/uploadImage'）
// ───────────────────────────────────────────────────────────

// POST /
// - 輸入：multipart/form-data，field 名稱 `image`
// - 輸出：200 + { filename: file.originalFilename, sizeKB: Math.round(file.size / 1024), savedPath: file.filepath }，或 400 + { error: 'No file uploaded' }（沒帶 image）
// - 提示：建立 formidable 實例（uploadDir、keepExtensions: true、maxFileSize），用 form.parse(req, (err, fields, files) => { ... }) 解析，其中 err 不為 null 時回 500 + { error: err.message }
// - 注意：formidable v3 的 files.image 為陣列，需以 Array.isArray 判斷並取 [0]

router.post('/', (req, res) => {
  // uploadDir 檔案存放位置 , maxFileSize 最大檔案大小 , keepExtensions 保留副檔名
  const form = formidable({uploadDir, maxFileSize, keepExtensions: true});
    // parse 解析 req, fields 純文字欄位, files 為檔案欄位
    form.parse(req, (error, fields, files) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      if  (!files || !files.image){
        return res.status(400).json({error: 'Not file uploaded'});
      }
    // 取得檔案欄位 image  
    let file = files.image
    // 判斷是否為陣列，若是則取第一個檔案
    if (Array.isArray(file)){
      file = file[0]
    }
    return res.status(200).json({
      filename: file.originalFilename,
      // bytes 轉 KB 四捨五入
      sizeKB: Math.round(file.size / 1024),
      // 檔案實際存放位置
      savedPath: file.filepath
    })

    })

});


module.exports = router;
