# UK Autumn Budget 2025: Local area analysis

Interactive dashboard exploring how the UK Autumn Budget 2025 affects households at the constituency level.

**Live demo:** https://autumn-budget-local-area.vercel.app

## Features

- **Constituency-level analysis**: Select any of the 650 UK constituencies to see local impacts
- **Policy selection**: Toggle individual budget provisions to see their effects
- **Year comparison**: View projected impacts from 2026-27 to 2030-31
- **Multiple visualizations**:
  - Impact by family type
  - Household impact trends over time
  - Income distribution analysis (absolute and relative)
  - Interactive constituency map
  - Household scatter plots

## Policies included

- 2 child limit repeal
- Fuel duty freeze extension
- Rail fares freeze
- Threshold freeze extension
- Dividend tax increase (+2pp)
- Savings income tax increase (+2pp)
- Property income tax increase (+2pp)
- Student loan repayment threshold freeze
- Salary sacrifice NIC cap

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Built with

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [D3.js](https://d3js.org/) for visualizations
- [Recharts](https://recharts.org/) for charts

## Data

Analysis powered by [PolicyEngine](https://policyengine.org/).
