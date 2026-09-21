'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { erc20Abi, USDC_BASE_ADDRESS, LAUNCH_DOMAIN } from '@/config/constants';

export function usePermit2() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isApproving, setIsApproving] = useState(false);

  // Check existing allowance for LAUNCH_DOMAIN.verifyingContract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_BASE_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, LAUNCH_DOMAIN.verifyingContract as `0x${string}`] : undefined,
  });

  const checkAndApproveUsdc = async (requiredAmountWei: bigint) => {
    if (!address) throw new Error('Wallet not connected');

    const currentAllowance = (allowance as bigint) || 0n;
    if (currentAllowance >= requiredAmountWei) {
      return true;
    }

    try {
      setIsApproving(true);
      const tx = await writeContractAsync({
        address: USDC_BASE_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [LAUNCH_DOMAIN.verifyingContract as `0x${string}`, requiredAmountWei],
      });

      await refetchAllowance();
      return tx;
    } finally {
      setIsApproving(false);
    }
  };

  return {
    allowance: (allowance as bigint) || 0n,
    isApproving,
    checkAndApproveUsdc,
    refetchAllowance,
  };
}
