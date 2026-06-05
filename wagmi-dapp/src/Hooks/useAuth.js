// src/hooks/useAuth.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { apiCall } from '../api/api'; // Assuming api.js exists

export const useAuth = (showMessage) => {
  const { address, isConnected, status } = useAccount();
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
          return false;
      }
  }, []);

  const loginWithWallet = useCallback(async () => {
      if (!address) return;
      try {
          setAuthLoading(true);
          const { nonce } = await apiCall('/auth/nonce/', {
              method: 'POST',
              body: JSON.stringify({ address }),
          });

          const message = `Sign in to Studyverse\n\nNonce: ${nonce}`;
          const signature = await signMessageAsync({ message });

          const data = await apiCall('/auth/wallet/', {
              method: 'POST',
              body: JSON.stringify({ address, signature }),
          });

          setJwt(data.access);
          localStorage.setItem('jwt', data.access);
          localStorage.setItem('auth_type', 'wallet');

          showMessage('Successfully logged in with wallet!', 'success');
      } catch (error) {
          console.error('Login error:', error);
          showMessage(`Login failed: ${error.message || 'Check console.'}`, 'error');
          setJwt(null);
          localStorage.removeItem('jwt');
      } finally {
          setAuthLoading(false);
      }
  }, [address, signMessageAsync, showMessage]);

  const loginWithGoogle = useCallback(async (googleResponse) => {
      try {
          setAuthLoading(true);
          const data = await apiCall('/auth/google/', {
              method: 'POST',
              body: JSON.stringify({ token: googleResponse.credential }),
          });

          setJwt(data.access);
          localStorage.setItem('jwt', data.access);
          localStorage.setItem('auth_type', 'google');

          showMessage('Successfully logged in with Google!', 'success');
          return true;
      } catch (error) {
          console.error('Google login error:', error);
          showMessage(`Google login failed: ${error.message}`, 'error');
          return false;
      } finally {
          setAuthLoading(false);
      }
  }, [showMessage]);

  const linkWallet = useCallback(async () => {
      if (!address) {
          showMessage('Please connect your wallet first', 'warning');
          return;
      }
      try {
          setAuthLoading(true);
          const { nonce } = await apiCall('/auth/nonce/', {
              method: 'POST',
              body: JSON.stringify({ address }),
          });

          const message = `Link wallet to Studyverse account\n\nNonce: ${nonce}`;
          const signature = await signMessageAsync({ message });

          await apiCall('/auth/link-wallet/', {
              method: 'POST',
              body: JSON.stringify({ address, signature, nonce }),
          });

          showMessage('Wallet linked successfully!', 'success');
          return true;
      } catch (error) {
          console.error('Wallet link error:', error);
          showMessage(`Linking failed: ${error.message}`, 'error');
          return false;
      } finally {
          setAuthLoading(false);
      }
  }, [address, signMessageAsync, showMessage]);

  useEffect(() => {
      const initAuth = async () => {
          if (status === 'connecting' || status === 'reconnecting') return;

          const storedToken = localStorage.getItem('jwt');
          const authType = localStorage.getItem('auth_type');

          if (!storedToken) {
              setJwt(null);
              return;
          }

          const valid = await verifyJWT(storedToken);
          if (valid) {
              setJwt(storedToken);
              
              if (authType === 'wallet' && !isConnected) {
                  // Option: keep logged in, but some actions will require re-connect
              }
          } else {
              localStorage.removeItem('jwt');
              localStorage.removeItem('auth_type');
              setJwt(null);
          }
      };

      initAuth();
  }, [isConnected, status, verifyJWT]);

  const logout = useCallback(() => {
    setJwt(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('auth_type');
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
      try {
          setAuthLoading(true);
          const data = await apiCall('/auth/password/', {
              method: 'POST',
              body: JSON.stringify({ email, password }),
          });

          setJwt(data.access);
          localStorage.setItem('jwt', data.access);
          localStorage.setItem('auth_type', 'email');

          showMessage('Successfully logged in with email!', 'success');
          return true;
      } catch (error) {
          console.error('Email login error:', error);
          showMessage(`Email login failed: ${error.message || 'Check credentials.'}`, 'error');
          return false;
      } finally {
          setAuthLoading(false);
      }
  }, [showMessage]);

  return { jwt, authLoading, loginWithWallet, loginWithGoogle, loginWithEmail, linkWallet, logout };
};