import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Rate() {
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();

  function submit() {
    // In production: POST to a /reviews endpoint with the rating
    navigate('/');
  }

  return (
    <div className="screen">
      <div className="s-h1" style={{textAlign:'center'}}>Job complete</div>
      <div className="s-sub" style={{textAlign:'center'}}>How was your pro?</div>
      <div className="stars">
        {[1,2,3,4,5].map((n) => (
          <span key={n} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}>★</span>
        ))}
      </div>
      <button className="btn-app" onClick={submit}>Submit & done</button>
    </div>
  );
}
