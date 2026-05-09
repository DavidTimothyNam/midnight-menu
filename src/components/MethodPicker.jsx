// src/components/MethodPicker.jsx

export default function MethodPicker({ methods, selectedMethodId, onSelect }) {
  return (
    <section className="method-section">
      <h2>Choose a cooking method</h2>
      <p className="section-note">
        Methods add or soften traits, changing how the dish feels.
      </p>

      <div className="method-grid">
        {methods.map((method) => (
          <button
            key={method.id}
            className={`method-card ${
              selectedMethodId === method.id ? "selected" : ""
            }`}
            type="button"
            onClick={() => onSelect(method.id)}
          >
            <div className="method-emoji" aria-hidden="true">
              {method.emoji}
            </div>

            <div>
              <h3>{method.name}</h3>
              <p>{method.description}</p>

              <div className="trait-list">
                {method.adds.map((trait) => (
                  <span className="trait-pill" key={`adds-${trait}`}>
                    + {trait}
                  </span>
                ))}

                {method.softens.map((trait) => (
                  <span className="trait-pill" key={`softens-${trait}`}>
                    softens {trait}
                  </span>
                ))}

                {method.amplifies.map((trait) => (
                  <span className="trait-pill" key={`amplifies-${trait}`}>
                    amplifies {trait}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
