// src/components/IngredientCard.jsx

export default function IngredientCard({
  ingredient,
  isSelected,
  isDisabled,
  onToggle,
}) {
  return (
    <button
      className={`ingredient-card ${isSelected ? "selected" : ""}`}
      onClick={() => onToggle(ingredient.id)}
      disabled={isDisabled && !isSelected}
      type="button"
    >
      <div className="ingredient-emoji" aria-hidden="true">
        {ingredient.emoji}
      </div>

      <div className="ingredient-content">
        <div className="ingredient-header">
          <h3>{ingredient.name}</h3>
          {isSelected && <span className="selected-pill">Chosen</span>}
        </div>

        <p>{ingredient.description}</p>

        <div className="trait-list">
          {ingredient.traits.map((trait) => (
            <span className="trait-pill" key={trait}>
              {trait}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
