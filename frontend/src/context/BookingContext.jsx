import { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

// Placeholder — replace once real login exists (see backend INTEGRATION-GUIDE.md)
const DEMO_CUSTOMER_ID = 'demo-customer-id';

export function BookingProvider({ children }) {
  const [currentService, setCurrentService] = useState(null); // {id, name, category, price}
  const [address, setAddress] = useState({ postcode: 'LE67 3GH', line1: '14 Belvoir Road' });
  const [slot, setSlot] = useState(null); // {label, iso}
  const [booking, setBooking] = useState(null); // the real booking object once created
  const [history, setHistory] = useState([]);

  const value = {
    customerId: DEMO_CUSTOMER_ID,
    currentService, setCurrentService,
    address, setAddress,
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
