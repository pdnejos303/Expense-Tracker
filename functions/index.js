import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2';

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');
const API_URL = 'https://api.openai.com/v1/chat/completions';

setGlobalOptions({ region: 'asia-southeast1', maxInstances: 10 });

async function chatCompletion(messages, options = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY.value()}`,
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4o-mini',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    // Log the upstream detail for us, but never surface it to the client:
    // it can echo back key state, quota, and org identifiers.
    console.error('OpenAI API error', response.status, err.error?.message);
    throw new HttpsError('internal', 'AI service unavailable');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ---- payload coercion -------------------------------------------------
// Everything below arrives from the browser, so it is untrusted even though
// the caller is authenticated. Cap sizes so one user cannot turn a call into
// an unbounded token bill.

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const str = (v, max = 500) => String(v ?? '').slice(0, max);
const arr = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);

// ---- prompt builders --------------------------------------------------

function buildInsights(p) {
  const topCategories = arr(p.topCategories, 10);
  const budgetAlerts = arr(p.budgetAlerts, 10).map((a) => str(a, 200));
  return {
    messages: [
      {
        role: 'system',
        content:
          'คุณเป็นที่ปรึกษาการเงินส่วนตัวสำหรับคนไทย ตอบเป็นภาษาไทย สั้นกระชับ 3-5 bullet points ใช้ตัวเลขอ้างอิงจริงจากข้อมูลที่ให้ ห้ามแต่งตัวเลขเอง ให้คำแนะนำที่นำไปปฏิบัติได้ ใช้ markdown bullet list',
      },
      {
        role: 'user',
        content: `สรุปการเงินของฉัน:
- รายรับเดือนนี้: ${num(p.currentMonthIncome)} บาท
- รายจ่ายเดือนนี้: ${num(p.currentMonthExpense)} บาท
- รายรับเดือนก่อน: ${num(p.prevMonthIncome)} บาท
- รายจ่ายเดือนก่อน: ${num(p.prevMonthExpense)} บาท
- อัตราการออม: ${num(p.savingsRate).toFixed(1)}%
- ค่าใช้จ่ายเฉลี่ย/วัน: ${num(p.dailyAvg).toFixed(0)} บาท
- หมวดที่ใช้จ่ายสูงสุด: ${topCategories.map((c) => `${str(c.name, 60)} (${num(c.value)} บาท)`).join(', ')}
- แจ้งเตือนงบ: ${budgetAlerts.length > 0 ? budgetAlerts.join(', ') : 'ไม่มี'}

วิเคราะห์และให้คำแนะนำสั้นๆ`,
      },
    ],
    options: {},
  };
}

function buildSuggestCategory(p) {
  const categories = arr(p.availableCategories, 60).map((c) => str(c, 60));
  return {
    messages: [
      {
        role: 'system',
        content:
          'คุณช่วยจัดหมวดหมู่รายการทางการเงิน ตอบเฉพาะชื่อหมวดหมู่เท่านั้น 1 คำตอบ ไม่ต้องอธิบาย ถ้าไม่แน่ใจให้ตอบหมวดที่ใกล้เคียงที่สุด',
      },
      {
        role: 'user',
        content: `หมวดหมู่ ${p.type === 'income' ? 'รายรับ' : 'รายจ่าย'} ที่มี: ${categories.join(', ')}\n\nรายการ: "${str(p.note, 300)}"\n\nหมวดหมู่ที่เหมาะสมที่สุด:`,
      },
    ],
    options: { temperature: 0.2, max_tokens: 50 },
  };
}

function buildBudgetAdvice(p) {
  const spending = arr(p.spendingByCategory, 40);
  const budgets = arr(p.existingBudgets, 40);
  return {
    messages: [
      {
        role: 'system',
        content:
          'คุณเป็นที่ปรึกษางบประมาณส่วนตัว ตอบเป็นภาษาไทย ให้คำแนะนำงบประมาณที่เหมาะสมตามพฤติกรรมจริง ตอบเป็น markdown bullet list สั้นๆ แต่ละหมวดบอกตัวเลขที่แนะนำ',
      },
      {
        role: 'user',
        content: `ค่าใช้จ่ายเฉลี่ยต่อเดือน (3 เดือนล่าสุด) แยกตามหมวด:
${spending.map((c) => `- ${str(c.category, 60)}: ${num(c.avgMonthly).toFixed(0)} บาท/เดือน`).join('\n')}

