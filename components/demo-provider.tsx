'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { demoEmail } from '@/lib/demo';
type Demo = { email: string; setEmail: (email: string) => void; joined: boolean; setJoined: (joined: boolean) => void; ghost: boolean; setGhost: (ghost: boolean) => void; reset: () => void };
const Context = createContext<Demo | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState(demoEmail);
  const [joined, setJoined] = useState(false);
  const [ghost, setGhost] = useState(false);
  function reset() { setEmail(demoEmail); setJoined(false); setGhost(false); }
  return <Context.Provider value={{ email, setEmail, joined, setJoined, ghost, setGhost, reset }}>{children}</Context.Provider>;
}
export function useDemo() { const value = useContext(Context); if (!value) throw new Error('DemoProvider required'); return value; }

