// src/App.jsx

import { useState } from "react";
import { ingredients } from "./data/ingredients";
import { methods } from "./data/methods";
import { customers } from "./data/customers";
import { scoreDish } from "./game/scoring";
import IngredientCard from "./components/IngredientCard";
import MethodPicker from "./components/MethodPicker";
import ResultCard from "./components/ResultCard";
import "./styles/index.css";

const currentCustomer = customers[0];

export default function App() {
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [result, setResult] = useState(null);

  const selectedIngredients = ingredients.filter((ingredient) =>
    selectedIngredientIds.includes(ingredient.id),
  );

  const selectedMethod = methods.find((method) => method.id === selectedMethodId);

  const canServe = selectedIngredients.length === 3 && selectedMethod;

  function toggleIngredient(id) {
    setSelectedIngredientIds((currentIds) => {
      if (currentIds.includes(id)) {
        return currentIds.filter((currentId) => currentId !== id);
      }

      if (currentIds.length >= 3) {
        return currentIds;
      }

      return [...currentIds, id];
    });
  }

  function handleServe() {
    const dishResult = scoreDish(
      currentCustomer,
      selectedIngredients,
      selectedMethod,
    );

    setResult(dishResult);
  }

  function resetDish() {
    setSelectedIngredientIds([]);
    setSelectedMethodId("");
    setResult(null);
  }

  return (
    <main className="app-shell">
      <section className="panel">
        {!result ? (
          <>
            <p className="eyebrow">Midnight Menu</p>
            <h1>{currentCustomer.emoji} {currentCustomer.name}</h1>
            <p className="intro">“{currentCustomer.requestText}”</p>

            <p className="selection-count">
              {selectedIngredientIds.length} / 3 ingredients selected
            </p>

            <div className="ingredient-grid">
              {ingredients.map((ingredient) => (
                <IngredientCard
                  key={ingredient.id}
                  ingredient={ingredient}
                  isSelected={selectedIngredientIds.includes(ingredient.id)}
                  isDisabled={selectedIngredientIds.length >= 3}
                  onToggle={toggleIngredient}
                />
              ))}
            </div>

            <MethodPicker
              methods={methods}
              selectedMethodId={selectedMethodId}
              onSelect={setSelectedMethodId}
            />

            <button
              className="serve-button"
              type="button"
              disabled={!canServe}
              onClick={handleServe}
            >
              Serve the dish
            </button>
          </>
        ) : (
          <ResultCard
            customer={currentCustomer}
            selectedIngredients={selectedIngredients}
            selectedMethod={selectedMethod}
            result={result}
            onTryAgain={resetDish}
          />
        )}
      </section>
    </main>
  );
}