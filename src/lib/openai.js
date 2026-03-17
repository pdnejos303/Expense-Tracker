const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

async function chatCompletion(messages, options = {}) {
  if (!OPENAI_API_KEY) throw new Error('Missing VITE_OPENAI_API_KEY');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
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
    throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function getFinancialInsights({
  currentMonthIncome,
  currentMonthExpense,
  prevMonthIncome,
  prevMonthExpense,
  savingsRate,
  topCategories,
  budgetAlerts,
  dailyAvg,
}) {
  const messages = [
    {
      role: 'system',
      content:
        'คุณเป็นที่ปรึกษาการเงินส่วนตัวสำหรับคนไทย ตอบเป็นภาษาไทย สั้นกระชับ 3-5 bullet points ใช้ตัวเลขอ้างอิงจริงจากข้อมูลที่ให้ ห้ามแต่งตัวเลขเอง ให้คำแนะนำที่นำไปปฏิบัติได้ ใช้ markdown bullet list',
    },
    {
      role: 'user',
      content: `สรุปการเงินของฉัน:
- รายรับเดือนนี้: ${currentMonthIncome} บาท
- รายจ่ายเดือนนี้: ${currentMonthExpense} บาท
- รายรับเดือนก่อน: ${prevMonthIncome} บาท
- รายจ่ายเดือนก่อน: ${prevMonthExpense} บาท
- อัตราการออม: ${savingsRate.toFixed(1)}%
- ค่าใช้จ่ายเฉลี่ย/วัน: ${dailyAvg.toFixed(0)} บาท
- หมวดที่ใช้จ่ายสูงสุด: ${topCategories.map((c) => `${c.name} (${c.value} บาท)`).join(', ')}
- แจ้งเตือนงบ: ${budgetAlerts.length > 0 ? budgetAlerts.join(', ') : 'ไม่มี'}

วิเคราะห์และให้คำแนะนำสั้นๆ`,
    },
  ];
  return chatCompletion(messages);
}

export async function suggestCategory(note, availableCategories, type) {
  if (!note.trim() || availableCategories.length === 0) return null;
  const messages = [
    {
      role: 'system',
      content:
        'คุณช่วยจัดหมวดหมู่รายการทางการเงิน ตอบเฉพาะชื่อหมวดหมู่เท่านั้น 1 คำตอบ ไม่ต้องอธิบาย ถ้าไม่แน่ใจให้ตอบหมวดที่ใกล้เคียงที่สุด',
    },
    {
      role: 'user',
      content: `หมวดหมู่ ${type === 'income' ? 'รายรับ' : 'รายจ่าย'} ที่มี: ${availableCategories.join(', ')}\n\nรายการ: "${note}"\n\nหมวดหมู่ที่เหมาะสมที่สุด:`,
    },
  ];
  const result = await chatCompletion(messages, { temperature: 0.2, max_tokens: 50 });
  const cleaned = result.trim().replace(/["']/g, '');
  return availableCategories.find((c) => cleaned.includes(c)) || null;
}

export async function getBudgetAdvice(spendingByCategory, existingBudgets) {
  const messages = [
    {
      role: 'system',
      content:
        'คุณเป็นที่ปรึกษางบประมาณส่วนตัว ตอบเป็นภาษาไทย ให้คำแนะนำงบประมาณที่เหมาะสมตามพฤติกรรมจริง ตอบเป็น markdown bullet list สั้นๆ แต่ละหมวดบอกตัวเลขที่แนะนำ',
    },
    {
      role: 'user',
      content: `ค่าใช้จ่ายเฉลี่ยต่อเดือน (3 เดือนล่าสุด) แยกตามหมวด:
${spendingByCategory.map((c) => `- ${c.category}: ${c.avgMonthly.toFixed(0)} บาท/เดือน`).join('\n')}

งบประมาณที่ตั้งไว้:
${existingBudgets.length > 0 ? existingBudgets.map((b) => `- ${b.category}: ${b.amount} บาท`).join('\n') : 'ยังไม่ได้ตั้งงบ'}

แนะนำงบประมาณที่เหมาะสมต่อหมวดหมู่ พร้อมเหตุผลสั้นๆ`,
    },
  ];
  return chatCompletion(messages);
}

export async function getSpendingPlan({ budget, days, fixedExpenses, goals, lifestyle }) {
  const messages = [
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
  ];
  return chatCompletion(messages, { max_tokens: 2048 });
}

export async function detectAnomalies(recentTransactions, categoryAverages) {
  if (recentTransactions.length === 0) return null;
  const messages = [
    {
      role: 'system',
      content:
        'คุณช่วยตรวจจับรายจ่ายผิดปกติ ตอบเป็นภาษาไทย ถ้ามีรายจ่ายที่สูงผิดปกติ (เกิน 2 เท่าของค่าเฉลี่ย) ให้แจ้งเตือน ถ้าไม่มีอะไรผิดปกติตอบ "NONE" เท่านั้น ถ้ามีให้ตอบสั้นๆ เป็น markdown bullet',
    },
    {
      role: 'user',
      content: `ค่าเฉลี่ยรายจ่ายต่อหมวดหมู่ (ต่อรายการ):
${categoryAverages.map((c) => `- ${c.category}: เฉลี่ย ${c.avg.toFixed(0)} บาท/รายการ`).join('\n')}

รายจ่ายล่าสุด 10 รายการ:
${recentTransactions.map((t) => `- ${t.category}: ${t.amount} บาท${t.note ? ` (${t.note})` : ''}`).join('\n')}

มีรายจ่ายที่สูงผิดปกติหรือไม่?`,
    },
  ];
  const result = await chatCompletion(messages, { temperature: 0.2 });
  return result.trim() === 'NONE' ? null : result;
}
