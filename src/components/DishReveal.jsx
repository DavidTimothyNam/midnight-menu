// src/components/DishReveal.jsx

export default function DishReveal({
  dishText,
  selectedIngredients,
  selectedMethod,
  onServeDish,
}) {
  return (
    <section className="dish-reveal-card">
      <p className="eyebrow">A dish emerges</p>

      <div className="dish-reveal-hero" aria-hidden="true">
        {selectedMethod.emoji}
      </div>

      <h1>{dishText.dishName}</h1>
      <p className="dish-description">{dishText.dishDescription}</p>

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

      <button className="serve-button" type="button" onClick={onServeDish}>
        Serve this dish
      </button>
    </section>
  );
}
