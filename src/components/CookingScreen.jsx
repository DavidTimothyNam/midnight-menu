// src/components/CookingScreen.jsx

export default function CookingScreen({
  customer,
  selectedIngredients,
  selectedMethod,
  isEnding = false,
}) {
  return (
    <div className={`cooking-screen ${isEnding ? "is-ending" : ""}`}>
      <div className="cooking-pot" aria-hidden="true">
        🍲
      </div>

      <p className="eyebrow">Midnight kitchen</p>

      <h2>Preparing the dish...</h2>

      <div className="floating-ingredients" aria-hidden="true">
        {selectedIngredients.map((ingredient) => (
          <span key={ingredient.id}>{ingredient.emoji}</span>
        ))}
        <span>{selectedMethod.emoji}</span>
      </div>

      <div className="cooking-steps">
        <p>Gathering the feeling...</p>
        <p>
          {getMethodAction(selectedMethod.name)} under soft kitchen light...
        </p>
        <p>Listening for {customer.name}’s craving...</p>
      </div>
    </div>
  );
}

function getMethodAction(methodName) {
  const actions = {
    Simmer: "Simmering",
    Roast: "Roasting",
    Chill: "Chilling",
    Whisk: "Whisking",
  };

  return actions[methodName] ?? "Preparing";
}
