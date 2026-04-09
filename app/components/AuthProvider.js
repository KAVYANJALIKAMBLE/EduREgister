'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [hasAccount, setHasAccount] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accounts = JSON.parse(localStorage.getItem('eduregister_accounts') || '[]');
    setHasAccount(accounts.length > 0);
    const session = localStorage.getItem('eduregister_session');
    if (session) {
      setIsLoggedIn(true);
      setUsername(session);
    }
    setLoading(false);
  }, []);

  const signup = useCallback(async (user, pass) => {
    if (!user.trim() || !pass.trim()) throw new Error('Username and password are required');
    if (pass.length < 4) throw new Error('Password must be at least 4 characters');
    const accounts = JSON.parse(localStorage.getItem('eduregister_accounts') || '[]');
    if (accounts.find(a => a.username === user)) throw new Error('Username already exists');
    const hash = await sha256(pass);
    accounts.push({ username: user, passwordHash: hash });
    localStorage.setItem('eduregister_accounts', JSON.stringify(accounts));
    localStorage.setItem('eduregister_session', user);
    setUsername(user);
    setIsLoggedIn(true);
    setHasAccount(true);
  }, []);

  const login = useCallback(async (user, pass) => {
    const accounts = JSON.parse(localStorage.getItem('eduregister_accounts') || '[]');
    const account = accounts.find(a => a.username === user);
    if (!account) throw new Error('Invalid username');
    const hash = await sha256(pass);
    if (account.passwordHash !== hash) throw new Error('Invalid password');
    localStorage.setItem('eduregister_session', user);
    setUsername(user);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('eduregister_session');
    setIsLoggedIn(false);
    setUsername('');
  }, []);

  const changePassword = useCallback(async (currentPass, newPass) => {
    if (newPass.length < 4) throw new Error('New password must be at least 4 characters');
    const accounts = JSON.parse(localStorage.getItem('eduregister_accounts') || '[]');
    const idx = accounts.findIndex(a => a.username === username);
    if (idx === -1) throw new Error('Account not found');
    const currentHash = await sha256(currentPass);
    if (accounts[idx].passwordHash !== currentHash) throw new Error('Current password is incorrect');
    accounts[idx].passwordHash = await sha256(newPass);
    localStorage.setItem('eduregister_accounts', JSON.stringify(accounts));
  }, [username]);

  const changeUsername = useCallback(async (currentPass, newUser) => {
    if (!newUser.trim()) throw new Error('Username cannot be empty');
    const accounts = JSON.parse(localStorage.getItem('eduregister_accounts') || '[]');
    const idx = accounts.findIndex(a => a.username === username);
    if (idx === -1) throw new Error('Account not found');
    const hash = await sha256(currentPass);
    if (accounts[idx].passwordHash !== hash) throw new Error('Password is incorrect');
    if (accounts.find(a => a.username === newUser)) throw new Error('Username already taken');
    accounts[idx].username = newUser;
    localStorage.setItem('eduregister_accounts', JSON.stringify(accounts));
    localStorage.setItem('eduregister_session', newUser);
    setUsername(newUser);
  }, [username]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, hasAccount, loading, signup, login, logout, changePassword, changeUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
