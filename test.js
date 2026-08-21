// 測試檔（老師寫好，學生不改）
// 每個 test 用 jest.resetModules() 讓 app 重新載入 → 拿到 fresh members state
// 這樣多個 test 之間不會互相污染（POST 新增過的會員不會殘留到下個 test）

const request = require('supertest');
const path = require('node:path');

const FIXTURES = path.join(__dirname, 'fixtures');
const SAMPLE_JPG = path.join(FIXTURES, 'sample.jpg');

let app;

function loadFreshApp() {
  jest.resetModules();
  return require('./app');
}

beforeEach(() => {
  app = loadFreshApp();
});

// ---------- 任務二：GET endpoints ----------
describe('任務二：GET /members', () => {
  test('列表回 200 + 4 筆初始會員', async () => {
    const res = await request(app).get('/members');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
  });

  test('?level=VIP 篩選', async () => {
    const res = await request(app).get('/members?level=VIP');
    expect(res.status).toBe(200);
    expect(res.body.every((m) => m.level === 'VIP')).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('任務二：GET /members/:id', () => {
  test('找到回 200', async () => {
    const res = await request(app).get('/members/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test('找不到回 404', async () => {
    const res = await request(app).get('/members/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

// ---------- 任務三：POST ----------
describe('任務三：POST /members', () => {
  test('新增成功回 201', async () => {
    const res = await request(app)
      .post('/members')
      .send({ name: '小明', level: 'normal' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('小明');
    expect(res.body.id).toBeDefined();
  });

  test('缺欄位回 400', async () => {
    const res = await request(app).post('/members').send({ name: '小明' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('body 是 null 要能擋（回 400）', async () => {
    const res = await request(app)
      .post('/members')
      .set('Content-Type', 'application/json')
      .send('null');
    expect(res.status).toBe(400);
  });
});

// ---------- 任務四：PUT + DELETE ----------
describe('任務四：PUT /members/:id', () => {
  test('更新成功回 200 + merge 後資料', async () => {
    const res = await request(app).put('/members/1').send({ level: 'normal' });
    expect(res.status).toBe(200);
    expect(res.body.level).toBe('normal');
    expect(res.body.name).toBe('小華'); // ← name 保留
  });

  test('找不到回 404', async () => {
    const res = await request(app).put('/members/999').send({ level: 'VIP' });
    expect(res.status).toBe(404);
  });
});

describe('任務四：DELETE /members/:id', () => {
  test('刪除成功回 204 無 body', async () => {
    const res = await request(app).delete('/members/1');
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  test('找不到回 404', async () => {
    const res = await request(app).delete('/members/999');
    expect(res.status).toBe(404);
  });
});

// ---------- 任務五：POST /uploadImage ----------
describe('任務五：POST /uploadImage', () => {
  test('上傳成功回 200', async () => {
    const res = await request(app).post('/uploadImage').attach('image', SAMPLE_JPG);
    expect(res.status).toBe(200);
    expect(res.body.filename).toBe('sample.jpg');
    expect(res.body.sizeKB).toBeGreaterThan(0);
    expect(res.body.savedPath).toBeDefined();
  });

  test('沒帶檔案回 400', async () => {
    const res = await request(app).post('/uploadImage');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ---------- 任務六：app.js 整合 ----------
describe('任務六：app.js 整合', () => {
  test('回應含 CORS header', async () => {
    const res = await request(app).get('/members');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  test('未註冊的路徑回 404', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
  });

  test('Swagger UI /docs/ 回 200', async () => {
    const res = await request(app).get('/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/swagger/i);
  });
});
