// src/components/FinalSummary.jsx

export default function FinalSummary({ servedDishes, onRestart }) {
  const totalScore = servedDishes.reduce((sum, dish) => sum + dish.result.score, 0);
  const averageScore = Math.round(totalScore / servedDishes.length);

  return (
    <section className="final-summary">
      <p className="eyebrow">Closing time</p>
      <h1>The night is complete</h1>

      <p className="intro">
        You served {servedDishes.length} midnight customers with an average score
        of <strong>{averageScore}</strong>.
      </p>

      <div className="summary-list">
        {servedDishes.map((dish, index) => (
          <article className="summary-card" key={dish.customer.id}>
            <h2>
              {index + 1}. {dish.customer.emoji} {dish.customer.name}
            </h2>

            <p className="summary-score">{dish.result.score} / 100</p>

            <p>
              <strong>Ingredients:</strong>{" "}
              {dish.selectedIngredients
                .map((ingredient) => `${ingredient.emoji} ${ingredient.name}`)
                .join(", ")}
            </p>

            <p>
              <strong>Method:</strong> {dish.selectedMethod.emoji}{" "}
              {dish.selectedMethod.name}
            </p>

            <div className="trait-list">
              {dish.result.matchedTraits.map((trait) => (
                <span className="trait-pill" key={trait}>
                  {trait}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <button className="serve-button" type="button" onClick={onRestart}>
        Open for another night
      </button>
    </section>
  );
}