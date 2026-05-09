// src/App.jsx

import { useState } from "react";
import { ingredients } from "./data/ingredients";
import { methods } from "./data/methods";
import IngredientCard from "./components/IngredientCard";
import MethodPicker from "./components/MethodPicker";
import "./styles/index.css";

export default function App() {
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");

  const canServe =
    selectedIngredientIds.length === 3 && selectedMethodId.length > 0;

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
    console.log({
      selectedIngredientIds,
      selectedMethodId,
    });
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Midnight Menu</p>
        <h1>Build tonight&apos;s dish</h1>
        <p className="intro">
          Choose three ingredients and one cooking method. Each choice changes
          the emotional shape of the meal.
        </p>

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
      </section>
    </main>
  );
}
