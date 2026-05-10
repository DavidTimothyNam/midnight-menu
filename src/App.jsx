// src/App.jsx

import { useEffect, useRef, useState } from "react";
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
import DishReveal from "./components/DishReveal";
import { generateFallbackDishText } from "./ai/fallbackText";
import { generateReaction } from "./ai/aiClient";
import { buildCustomerPrompt } from "./ai/prompts";
import "./styles/index.css";

const COOKING_DELAY_MS = 2200;
const COOKING_FADE_MS = 450;
const CUSTOMERS_PER_NIGHT = 3;

const VALID_TRAITS = [
  "courage",
  "heat",
  "intensity",
  "comfort",
  "memory",
  "sweetness",
  "clarity",
  "honesty",
  "sharpness",
  "home",
  "stability",
  "fullness",
  "calm",
  "renewal",
  "freshness",
  "grief",
  "ocean",
  "preservation",
  "focus",
  "urgency",
  "restlessness",
  "warmth",
  "care",
  "richness",
  "patience",
  "boldness",
  "lightness",
];

const CUSTOMER_TRAIT_SETS = [
  {
    id: "brave-goodbye",
    targetTraits: ["courage", "grief", "warmth"],
    relatedTraits: ["care", "comfort", "patience", "memory", "stability"],
    avoidTraits: ["restlessness", "urgency"],
  },
  {
    id: "clear-calm",
    targetTraits: ["clarity", "calm", "freshness"],
    relatedTraits: ["renewal", "lightness", "honesty", "patience", "comfort"],
    avoidTraits: ["intensity", "heat", "restlessness"],
  },
  {
    id: "home-comfort",
    targetTraits: ["home", "comfort", "care"],
    relatedTraits: ["warmth", "stability", "fullness", "sweetness", "memory"],
    avoidTraits: ["urgency", "restlessness", "sharpness"],
  },
  {
    id: "steady-focus",
    targetTraits: ["focus", "stability", "patience"],
    relatedTraits: ["clarity", "honesty", "calm", "care", "preservation"],
    avoidTraits: ["urgency", "restlessness", "heat"],
  },
  {
    id: "ocean-memory",
    targetTraits: ["ocean", "memory", "preservation"],
    relatedTraits: ["grief", "calm", "clarity", "freshness", "patience"],
    avoidTraits: ["heat", "intensity", "urgency"],
  },
  {
    id: "sweet-renewal",
    targetTraits: ["sweetness", "renewal", "lightness"],
    relatedTraits: ["comfort", "freshness", "calm", "warmth", "care"],
    avoidTraits: ["grief", "fullness", "intensity"],
  },
  {
    id: "honest-comfort",
    targetTraits: ["honesty", "comfort", "care"],
    relatedTraits: ["clarity", "warmth", "patience", "sweetness", "calm"],
    avoidTraits: ["sharpness", "intensity", "urgency"],
  },
  {
    id: "bold-warmth",
    targetTraits: ["boldness", "warmth", "richness"],
    relatedTraits: ["courage", "heat", "care", "fullness", "comfort"],
    avoidTraits: ["restlessness", "urgency"],
  },
];

