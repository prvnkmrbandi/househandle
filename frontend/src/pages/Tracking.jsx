import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { key: 'confirmed', title: 'Booking confirmed' },
  { key: 'on_way', title: 'Pro on the way' },
  { key: 'in_progress', title: 'Job in progress' },
  { key: 'complete', title: 'Complete & paid' }
];

export default function Tracking() {
  const [stepIndex, setStepIndex] = useState(1);
  const navigate = useNavigate();

  function advance() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // In production: call api.completeBooking(booking.id) here
      navigate('/rate');
    }
  }

  return (
    <div className="screen">
      <div className="s-h1">Job status</div>
      <div className="s-sub">{STEPS[stepIndex].title}</div>

      <div className="steps-track">
        {STEPS.map((s, i) => (
          <div key={s.key} className={'st' + (i < stepIndex ? ' done' : i === stepIndex ? ' current' : '')}>
            <div className="dot"></div>
            <div>
              <div className="tt">{s.title}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-app" onClick={advance}>Simulate next step</button>
    </div>
  );
}
