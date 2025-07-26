# 🚀 SmartScribe — AI-Powered Smart Contract Analyzer

🔗 [Watch Demo](https://youtu.be/GyJv31erPmM)  
📁 Source Code: https://github.com/Hazeera65/blockdag-smartscribe  

---

## 🧠 Project Overview

Smart contracts are foundational to Web3 — yet many users interact with them without fully understanding their risks. As a result, users are vulnerable to hidden vulnerabilities, scams, and malicious logic.

**SmartScribe** is an AI-powered smart contract analyzer designed to enhance security, transparency, and understanding in decentralized ecosystems. It enables users to submit any Ethereum smart contract and receive instant, plain-English analysis powered by advanced language models.

---

## 🎯 Problem Addressed

- Most users cannot read or audit Solidity code  
- Rug pulls, scams, and exploits cause significant financial losses  
- Existing tools are developer-centric and complex  
- There's a lack of educational tools for learning smart contract behavior  

---

## 💡 Key Features

### 🔍 Core Analysis
- Contract input via verified address or pasted code  
- Real-time parsing and Solidity validation  
- Contract classification: ERC-20, NFT, DeFi, Proxy, etc.  
- Detection of 15+ vulnerability patterns  
- Risk rating on a scale of 1–10 with severity breakdown  

### 🤖 AI-Powered Understanding
- Uses Groq’s LLaMA 3.3 70B model for real-time interpretation  
- Plain-English summaries of contract logic  
- AI chatbot to answer user questions about contract behavior  
- Voice synthesis for audio summaries  
- Speech recognition for voice-based interaction  

### 📄 Documentation & Sharing
- Automatically generates structured, downloadable PDF reports  
- Clean UI with multi-page interface (Analyze, Examples, About, etc.)  
- MetaMask integration for live interactions and future extensions  

---

## 🧰 Tech Stack

| Layer       | Technologies Used                                    |
|-------------|------------------------------------------------------|
| Frontend    | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion |
| Backend     | Node.js (serverless)                                 |
| Blockchain  | Etherscan API, Ethereum                              |
| AI          | Groq API with LLaMA 3.3 70B                          |
| Voice       | Web Speech API                                       |
| Deployment  | Vercel                                               |

---

## ⚙️ System Architecture

### Input Layer
- Ethereum address format and validation  
- Solidity syntax cleanup and code extraction from Etherscan  

### Processing Layer
- Contract type detection via pattern recognition  
- Risk detection engine for 15+ common vulnerabilities  
- Natural language interpretation using Groq’s LLM  

### Output Layer
- Risk score and vulnerability explanation  
- Human-readable summaries with voice and text interface  
- AI-driven Q&A system and downloadable report  

---

## 📸 Demo Workflow

1. Paste a contract address or Solidity code  
2. Click "Upload for Analysis"  
3. Get an instant contract summary and risk score  
4. Ask follow-up questions using chat or voice  
5. Download PDF report for review or sharing  

▶️ [Watch the Demo Video](https://youtu.be/GyJv31erPmM)

---

## 📚 Educational Value

SmartScribe is built not only for developers but also for everyday users. It simplifies smart contract learning through:
- Preloaded demo contracts  
- Interactive question answering  
- Human-readable analysis outputs  
- Visual and voice-based explanation methods  

---

## 🧩 Future Development

- Support for other blockchains (BSC, Polygon, etc.)  
- Enhanced ML-based vulnerability engine  
- Browser extension for contract preview on dApp sites  
- Public API for security tool integration  
- Solidity-aware fine-tuned LLM models  
- IDE plugin for developer integration  

---
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


## 👥 Team

- 👩‍💻 Ilakkyaa V S – Team Lead ,Groq api integration 
- 👩‍💻 Hazeera B – Solidity Developer, UI/UX  
- **Team Name:** Breakers

---

## 📜 License

This project is open source and licensed under the MIT License.

