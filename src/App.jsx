// src/App.jsx

import { useState } from "react";
import { ingredients } from "./data/ingredients";
import { methods } from "./data/methods";
import { customers } from "./data/customers";
import { scoreDish } from "./game/scoring";
import CustomerCard from "./components/CustomerCard";
import IngredientCard from "./components/IngredientCard";
import MethodPicker from "./components/MethodPicker";
import ResultCard from "./components/ResultCard";
import FinalSummary from "./components/FinalSummary";
import CookingScreen from "./components/CookingScreen";
import "./styles/index.css";

const COOKING_DELAY_MS = 2200;

export default function App() {
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [result, setResult] = useState(null);
  const [servedDishes, setServedDishes] = useState([]);
  const [isNightComplete, setIsNightComplete] = useState(false);
  const [isCooking, setIsCooking] = useState(false);
  const [isCookingEnding, setIsCookingEnding] = useState(false);

  const currentCustomer = customers[currentCustomerIndex];

  const selectedIngredients = ingredients.filter((ingredient) =>
    selectedIngredientIds.includes(ingredient.id),
  );

  const selectedMethod = methods.find(
    (method) => method.id === selectedMethodId,
  );

  const canServe = selectedIngredients.length === 3 && selectedMethod;
  const isFinalCustomer = currentCustomerIndex === customers.length - 1;

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
    if (!canServe) {
      return;
    }

    const dishResult = scoreDish(
      currentCustomer,
      selectedIngredients,
      selectedMethod,
    );

    setIsCooking(true);
    setIsCookingEnding(false);

    window.setTimeout(() => {
      setIsCookingEnding(true);

      window.setTimeout(() => {
        setResult(dishResult);
        setIsCooking(false);
        setIsCookingEnding(false);
      }, 450);
    }, COOKING_DELAY_MS);
  }
  function handleContinue() {
    const servedDish = {
      customer: currentCustomer,
      selectedIngredients,
      selectedMethod,
      result,
    };

    setServedDishes((currentDishes) => [...currentDishes, servedDish]);

    setSelectedIngredientIds([]);
    setSelectedMethodId("");
    setResult(null);
    setIsCooking(false);
    setIsCookingEnding(false);

    if (isFinalCustomer) {
      setIsNightComplete(true);
      return;
    }

    setCurrentCustomerIndex((currentIndex) => currentIndex + 1);
  }

  function restartNight() {
    setCurrentCustomerIndex(0);
    setSelectedIngredientIds([]);
    setSelectedMethodId("");
    setResult(null);
    setServedDishes([]);
    setIsNightComplete(false);
    setIsCooking(false);
    setIsCookingEnding(false);
  }

  if (isNightComplete) {
    return (
      <main className="app-shell">
        <section className="panel">
          <FinalSummary servedDishes={servedDishes} onRestart={restartNight} />
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="panel">
        {isCooking ? (
          <CookingScreen
            customer={currentCustomer}
            selectedIngredients={selectedIngredients}
            selectedMethod={selectedMethod}
            isEnding={isCookingEnding}
          />
        ) : !result ? (
          <>
            <CustomerCard
              customer={currentCustomer}
              roundNumber={currentCustomerIndex + 1}
              totalRounds={customers.length}
            />

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
            onContinue={handleContinue}
            isFinalCustomer={isFinalCustomer}
          />
        )}
      </section>
    </main>
  );
}
