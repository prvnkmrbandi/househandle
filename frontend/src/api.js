// Every function here calls the real backend (server.js).
// Set VITE_API_URL in your .env file to your Render URL once deployed,
// e.g. VITE_API_URL=https://house-handle-backend.onrender.com

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getServices: () => request('/services'),

  createBooking: (booking) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(booking) }),

  acceptBooking: (bookingId, proId) =>
    request(`/bookings/${bookingId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ pro_id: proId })
    }),

  completeBooking: (bookingId) =>
    request(`/bookings/${bookingId}/complete`, { method: 'POST' }),

  cancelBooking: (bookingId) =>
    request(`/bookings/${bookingId}/cancel`, { method: 'POST' })
};