งบประมาณที่ตั้งไว้:
${budgets.length > 0 ? budgets.map((b) => `- ${str(b.category, 60)}: ${num(b.amount)} บาท`).join('\n') : 'ยังไม่ได้ตั้งงบ'}

แนะนำงบประมาณที่เหมาะสมต่อหมวดหมู่ พร้อมเหตุผลสั้นๆ`,
      },
    ],
    options: {},
  };
}

function buildSpendingPlan(p) {
  const budget = num(p.budget);
  const days = Math.max(1, num(p.days));
  const fixedExpenses = str(p.fixedExpenses, 1000);
  const goals = str(p.goals, 1000);
  const lifestyle = str(p.lifestyle, 1000);
  return {
    messages: [
      {
        role: 'system',
        content: `คุณเป็นนักวางแผนการเงินส่วนตัวสำหรับคนไทย ตอบเป็นภาษาไทย ให้แผนการใช้เงินที่ปฏิบัติได้จริง ชัดเจน เป็นรูปธรรม
ใช้ markdown format:
- หัวข้อหลักใช้ **bold**
- รายการย่อยใช้ bullet list
- ตัวเลขเงินใส่หน่วย "บาท" เสมอ
- สรุปเป็นตารางรายวัน/รายสัปดาห์ถ้าเหมาะสม
- ให้เทคนิคประหยัดเงินที่เหมาะกับบริบท`,
      },
      {
        role: 'user',
        content: `ช่วยวางแผนการใช้เงินให้หน่อย:

💰 งบประมาณทั้งหมด: ${budget} บาท
📅 ระยะเวลาที่ต้องบริหาร: ${days} วัน
📊 เฉลี่ยต่อวัน: ${(budget / days).toFixed(0)} บาท

${fixedExpenses ? `🔒 ค่าใช้จ่ายคงที่ที่ต้องจ่าย:\n${fixedExpenses}` : ''}
${goals ? `🎯 เป้าหมาย/สิ่งที่อยากทำในช่วงนี้:\n${goals}` : ''}
${lifestyle ? `🏠 ไลฟ์สไตล์/บริบท:\n${lifestyle}` : ''}

กรุณาวางแผนการใช้เงินอย่างละเอียด แบ่งเป็นหมวดหมู่ พร้อมเทคนิคประหยัด และแผนสำรองกรณีมีเหตุฉุกเฉิน`,
      },
    ],
    options: { max_tokens: 2048 },
  };
}

function buildDetectAnomalies(p) {
  const averages = arr(p.categoryAverages, 40);
  const recent = arr(p.recentTransactions, 10);
  return {
    messages: [
      {
        role: 'system',
        content:
          'คุณช่วยตรวจจับรายจ่ายผิดปกติ ตอบเป็นภาษาไทย ถ้ามีรายจ่ายที่สูงผิดปกติ (เกิน 2 เท่าของค่าเฉลี่ย) ให้แจ้งเตือน ถ้าไม่มีอะไรผิดปกติตอบ "NONE" เท่านั้น ถ้ามีให้ตอบสั้นๆ เป็น markdown bullet',
      },
      {
        role: 'user',
        content: `ค่าเฉลี่ยรายจ่ายต่อหมวดหมู่ (ต่อรายการ):
${averages.map((c) => `- ${str(c.category, 60)}: เฉลี่ย ${num(c.avg).toFixed(0)} บาท/รายการ`).join('\n')}

รายจ่ายล่าสุด 10 รายการ:
${recent.map((t) => `- ${str(t.category, 60)}: ${num(t.amount)} บาท${t.note ? ` (${str(t.note, 120)})` : ''}`).join('\n')}

มีรายจ่ายที่สูงผิดปกติหรือไม่?`,
      },
    ],
    options: { temperature: 0.2 },
  };
}

const BUILDERS = {
  insights: buildInsights,
  suggestCategory: buildSuggestCategory,
  budgetAdvice: buildBudgetAdvice,
  spendingPlan: buildSpendingPlan,
  detectAnomalies: buildDetectAnomalies,
};

export const aiAssist = onCall(
  { secrets: [OPENAI_API_KEY], timeoutSeconds: 120, memory: '256MiB' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'ต้องเข้าสู่ระบบก่อนใช้ฟีเจอร์ AI');
    }

    const { action, payload } = request.data ?? {};
    const build = BUILDERS[action];
    if (!build) {
      throw new HttpsError('invalid-argument', `ไม่รู้จัก action: ${action}`);
    }

    const { messages, options } = build(payload ?? {});
    const content = await chatCompletion(messages, options);
    return { content };
  }
);
