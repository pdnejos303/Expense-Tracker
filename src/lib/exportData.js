import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toDate, formatDateTH } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
import i18n from '@/lib/i18n';

// ─── Shared helpers ──────────────────────────────────────

function t(key, opts) {
  return i18n.t(key, opts);
}

function buildTransactionRows(transactions) {
  return transactions.map((item) => {
    const d = toDate(item.date);
    return {
      [t('export.date')]: d ? d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-',
      [t('export.type')]: item.type === 'income' ? t('export.income') : t('export.expense'),
      [t('export.category')]: item.category || '-',
      [t('export.amount')]: item.amount,
      [t('export.note')]: item.note || '',
    };
  });
}

function buildCategorySummary(transactions) {
  const map = {};
  transactions.forEach((item) => {
    const key = `${item.category}__${item.type}`;
    if (!map[key]) map[key] = { category: item.category, type: item.type, total: 0, count: 0 };
    map[key].total += item.amount;
    map[key].count += 1;
  });
  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .map((row) => ({
      [t('export.category')]: row.category || '-',
      [t('export.type')]: row.type === 'income' ? t('export.income') : t('export.expense'),
      [t('export.count')]: row.count,
      [t('export.total')]: row.total,
    }));
}

function buildDailySummary(transactions) {
  const incomeLabel = t('export.income');
  const expenseLabel = t('export.expense');
  const countLabel = t('export.transactionCount');

  const map = {};
  transactions.forEach((item) => {
    const d = toDate(item.date);
    if (!d) return;
    const dateKey = d.toISOString().split('T')[0];
    const dateLabel = d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    if (!map[dateKey]) map[dateKey] = { dateKey, [t('export.date')]: dateLabel, [incomeLabel]: 0, [expenseLabel]: 0, [countLabel]: 0 };
    if (item.type === 'income') map[dateKey][incomeLabel] += item.amount;
    else if (item.type === 'expense') map[dateKey][expenseLabel] += item.amount;
    map[dateKey][countLabel] += 1;
  });
  return Object.values(map)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .map(({ dateKey, ...rest }) => ({
      ...rest,
      [t('export.balance')]: rest[incomeLabel] - rest[expenseLabel],
    }));
}

function computeOverallStats(transactions) {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return {
    totalIncome: income,
    totalExpense: expense,
    net: income - expense,
    count: transactions.length,
  };
}

function getExportFilename(prefix) {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `${prefix}_${stamp}`;
}

// ─── CSV Export ───────────────────────────────────────────

export function exportCSV(transactions) {
  const rows = buildTransactionRows(transactions);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws, { FS: ',', RS: '\n' });
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${getExportFilename('transactions')}.csv`);
}

// ─── Excel Export (multi-sheet with styling) ─────────────

export function exportExcel(transactions) {
  const wb = XLSX.utils.book_new();
  const stats = computeOverallStats(transactions);

  // Sheet 1: All transactions
  const txRows = buildTransactionRows(transactions);
  const wsTransactions = XLSX.utils.json_to_sheet(txRows);
  formatAmountColumn(wsTransactions, txRows, 3);
  setColumnWidths(wsTransactions, [16, 10, 16, 16, 24]);
  XLSX.utils.book_append_sheet(wb, wsTransactions, t('export.allTransactions'));

  // Sheet 2: Daily summary
  const dailyRows = buildDailySummary(transactions);
  const wsDaily = XLSX.utils.json_to_sheet(dailyRows);
  formatAmountColumns(wsDaily, dailyRows, [1, 2, 3]);
  setColumnWidths(wsDaily, [16, 14, 14, 14, 12]);
  XLSX.utils.book_append_sheet(wb, wsDaily, t('export.dailySummary'));

  // Sheet 3: Category summary
  const catRows = buildCategorySummary(transactions);
  const wsCat = XLSX.utils.json_to_sheet(catRows);
  formatAmountColumn(wsCat, catRows, 3);
  setColumnWidths(wsCat, [16, 10, 12, 16]);
  XLSX.utils.book_append_sheet(wb, wsCat, t('export.categorySummary'));

  // Sheet 4: Overview stats
  const overviewData = [
    [t('export.overviewTitle'), ''],
    ['', ''],
    [t('export.totalIncome'), stats.totalIncome],
    [t('export.totalExpense'), stats.totalExpense],
    [t('export.netBalance'), stats.net],
    [t('export.totalCount'), stats.count],
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  setColumnWidths(wsOverview, [18, 16]);
  // Format currency cells
  ['B3', 'B4', 'B5'].forEach((ref) => {
    if (wsOverview[ref]) wsOverview[ref].z = '#,##0.00';
  });
  XLSX.utils.book_append_sheet(wb, wsOverview, t('export.overview'));

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${getExportFilename('report')}.xlsx`);
}

