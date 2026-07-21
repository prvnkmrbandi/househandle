const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function joinWaitlist({ email, role, postcode }) {
  const res = await fetch(`${API_URL}/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role, postcode })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Something went wrong — please try again.');
  }
  return res.json();
}
