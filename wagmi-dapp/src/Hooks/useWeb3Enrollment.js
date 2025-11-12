// ...existing code...
import { useState, useCallback, useMemo } from 'react'; // ADD useMemo
import { useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem'; // 🎯 CHANGE: Import parseUnits
import { COURSE_CONTRACT_ADDRESS, COURSE_CONTRACT_ABI } from '../web3/constants';

export default function useWeb3Enrollment(coursePrice) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

    // 🎯 USE useMemo and parseUnits for guaranteed 18-decimal precision
  const valueInWei = useMemo(() => {
        if (!coursePrice) return 0n;
        try {
            // Converts the price string (e.g., "0.05") into its Wei equivalent
            // using exactly 18 decimal places, preventing rounding issues.
            return parseUnits(String(coursePrice), 18);
        } catch (error) {
            // Log this error to catch malformed strings from the backend
            console.error("Error parsing course price to Wei:", error);
            return 0n;
        }
    }, [coursePrice]);
  

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [prepareError, setPrepareError] = useState(null);

  const isReady = !!walletClient && !!coursePrice && valueInWei > 0n; 

  console.log("Web3 Enroll Debug:", {
        coursePriceString: String(coursePrice),
        valueInWei: valueInWei.toString(),
        contractAddress: COURSE_CONTRACT_ADDRESS
    });

  const writeEnroll = useCallback(async () => {
    if (!walletClient) {
      const err = new Error('No wallet client available');
      setPrepareError(err);
      setIsError(true);
      throw err;
    }

    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);
    setPrepareError(null);

    try {
      const result = await walletClient.writeContract({
        address: COURSE_CONTRACT_ADDRESS,
        abi: COURSE_CONTRACT_ABI,
        functionName: 'enroll',
        value: valueInWei,
      });

      const hash = result?.hash ?? result;
      setTxHash(hash);

      // use publicClient.waitForTransaction (compatible with installed viem/wagmi)
      const receipt = await publicClient.waitForTransaction({ hash });
      if (receipt?.status === 1) {
        setIsSuccess(true);
      } else {
        setIsError(true);
      }

      setIsLoading(false);
      return { result, receipt };
    } catch (err) {
      setPrepareError(err);
      setIsError(true);
      setIsLoading(false);
      throw err;
    }
  }, [walletClient, publicClient, valueInWei]);

  return {
    writeEnroll,
    isLoading,
    isError,
    isSuccess,
    txHash,
    isReady,
    prepareError,
  };
}

export { useWeb3Enrollment };