function setColumnWidths(ws, widths) {
  ws['!cols'] = widths.map((w) => ({ wch: w }));
}

function formatAmountColumn(ws, rows, colIndex) {
  formatAmountColumns(ws, rows, [colIndex]);
}

function formatAmountColumns(ws, rows, colIndices) {
  const range = XLSX.utils.decode_range(ws['!ref']);
  colIndices.forEach((colIndex) => {
    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const ref = XLSX.utils.encode_cell({ r, c: colIndex });
      if (ws[ref] && typeof ws[ref].v === 'number') {
        ws[ref].z = '#,##0.00';
      }
    }
  });
}

// ─── PDF Export (improved) ───────────────────────────────

export function exportPDF(transactions) {
  const doc = new jsPDF();
  const stats = computeOverallStats(transactions);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(16);
  doc.text(t('export.financialReport'), pageWidth / 2, 16, { align: 'center' });

  // Date range info
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(t('export.reportDate', { date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }), pageWidth / 2, 23, { align: 'center' });
  doc.setTextColor(0);

  // Summary boxes
  const summaryY = 30;
  const boxW = (pageWidth - 50) / 3;

  const summaryItems = [
    { label: t('export.totalIncome'), value: formatCurrency(stats.totalIncome), color: [34, 197, 94] },
    { label: t('export.totalExpense'), value: formatCurrency(stats.totalExpense), color: [239, 68, 68] },
    { label: t('export.netBalance'), value: formatCurrency(stats.net), color: [59, 130, 246] },
  ];

  summaryItems.forEach((item, i) => {
    const x = 15 + i * (boxW + 10);
    doc.setFillColor(...item.color);
    doc.roundedRect(x, summaryY, boxW, 18, 2, 2, 'F');
    doc.setTextColor(255);
    doc.setFontSize(8);
    doc.text(item.label, x + boxW / 2, summaryY + 7, { align: 'center' });
    doc.setFontSize(11);
    doc.text(item.value, x + boxW / 2, summaryY + 14, { align: 'center' });
  });

  doc.setTextColor(0);

  const incomeLabel = t('export.income');
  const expenseLabel = t('export.expense');

  // Transactions table
  doc.autoTable({
    startY: summaryY + 25,
    head: [[t('export.date'), t('export.type'), t('export.category'), t('export.amount'), t('export.note')]],
    body: transactions.map((item) => [
      formatDateTH(item.date),
      item.type === 'income' ? incomeLabel : expenseLabel,
      item.category || '-',
      item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
      item.note || '',
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 28 },
      3: { halign: 'right', cellWidth: 30 },
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 1) {
        data.cell.styles.textColor = data.cell.raw === incomeLabel ? [22, 163, 74] : [220, 38, 38];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Category summary on new page if there are expenses
  const catRows = buildCategorySummary(transactions);
  if (catRows.length > 0) {
    const catKey = t('export.category');
    const typeKey = t('export.type');
    const countKey = t('export.count');
    const totalKey = t('export.total');

    doc.addPage();
    doc.setFontSize(14);
    doc.text(t('export.byCategorySummary'), pageWidth / 2, 16, { align: 'center' });

    doc.autoTable({
      startY: 24,
      head: [[catKey, typeKey, countKey, totalKey]],
      body: catRows.map((row) => [
        row[catKey],
        row[typeKey],
        row[countKey],
        row[totalKey].toLocaleString('th-TH', { minimumFractionDigits: 2 }),
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right' },
      },
    });
  }

  // Footer on each page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `${t('export.page')} ${i} / ${totalPages}  |  Expense Tracker`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' },
    );
  }

  doc.save(`${getExportFilename('report')}.pdf`);
}
