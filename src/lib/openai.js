import { functions } from './firebase';

// The OpenAI key lives only in the Cloud Function (secret: OPENAI_API_KEY).
// Prompts are assembled server-side too, so the browser only ever ships the
// numbers it already has on screen.
const callAiAssist = functions.httpsCallable('aiAssist', { timeout: 120000 });

async function chatCompletion(action, payload) {
  const result = await callAiAssist({ action, payload });
  return result.data?.content ?? '';
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
  return chatCompletion('insights', {
    currentMonthIncome,
    currentMonthExpense,
    prevMonthIncome,
    prevMonthExpense,
    savingsRate,
    topCategories: topCategories.map((c) => ({ name: c.name, value: c.value })),
    budgetAlerts,
    dailyAvg,
  });
}

export async function suggestCategory(note, availableCategories, type) {
  if (!note.trim() || availableCategories.length === 0) return null;
  const result = await chatCompletion('suggestCategory', {
    note,
    availableCategories,
    type,
  });
  const cleaned = result.trim().replace(/["']/g, '');
  return availableCategories.find((c) => cleaned.includes(c)) || null;
}

export async function getBudgetAdvice(spendingByCategory, existingBudgets) {
  return chatCompletion('budgetAdvice', {
    spendingByCategory: spendingByCategory.map((c) => ({
      category: c.category,
      avgMonthly: c.avgMonthly,
    })),
    existingBudgets: existingBudgets.map((b) => ({
      category: b.category,
      amount: b.amount,
    })),
  });
}

export async function getSpendingPlan({ budget, days, fixedExpenses, goals, lifestyle }) {
  return chatCompletion('spendingPlan', { budget, days, fixedExpenses, goals, lifestyle });
}

export async function detectAnomalies(recentTransactions, categoryAverages) {
  if (recentTransactions.length === 0) return null;
  const result = await chatCompletion('detectAnomalies', {
    recentTransactions: recentTransactions.map((t) => ({
      category: t.category,
      amount: t.amount,
      note: t.note,
    })),
    categoryAverages: categoryAverages.map((c) => ({
      category: c.category,
      avg: c.avg,
    })),
  });
  return result.trim() === 'NONE' ? null : result;
}
