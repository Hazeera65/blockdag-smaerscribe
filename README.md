# SmartScribe Platform

## Project Overview
SmartScribe Platform is an AI-powered web application designed to analyze, compare, and interact with smart contracts and crypto assets. It provides users with tools to inspect contract details, chat with an AI about contract logic, track crypto prices, and receive actionable insights for safer and smarter blockchain interactions.

## Features
- Smart contract analysis and risk insights
- AI chatbot for contract Q&A
- Contract comparison
- NFT metadata inspection
- Real-time crypto market tracking
- User-friendly dashboard

## How It Works
1. Users input or select a smart contract address.
2. The platform fetches and analyzes contract data, displaying key information and risk factors.
3. Users can chat with an AI assistant to ask questions about the contract’s logic, functions, or potential vulnerabilities.
4. The platform offers contract comparison, NFT metadata inspection, and real-time crypto market tracking.
5. All features are accessible through a modern, user-friendly dashboard.

## Novelty
- Combines AI-driven contract analysis and chatbot interaction in one platform.
- Enables non-technical users to understand complex smart contracts through natural language.
- Integrates real-time crypto data and NFT tools for a holistic blockchain experience.
- Focuses on user safety, education, and transparency in the rapidly evolving Web3 space.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm (preferred) or npm/yarn
  - Install pnpm if needed: `npm install -g pnpm`

### Install Dependencies
```sh
pnpm install
# or
npm install
# or
yarn install
```

### Start the Development Server
```sh
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production (Optional)
```sh
pnpm build
pnpm start
```

## Project Structure
- `app/` – Main Next.js app directory (pages, API routes)
- `components/` – React components
- `lib/` – Utility functions and services
- `public/` – Static assets
- `styles/` – Global and component styles

## Troubleshooting
- If you see errors about missing packages, run `pnpm install` again.
- If the port is in use, change the port with: `pnpm dev --port=4000`

## Contribution
- Fork the repo, create a new branch, and submit a pull request!