function pickOne(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueValidTraits(traits) {
  return [...new Set(traits)].filter((trait) => VALID_TRAITS.includes(trait));
}

function generateCustomerTraits() {
  const traitSet = pickOne(CUSTOMER_TRAIT_SETS);

  return {
    targetTraits: uniqueValidTraits(traitSet.targetTraits).slice(0, 3),
    relatedTraits: shuffle(uniqueValidTraits(traitSet.relatedTraits)).slice(
      0,
      3,
    ),
    avoidTraits: shuffle(uniqueValidTraits(traitSet.avoidTraits)).slice(0, 2),
  };
}

function getRandomFallbackCustomer(index = 0) {
  const customer = customers[Math.floor(Math.random() * customers.length)];

  return {
    ...customer,
    id: `${customer.id ?? "fallback"}-${index}-${Date.now()}`,
  };
}

function createCustomerFromGeneratedText({ index, traits, text }) {
  return {
    id: `generated-customer-${index}`,
    name: text.characterName,
    emoji: text.characterEmoji,
    requestText: text.requestText,
    targetTraits: traits.targetTraits,
    relatedTraits: traits.relatedTraits,
    avoidTraits: traits.avoidTraits,
  };
}

function isValidGeneratedCustomerText(data) {
  return (
    data &&
    typeof data.characterEmoji === "string" &&
    typeof data.characterName === "string" &&
    typeof data.requestText === "string"
  );
}

async function requestGeneratedCustomerText(traits) {
  const prompt = buildCustomerPrompt(traits);

  const response = await fetch("/api/generate-customer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json().catch(() => null);

  if (response.status === 503 && data?.code === "LIVE_AI_DISABLED") {
    return null;
  }

  if (!response.ok) {
    console.error("/api/generate-customer failed:", data);
    throw new Error(data?.error || "Customer generation failed");
  }

  if (!isValidGeneratedCustomerText(data)) {
    console.error("Malformed generated customer response:", data);
    throw new Error("Malformed generated customer response");
  }

  return data;
}

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(true);

  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [result, setResult] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [dishText, setDishText] = useState(null);
  const [servedDishes, setServedDishes] = useState([]);
  const [isNightComplete, setIsNightComplete] = useState(false);
  const [isCooking, setIsCooking] = useState(false);
  const [isCookingEnding, setIsCookingEnding] = useState(false);

  const hasLoadedOpeningCustomer = useRef(false);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    if (hasLoadedOpeningCustomer.current) {
      return;
    }

    hasLoadedOpeningCustomer.current = true;
    void loadCustomerForIndex(0);
  }, [hasStarted]);

  async function createNextCustomer(index) {
    const traits = generateCustomerTraits();

    try {
      const text = await requestGeneratedCustomerText(traits);

      if (!text) {
        return getRandomFallbackCustomer(index);
      }

      return createCustomerFromGeneratedText({
        index,
        traits,
        text,
      });
    } catch (error) {
      console.warn("Using fallback customer:", error);
      return getRandomFallbackCustomer(index);
    }
  }

  async function loadCustomerForIndex(index) {
    setIsLoadingCustomer(true);

    const nextCustomer = await createNextCustomer(index);

    setCurrentCustomer(nextCustomer);
    setCurrentCustomerIndex(index);
    setIsLoadingCustomer(false);
  }

  const selectedIngredients = ingredients.filter((ingredient) =>
    selectedIngredientIds.includes(ingredient.id),
  );

  const selectedMethod = methods.find(
    (method) => method.id === selectedMethodId,
  );

  const canServe = selectedIngredients.length === 3 && selectedMethod;
  const isFinalCustomer = currentCustomerIndex === CUSTOMERS_PER_NIGHT - 1;

  function resetRoundState() {
    setSelectedIngredientIds([]);
    setSelectedMethodId("");
    setResult(null);
    setPendingResult(null);
    setDishText(null);
    setIsCooking(false);
    setIsCookingEnding(false);
  }

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
    if (!canServe || !currentCustomer) {
      return;
    }

    const dishResult = scoreDish(
      currentCustomer,
      selectedIngredients,
      selectedMethod,
    );

    const fallbackDishText = generateFallbackDishText({
      customer: currentCustomer,
      selectedIngredients,
      selectedMethod,
      result: dishResult,
    });

    setPendingResult(dishResult);
    setDishText(fallbackDishText);

    generateReaction({
      customer: currentCustomer,
      selectedIngredients,
      selectedMethod,
      result: dishResult,
    })
      .then((aiDishText) => {
        if (aiDishText) {
          setDishText(aiDishText);
        }
      })
      .catch((error) => {
        console.warn("Using fallback dish text:", error);
      });

    setIsCooking(true);
    setIsCookingEnding(false);

    window.setTimeout(() => {
      setIsCookingEnding(true);

      window.setTimeout(() => {
        setIsCooking(false);
        setIsCookingEnding(false);
      }, COOKING_FADE_MS);
    }, COOKING_DELAY_MS);
  }

  function handleServeRevealedDish() {
    setResult(pendingResult);
  }

  async function handleContinue() {
    const servedDish = {
      customer: currentCustomer,
      selectedIngredients,
      selectedMethod,
      result,
      dishText,
    };

    setServedDishes((currentDishes) => [...currentDishes, servedDish]);

    if (isFinalCustomer) {
      resetRoundState();
      setIsNightComplete(true);
      return;
    }

    const nextIndex = currentCustomerIndex + 1;

    resetRoundState();
    await loadCustomerForIndex(nextIndex);
  }

  async function restartNight() {
    setServedDishes([]);
    setIsNightComplete(false);
    resetRoundState();
    await loadCustomerForIndex(0);
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

  if (!hasStarted) {
    return (
      <main className="intro-shell">
        <section className="title-screen">
          <div className="title-kicker">🌙 Open for one strange night</div>

          <h1>Midnight Menu</h1>

          <p className="title-copy">
            Serve cozy, dreamlike dishes to midnight customers.
          </p>

          <p className="title-subcopy">
            Choose three ingredients and one cooking method. Balance the clues,
            avoid the wrong mood, and feed the feeling.
          </p>

          <button
            className="serve-button title-start-button"
            onClick={() => setHasStarted(true)}
          >
            Start the Night
          </button>
        </section>
      </main>
    );
  }

  if (isLoadingCustomer || !currentCustomer) {
    return (
      <main className="app-shell">
        <section className="panel">
          <p className="eyebrow">Midnight Menu</p>
          <h1>Opening the midnight door...</h1>
          <p className="muted">
            A customer is finding their way to the counter.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell game-shell">
      <header className="game-topbar">
        <div className="game-brand">
          <span className="game-brand-mark">🌙</span>
          <span>Midnight Menu</span>
        </div>
      </header>
      <section className="panel game-panel">
        {isCooking ? (
          <CookingScreen
            customer={currentCustomer}
            selectedIngredients={selectedIngredients}
            selectedMethod={selectedMethod}
            isEnding={isCookingEnding}
          />
        ) : dishText && pendingResult && !result ? (
          <DishReveal
            dishText={dishText}
            selectedIngredients={selectedIngredients}
            selectedMethod={selectedMethod}
            onServeDish={handleServeRevealedDish}
          />
        ) : !result ? (
          <>
            <CustomerCard
              customer={currentCustomer}
              roundNumber={currentCustomerIndex + 1}
              totalRounds={CUSTOMERS_PER_NIGHT}
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
                  isDisabled={
                    selectedIngredientIds.length >= 3 &&
                    !selectedIngredientIds.includes(ingredient.id)
                  }
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
            dishText={dishText}
            onContinue={handleContinue}
            isFinalCustomer={isFinalCustomer}
          />
        )}
      </section>
    </main>
  );
}
