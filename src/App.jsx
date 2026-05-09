// src/App.jsx

import { useState } from "react";
import { ingredients } from "./data/ingredients";
import IngredientCard from "./components/IngredientCard";
import "./App.css";

export default function App() {
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);

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

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Midnight Menu</p>
        <h1>Choose 3 ingredients</h1>
        <p className="intro">
          Pick ingredients that match the customer’s craving. Each one carries
          emotional traits that affect the final dish.
        </p>

        <p className="selection-count">
          {selectedIngredientIds.length} / 3 selected
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
      </section>
    </main>
  );
}