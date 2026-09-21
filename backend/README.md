# Multiplatform Launch Backend Engine

A high-performance, resilient backend system for cross-chain token launches across Base, Solana, BNB Chain, and Robinhood.

## Architecture Highlights
- **Multi-Chain Builders**: Specialized calldata and instruction builders for Four.meme, Pons V2, Genius.fun, Pump.fun, and Stonk.fun.
- **Relayer & Worker Queue**: BullMQ & Redis-backed job queues for resilient on-chain transaction execution with automated nonce escalation and priority fee adjustments.
- **Intent Verification**: EIP-712 typed signature verification and ERC-20 allowance confirmation.
- **IPFS Storage**: Decentralized metadata and asset pinning via Pinata SDK.
- **Real-time Updates**: WebSocket gateway broadcasting deployment progress, confirmations, and mint status to frontends.
- **Database & State**: PostgreSQL with Prisma ORM tracking users, quotes, launch requests, and relayer transactions.

## Getting Started

### 1. Prerequisites
- Node.js >= 18
- Docker & Docker Compose

### 2. Infrastructure Setup
Spin up PostgreSQL and Redis:
```bash
docker-compose up -d
```

### 3. Environment Variables
Copy `.env.example` to `.env` and configure credentials:
```bash
cp .env.example .env
```

### 4. Database Setup
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5. Run Server
Development mode:
```bash
npm run start:dev
```
Production build:
```bash
npm run build
npm start
```
