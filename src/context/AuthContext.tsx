'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyName: string;
  authProvider: string;
  emailVerified?: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  companyName: string;
  country?: string;
  gstNumber?: string;
  whatsappNumber?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  authHeaders: () => Record<string, string>;
  authFetch: (url: string, init?: RequestInit) => Promise<Response>;
  setAuthFromOAuth: (accessToken: string, refreshToken: string, user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'mge_auth';

interface StoredAuth {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

function load(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

function save(data: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clear() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const stored = load();
    if (stored?.user && stored?.accessToken) {
      setUser(stored.user);
      setAccessToken(stored.accessToken);
    }
    setIsLoading(false);
  }, []);

  const applyAuth = useCallback((stored: StoredAuth) => {
    save(stored);
    setUser(stored.user);
    setAccessToken(stored.accessToken);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message ?? 'Login failed');
    const d = body.data ?? body;
    applyAuth({
      accessToken: d.accessToken,
      refreshToken: d.refreshToken,
      user: {
        email: d.email,
        firstName: d.firstName,
        lastName: d.lastName,
        role: d.role,
        companyName: d.companyName ?? '',
        authProvider: d.authProvider ?? 'LOCAL',
      },
    });
  }, [applyAuth]);

  const register = useCallback(async (data: RegisterData) => {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message ?? 'Registration failed');
    const d = body.data ?? body;
    applyAuth({
      accessToken: d.accessToken,
      refreshToken: d.refreshToken,
      user: {
        email: d.email,
        firstName: d.firstName,
        lastName: d.lastName,
        role: d.role,
        companyName: d.companyName ?? '',
        authProvider: d.authProvider ?? 'LOCAL',
      },
    });
  }, [applyAuth]);

  const logout = useCallback(() => {
    clear();
    setUser(null);
    setAccessToken(null);
  }, []);

  useEffect(() => { accessTokenRef.current = accessToken; }, [accessToken]);

  const authHeaders = useCallback((): Record<string, string> => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  const authFetch = useCallback(async (url: string, init?: RequestInit): Promise<Response> => {
    const token = accessTokenRef.current;
    const headers: Record<string, string> = {
      ...(init?.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(url, { ...init, headers });
    if (res.status === 401) {
      clear();
      setUser(null);
      setAccessToken(null);
      router.push('/login');
    }
    return res;
  }, [router]);

  const setAuthFromOAuth = useCallback((token: string, refreshToken: string, u: AuthUser) => {
    applyAuth({ accessToken: token, refreshToken, user: u });
  }, [applyAuth]);

  return (
    <AuthContext.Provider value={{
      user, accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoading,
      login, register, logout, authHeaders, authFetch, setAuthFromOAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
