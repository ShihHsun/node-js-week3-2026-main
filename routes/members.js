const express = require('express');
const initialMembers = require('../fixtures/members.json');

// ⚠️ 寫作業前先 `npm start` 打開 http://localhost:3000/docs 看 Swagger UI 的規格。
// 💡 /* 作答區 ... */ 是答題提示區，取消註解後填入你的程式碼。

// ───────────────────────────────────────────────────────────
// TODO 任務一：初始化 state + 內部 helpers
// ───────────────────────────────────────────────────────────

// 1. 複製 initialMembers，不直接改外部陣列

const members = [...initialMembers];


// 2. 下一個新增會員要使用的 id

let nextId = initialMembers.length +1;


// 3. 兩個內部 helper 函式

// 函式一：filterByQuery(list, query)：
// - 依據 query.level 篩選，沒帶就回全部
// - 任務二的 GET / 會使用到這個函式

function filterByQuery(list, query) { 
  // 1. 檢查 query.level 是否存在，若不存在就回傳 list
  if(!query.level) return list;
  // 2. 若 query.level 存在，回傳符合條件的陣列
  return list.filterByQuery((members)=> members.level === query.level);
}


// 函式二：validateBody(body)
// - 驗證 body 有沒有 name、level 欄位，要擋 null / undefined / {}
// - 驗證通過 → { valid: true }
// - 驗證失敗 → { valid: false, error: '缺 name 或 level' }
// - 任務三的 POST / 會使用到這個函式

function validateBody(body) { 
  if(!body||!body.name||!body.level){
    return { valid : false, error : '缺 Name 或 level'};
  }
  return { valid : true};

}


const router = express.Router();
// 此 router 掛在 app.js 的 '/members'，以下路由皆帶此前綴。舉例來說：
// - router.get('/') → GET /members
// - router.get('/:id') → GET /members/:id

// ───────────────────────────────────────────────────────────
// TODO 任務二：GET / 和 GET /:id
// ───────────────────────────────────────────────────────────

// GET /
// - 輸入：req.query.level 可帶 'VIP' | 'normal'（選填）
// - 輸出：200 + [{ id, name, level }, ...]
// - 提示：filterByQuery(members, req.query)

router.get('/', (req, res) => {
  const filteredMembers = filterByQuery(members, req.query);
  return res.status(200).json(filteredMembers);
});


// GET /:id
// - 輸入：req.params.id（string，需使用 Number() 轉換）
// - 輸出：200 + { id, name, level }，或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.find，找不到時結果是 undefined

router.get('/:id', (req, res) => {
  const {id} = req.params;
  // req 抓取下來的任何東西會預設為字串所以要用 Number（）轉換
  // members是原本的資料庫中尋找member對照id和要求進入的id 比對
  const findMember = members.find((member)=> member.id === Number(id))
  if(!findMember){
    return res.status(404).json({error: '會員不存在'});
  }
  return res.status(200).json(findMember);
});


// ───────────────────────────────────────────────────────────
// TODO 任務三：POST /
// ───────────────────────────────────────────────────────────

// POST /
// - 輸入：body = { name: string, level: 'VIP' | 'normal' }
// - 輸出：201 + 新會員物件（id 自動配），或 400 + { error: '缺 name 或 level' }（驗證失敗）
// - 提示：validateBody(req.body) 驗證；通過後用 spread 將 req.body 的欄位與 nextId 自動遞增的 id 合為新物件，push 進 members
// - 範例：POST /members body { name: '阿文', level: 'VIP' } → 201 { id: 5, name: '阿文', level: 'VIP' }

router.post('/', (req, res) => { 
  const body = req.body;
  // 把任務二的 validateBody() 拿來用，驗證 body 是否有 name、level 欄位
  const validateMember = validateBody(body);
  if(!validateMember.valid){
    return res.status(400).json({error:validateMember.error});
  }

  // 驗證通過後，建立新會員物件，id 用 nextId（原本資料庫的陣列數+1），name、level 從 body 取
  const newMember = {
    id : nextId,
    name : String(body.name),
    level : String(body.level),
  };

  // 將新會員物件 push 進 members，nextId ++ 因為原本資料庫的陣列數+1要往下多一個號碼預備給下一位
  members.push(newMember);
  nextId++;
  return res.status(201).json(newMember);

});


// ───────────────────────────────────────────────────────────
// TODO 任務四：PUT /:id 和 DELETE /:id
// ───────────────────────────────────────────────────────────

// PUT /:id
// - 輸入：req.params.id（string，需 Number() 轉換）、body（部分欄位，例如只傳 { level: 'normal' }）
// - 輸出：200 + merge 後的會員，或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.findIndex 找索引，-1 回應 404；找到索引則使用 spread 合併 members[idx] 與 req.body（req.body 需注意順序來覆蓋舊欄位），最後將結果存回 members[idx]
// - 範例：PUT /members/1 body { level: 'normal' } → 200 { id: 1, name: '小華', level: 'normal' }（name 被保留）

router.put('/:id', (req, res) => { 
  const id = Number(req.params.id);
  // 從資料庫的名單中，逐筆核對id，找到對應的索引位置
  const memberIndex = members.findIndex((member)=> member.id === id);
  if(memberIndex === -1){
    return res.status(404).json({error: '會員不存在'});
  }
  // 前端與資料庫的id都符合時候，將對應的索引值的會員資料與前端傳入的body資料做合併，並覆蓋原本的資料
  return res.status(200).json(members[memberIndex]);
});


// DELETE /:id
// - 輸入：req.params.id（string，需 Number() 轉換）
// - 輸出：204（無 body），或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.findIndex 找索引，-1 回應 404；找到索引則 splice 移除，再設定 status 204 並以 .end() 結束回應（204 不帶 body）

router.delete('/:id', (req, res) => { 
  const id = Number(req.params.id);
  const memberIndex = members.findIndex((member)=> member.id === id);
  if(memberIndex === -1){
    return res.status(404).json({error: '會員不存在'});
  }
  // 前端與資料庫的id都符合時候，將對應的索引值的會員資料從陣列中移除
  // splice(索引值, 移除數量)
  members.splice(memberIndex,1);
  return res.status(204).end();

});


module.exports = router;
