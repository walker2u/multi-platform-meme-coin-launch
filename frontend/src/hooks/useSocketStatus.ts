'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';

export interface LaunchStatusUpdate {
  launchId: string;
  status: string;
  step: string;
  txHash?: string;
  contractAddress?: string;
  message: string;
  timestamp?: string;
}

export function useSocketStatus(launchId: string | null) {
  const { socket, isConnected } = useSocket();
  const [status, setStatus] = useState<string>('QUEUED');
  const [step, setStep] = useState<string>('INITIATING');
  const [txHash, setTxHash] = useState<string | undefined>();
  const [contractAddress, setContractAddress] = useState<string | undefined>();
  const [message, setMessage] = useState<string>('Connecting to relayer network...');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!socket || !launchId) return;

    // Join room for this launch ID
    socket.emit('subscribe_launch', { launchId });

    const handleUpdate = (update: LaunchStatusUpdate) => {
      if (update.launchId === launchId) {
        if (update.status) setStatus(update.status);
        if (update.step) setStep(update.step);
        if (update.txHash) setTxHash(update.txHash);
        if (update.contractAddress) setContractAddress(update.contractAddress);
        if (update.message) {
          setMessage(update.message);
          setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${update.message}`]);
        }
      }
    };

    socket.on('launch_update', handleUpdate);

    return () => {
      socket.off('launch_update', handleUpdate);
    };
  }, [socket, launchId]);

  return {
    isConnected,
    status,
    step,
    txHash,
    contractAddress,
    message,
    logs,
  };
}
