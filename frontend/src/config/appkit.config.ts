import { defaultWagmiConfig } from '@reown/appkit/wagmi';
import { base, bsc } from 'wagmi/chains';
import { env } from './env';

export const projectId = env.reownProjectId;

export const metadata = {
  name: 'Multi-Chain Meme Launchpad',
  description: 'Launch meme coins across Solana, Base, BNB, and Robinhood instantly.',
  url: 'https://mylaunchpad.com',
  icons: ['https://mylaunchpad.com/logo.png'],
};

export const wagmiConfig = defaultWagmiConfig({
  chains: [base, bsc],
  projectId,
  metadata,
  ssr: true,
});
