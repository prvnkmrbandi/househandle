export default function MiniTicket({ rows, total }) {
  return (
    <div className="mini-ticket">
      {rows.map((r, i) => (
        <div className="mt-row" key={i}>
          <span>{r.label}</span>
          <span>{r.value}</span>
        </div>
      ))}
      {total && (
        <div className="mt-total">
          <span>{total.label}</span>
          <span>{total.value}</span>
        </div>
      )}
    </div>
  );
}
