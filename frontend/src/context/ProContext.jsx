import { createContext, useContext, useState } from 'react';

const ProContext = createContext(null);

// Same temporary approach as DEMO_CUSTOMER_ID in BookingContext.jsx —
// replace with a real value from your `pros` table, or with real login later.
const DEMO_PRO_ID = 'd0b79e84-98a5-478b-a6f7-e419397a905e';

export function ProProvider({ children }) {
  const [available, setAvailable] = useState(true);
  const [lastEarnings, setLastEarnings] = useState([]); // completed jobs this session

  const value = {
    proId: DEMO_PRO_ID,
    available, setAvailable,
    lastEarnings, setLastEarnings
  };

  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}

export function usePro() {
  const ctx = useContext(ProContext);
  if (!ctx) throw new Error('usePro must be used inside ProProvider');
  return ctx;
}
