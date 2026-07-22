// Every function here calls the real backend (server.js).
// Set VITE_API_URL in your .env file to your Render URL once deployed,
// e.g. VITE_API_URL=https://house-handle-backend.onrender.com

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getServices: () => request('/services'),

  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (customer) =>
    request('/customers', { method: 'POST', body: JSON.stringify(customer) }),

  getProBookings: (proId) => request(`/pros/${proId}/bookings`),

  getAllPros: (token) =>
    request('/pros', { headers: { Authorization: `Bearer ${token}` } }),
  updatePro: (proId, updates, token) =>
    request(`/pros/${proId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: { Authorization: `Bearer ${token}` }
    }),

  createBooking: (booking) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(booking) }),

  acceptBooking: (bookingId, proId) =>
    request(`/bookings/${bookingId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ pro_id: proId })
    }),

  declineBooking: (bookingId, proId) =>
    request(`/bookings/${bookingId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ pro_id: proId })
    }),

  proCancelBooking: (bookingId, proId) =>
    request(`/bookings/${bookingId}/pro-cancel`, {
      method: 'POST',
      body: JSON.stringify({ pro_id: proId })
    }),

  completeBooking: (bookingId) =>
    request(`/bookings/${bookingId}/complete`, { method: 'POST' }),

  cancelBooking: (bookingId) =>
    request(`/bookings/${bookingId}/cancel`, { method: 'POST' })
};
