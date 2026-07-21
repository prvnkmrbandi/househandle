import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const { user, profile } = useAuth();

  const [currentService, setCurrentService] = useState(null);
  const [address, setAddress] = useState({ postcode: '', line1: '' });
  const [slot, setSlot] = useState(null);
  const [booking, setBooking] = useState(null);
  const [history, setHistory] = useState([]);

  // Pre-fill address from the customer's saved profile once it loads
  const effectiveAddress = address.postcode
    ? address
    : { postcode: profile?.postcode || '', line1: profile?.address_line1 || '' };

  const value = {
    customerId: user?.id || null, // real Supabase Auth user ID — null if not logged in
    currentService, setCurrentService,
    address: effectiveAddress, setAddress,
    slot, setSlot,
    booking, setBooking,
    history, setHistory
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
