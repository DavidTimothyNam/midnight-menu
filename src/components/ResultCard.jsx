// src/components/ResultCard.jsx

export default function ResultCard({
  customer,
  selectedIngredients,
  selectedMethod,
  result,
  onContinue,
  isFinalCustomer,
}) {
  return (
    <section className="result-card">
      <p className="eyebrow">Dish served</p>

      <h2>{getResultTitle(result.score)}</h2>

      <p className="result-score">{result.score} / 100</p>

      <p className="customer-reaction">
        {getFallbackReaction(result.score, customer)}
      </p>

      <div className="result-section">
        <h3>Ingredients</h3>
        <p>
          {selectedIngredients
            .map((ingredient) => `${ingredient.emoji} ${ingredient.name}`)
            .join(", ")}
        </p>
      </div>

      <div className="result-section">
        <h3>Method</h3>
        <p>
          {selectedMethod.emoji} {selectedMethod.name}
        </p>
      </div>

      <div className="result-section">
        <h3>Matched traits</h3>
        <TraitList traits={result.matchedTraits} emptyText="None matched" />
      </div>

      <div className="result-section">
        <h3>Missed traits</h3>
        <TraitList traits={result.missedTraits} emptyText="None missed" />
      </div>

      {result.avoidTraitsTriggered.length > 0 && (
        <div className="result-section">
          <h3>Avoided traits triggered</h3>
          <TraitList
            traits={result.avoidTraitsTriggered}
            emptyText="No avoid traits triggered"
          />
        </div>
      )}

      <button className="serve-button" type="button" onClick={onContinue}>
        {isFinalCustomer ? "View final summary" : "Serve the next customer"}
      </button>
    </section>
  );
}

function TraitList({ traits, emptyText }) {
  if (traits.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  return (
    <div className="trait-list">
      {traits.map((trait) => (
        <span className="trait-pill" key={trait}>
          {trait}
        </span>
      ))}
    </div>
  );
}

function getResultTitle(score) {
  if (score >= 90) return "A luminous success";
  if (score >= 70) return "A satisfying dish";
  if (score >= 40) return "Almost what they needed";
  return "A dish with unresolved feelings";
}

function getFallbackReaction(score, customer) {
  if (score >= 90) {
    return `${customer.name} takes one bite and smiles like a window has opened somewhere far away.`;
  }

  if (score >= 70) {
    return `${customer.name} eats slowly, then nods. It is not perfect, but it reaches the right place.`;
  }

  if (score >= 40) {
    return `${customer.name} seems grateful, though their craving still lingers at the edge of the plate.`;
  }

  return `${customer.name} thanks you softly, but the dish does not quite answer the dream they brought in.`;
}