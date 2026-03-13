// src/hooks/useAuth.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { apiCall } from '../api/api'; // Assuming api.js exists

export const useAuth = (loadUserData, showMessage) => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [jwt, setJwt] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const hasAttemptedAutoLogin = useRef(false);

  const verifyJWT = useCallback(async (token) => {
    if (!token) return false;
    try {
      await apiCall('/auth/verify/', { method: 'POST', body: JSON.stringify({ token }) });
      return true;
    } catch (error) {
      // Token is invalid or expired
      return false;
    }
  }, []);

  const loginWithWallet = useCallback(async () => {
    if (!address) return;
    try {
      setAuthLoading(true);
      localStorage.removeItem('jwt');

      // 1. Get nonce
      const { nonce } = await apiCall('/auth/nonce/', {
        method: 'POST',
        body: JSON.stringify({ address }),
      });

      // 2. Sign message
      const message = `Sign in to Studyverse\n\nNonce: ${nonce}`;
      const signature = await signMessageAsync({ message });

      // 3. Verify signature and get JWT
      const data = await apiCall('/auth/wallet/', {
        method: 'POST',
        body: JSON.stringify({ address, signature }),
      });

      setJwt(data.access);
      localStorage.setItem('jwt', data.access);

      // 4. Load user data 
      await loadUserData(data.access);
      showMessage('Successfully logged in!', 'success');
    } catch (error) {
      console.error('Login error:', error);
      showMessage(`Login failed: ${error.message || 'Check console.'}`, 'error');
      setJwt(null);
      localStorage.removeItem('jwt');
    } finally {
      setAuthLoading(false);
    }
  }, [address, signMessageAsync, loadUserData, showMessage]);

  useEffect(() => {
    const initAuth = async () => {
      if (!isConnected || !address) {
        setJwt(null);
        hasAttemptedAutoLogin.current = false;
        return;
      }

      const storedToken = localStorage.getItem('jwt');

      if (storedToken) {
        const valid = await verifyJWT(storedToken);
        if (valid) {
          setJwt(storedToken);
          await loadUserData(storedToken);
          return;
        } else {
          localStorage.removeItem('jwt'); // Token is invalid/expired, remove it.
        }
      }
      // If no valid stored token, and we haven't already tried to auto-login during this session, prompt for fresh login
      if (!hasAttemptedAutoLogin.current && !authLoading) {
        hasAttemptedAutoLogin.current = true;
        loginWithWallet();
      }
    };

    initAuth();
  }, [isConnected, address, verifyJWT, loadUserData, loginWithWallet, authLoading]);

  return { jwt, authLoading, loginWithWallet };
};