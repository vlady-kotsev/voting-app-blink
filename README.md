# Solana Voting System

A decentralized voting system built on Solana blockchain that allows users to vote for their favorite team using Solana Actions and Blinks.

## Features

- Decentralized voting system using Solana blockchain
- Vote for teams (Levski vs CSKA)
- Integration with Phantom Wallet
- Uses Solana Actions and Blinks for seamless transaction experience
- Built with Anchor framework

## Tech Stack

- Solana Blockchain
- Anchor Framework
- Next.js
- TypeScript
- Phantom Wallet
- Solana Actions & Blinks

## Prerequisites

- Node.js 14+ and npm
- Rust and Cargo
- Solana CLI tools
- Anchor CLI
- Phantom Wallet browser extension

## Installation

1. Clone the repository
2. Install dependencies

```bash
git clone <your-repo-url>
cd <repo-folder>
npm install
cd anchor
anchor build
```

3. Start local Solana cluster

```bash
solana-test-validator
```

4. Deploy the program to the local cluster

```bash
anchor deploy --provider.cluster localhost
```

5. Initialize the voting system (run tests)

```bash
anchor test --provider.cluster localhost
```

6. Start the Next.js development server

```bash
npm run dev
```

7. Set Phantom wallet to use the local cluster and fund account with:

```bash
solana airdrop <your-account-pubkey> --url http://localhost:8899
```

8. Open [Blink test environment](https://dial.to/?action=solana-action:http://localhost:3000/api/vote) in Browser to interact with voting program via _Blink_

- The transaction can be checked in the local cluster logs:

```bash
solana logs --url localhost
```
