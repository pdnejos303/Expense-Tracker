# Expense Tracker

Personal finance app for Thai-speaking users. React 18 + Vite, MUI v6, Firebase, Recharts.

## Design Context

### Users
Thai-speaking individuals managing personal finances. They use this app to track daily income and expenses, set budgets by category, and review spending trends over time. The primary job-to-be-done is maintaining financial awareness and control through clear, actionable data. Users interact via both desktop and mobile browsers.

### Brand Personality
**Modern, Minimal, Professional** — the interface should feel like a capable financial tool, not a toy. It conveys competence and clarity. The tone is confident and straightforward, helping users feel in control of their money.

### Aesthetic Direction
- **Bold & data-rich**: Dense, information-forward dashboards with strong color contrasts. Charts and numbers are the hero elements.
- **Color system**: Green primary (`#4caf50`) for positive/income, orange-red secondary (`#ff5722`) for alerts/expenses. User-configurable primary color via settings.
- **Components**: MUI v6 Paper cards, AppBar, responsive drawer navigation. Keep surfaces flat with subtle elevation. Prefer data tables and charts over decorative elements.
- **Anti-references**: Avoid playful/gamified finance apps. No excessive rounded corners, illustrations, or emoji-heavy UI. This is a serious tool.

### Design Principles
1. **Data first** — Every screen should prioritize showing the user their financial data clearly. Reduce chrome, maximize signal.
2. **Instant clarity** — A user should understand their financial position within seconds of seeing any page. Use color coding (green/red), clear labels in Thai, and prominent numbers.
3. **Compact density** — Favor information density over whitespace. Show more rows, more charts, more context per viewport.
4. **Consistent visual language** — Income is always green/positive, expenses are always red/negative. Budget progress uses the same color scale everywhere.
5. **Accessible by default** — Meet WCAG AA standards: sufficient color contrast, keyboard navigable, screen-reader friendly labels.
