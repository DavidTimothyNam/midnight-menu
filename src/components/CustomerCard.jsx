// src/components/CustomerCard.jsx

export default function CustomerCard({ customer, roundNumber, totalRounds }) {
  return (
    <section className="customer-card">
      <p className="eyebrow">
        Customer {roundNumber} / {totalRounds}
      </p>

      <div className="customer-heading">
        <div className="customer-emoji" aria-hidden="true">
          {customer.emoji}
        </div>

        <div>
          <h1>{customer.name}</h1>
          <p className="customer-request">“{customer.requestText}”</p>
        </div>
      </div>
    </section>
  );
}
