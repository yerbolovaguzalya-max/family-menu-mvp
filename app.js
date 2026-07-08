const days = [
  ["monday", "Пн"],
  ["tuesday", "Вт"],
  ["wednesday", "Ср"],
  ["thursday", "Чт"],
  ["friday", "Пт"],
  ["saturday", "Сб"],
  ["sunday", "Вс"],
];

const recipes = [
  {
    id: "chicken-buckwheat",
    title: "Курица с гречкой",
    category: "Ужин",
    time: 35,
    servings: 4,
    difficulty: "Легко",
    image: "soup",
    ingredients: [
      { name: "Курица", amount: 600, unit: "г" },
      { name: "Гречка", amount: 300, unit: "г" },
      { name: "Морковь", amount: 2, unit: "шт" },
      { name: "Лук", amount: 1, unit: "шт" },
    ],
  },
  {
    id: "fish-rice",
    title: "Рыба с рисом",
    category: "Обед",
    time: 30,
    servings: 3,
    difficulty: "Средне",
    image: "fish",
    ingredients: [
      { name: "Филе рыбы", amount: 500, unit: "г" },
      { name: "Рис", amount: 250, unit: "г" },
      { name: "Лимон", amount: 1, unit: "шт" },
      { name: "Огурец", amount: 2, unit: "шт" },
    ],
  },
  {
    id: "oatmeal",
    title: "Овсянка с ягодами",
    category: "Завтрак",
    time: 12,
    servings: 2,
    difficulty: "Легко",
    image: "breakfast",
    ingredients: [
      { name: "Овсянка", amount: 120, unit: "г" },
      { name: "Молоко", amount: 400, unit: "мл" },
      { name: "Ягоды", amount: 150, unit: "г" },
      { name: "Мед", amount: 2, unit: "ст. л." },
    ],
  },
  {
    id: "vegetable-soup",
    title: "Овощной суп",
    category: "Обед",
    time: 40,
    servings: 4,
    difficulty: "Легко",
    image: "soup",
    ingredients: [
      { name: "Картофель", amount: 4, unit: "шт" },
      { name: "Морковь", amount: 1, unit: "шт" },
      { name: "Капуста", amount: 300, unit: "г" },
      { name: "Лук", amount: 1, unit: "шт" },
    ],
  },
  {
    id: "pasta",
    title: "Паста с томатами",
    category: "Ужин",
    time: 25,
    servings: 3,
    difficulty: "Легко",
    image: "default",
    ingredients: [
      { name: "Паста", amount: 300, unit: "г" },
      { name: "Томаты", amount: 4, unit: "шт" },
      { name: "Сыр", amount: 120, unit: "г" },
      { name: "Базилик", amount: 1, unit: "пучок" },
    ],
  },
];

const family = [
  { name: "Алия", role: "мама", age: 34, likes: ["рыба", "овощи"], allergies: ["нет"] },
  { name: "Данияр", role: "папа", age: 36, likes: ["паста", "курица"], allergies: ["нет"] },
  { name: "Мира", role: "ребенок", age: 7, likes: ["овсянка", "ягоды"], allergies: ["орехи"] },
];

const state = {
  menu: {
    monday: ["oatmeal"],
    tuesday: ["vegetable-soup"],
    wednesday: [],
    thursday: ["fish-rice"],
    friday: [],
    saturday: ["pasta"],
    sunday: [],
  },
  purchased: new Set(),
  category: "all",
  search: "",
};

const recipeById = Object.fromEntries(recipes.map((recipe) => [recipe.id, recipe]));

const screenTitles = {
  home: "Главная",
  week: "Меню недели",
  recipes: "Каталог рецептов",
  family: "Семья",
  shopping: "Покупки",
};

function init() {
  setupNavigation();
  fillSelects();
  renderAll();
  document.getElementById("quickAddBtn").addEventListener("click", addQuickRecipe);
  document.getElementById("recipeSearch").addEventListener("input", (event) => {
    state.search = event.target.value.toLowerCase();
    renderRecipes();
  });
  document.getElementById("categoryFilter").addEventListener("change", (event) => {
    state.category = event.target.value;
    renderRecipes();
  });
  document.getElementById("clearPurchasedBtn").addEventListener("click", () => {
    state.purchased.clear();
    renderShopping();
  });
}

function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".view").forEach((section) => section.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(view).classList.add("active");
      document.getElementById("screenTitle").textContent = screenTitles[view];
    });
  });
}

function fillSelects() {
  const dayOptions = days.map(([id, label]) => `<option value="${id}">${label}</option>`).join("");
  const recipeOptions = recipes.map((recipe) => `<option value="${recipe.id}">${recipe.title}</option>`).join("");
  document.getElementById("quickDay").innerHTML = dayOptions;
  document.getElementById("quickRecipe").innerHTML = recipeOptions;

  const categories = [...new Set(recipes.map((recipe) => recipe.category))];
  document.getElementById("categoryFilter").innerHTML += categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}

function renderAll() {
  renderHome();
  renderWeek();
  renderRecipes();
  renderFamily();
  renderShopping();
}

function renderHome() {
  const todayId = "wednesday";
  const todayRecipes = state.menu[todayId].map((id) => recipeById[id]?.title).filter(Boolean);
  const plannedCount = Object.values(state.menu).flat().length;
  const shoppingCount = buildShoppingItems().filter((item) => !state.purchased.has(item.key)).length;

  document.getElementById("todayMenu").textContent = todayRecipes.join(", ") || "Пока пусто";
  document.getElementById("plannedCount").textContent = plannedCount;
  document.getElementById("shoppingCount").textContent = shoppingCount;

  const recommended = recipes.filter((recipe) => ["oatmeal", "fish-rice", "pasta"].includes(recipe.id));
  document.getElementById("recommendations").innerHTML = recommended.map(recipeCard).join("");
}

function renderWeek() {
  document.getElementById("weekGrid").innerHTML = days
    .map(([dayId, label]) => {
      const meals = state.menu[dayId]
        .map((recipeId) => recipeById[recipeId])
        .filter(Boolean)
        .map((recipe) => mealChip(dayId, recipe))
        .join("");

      return `
        <article class="day-card">
          <header>
            <h3>${label}</h3>
            <span>${state.menu[dayId].length} блюд</span>
          </header>
          <select data-add-day="${dayId}">
            <option value="">Добавить блюдо</option>
            ${recipes.map((recipe) => `<option value="${recipe.id}">${recipe.title}</option>`).join("")}
          </select>
          ${meals || '<div class="empty">Нет блюд</div>'}
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-add-day]").forEach((select) => {
    select.addEventListener("change", () => {
      if (select.value) {
        addRecipeToDay(select.dataset.addDay, select.value);
        select.value = "";
      }
    });
  });

  document.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const [dayId, recipeId] = button.dataset.remove.split(":");
      state.menu[dayId] = state.menu[dayId].filter((id) => id !== recipeId);
      renderAll();
    });
  });
}

function mealChip(dayId, recipe) {
  return `
    <div class="meal-chip">
      <div>
        <strong>${recipe.title}</strong>
        <span>${recipe.time} мин · ${recipe.servings} порции</span>
      </div>
      <button class="icon-btn" title="Удалить" data-remove="${dayId}:${recipe.id}">×</button>
    </div>
  `;
}

function renderRecipes() {
  const filtered = recipes.filter((recipe) => {
    const matchesCategory = state.category === "all" || recipe.category === state.category;
    const matchesSearch = recipe.title.toLowerCase().includes(state.search);
    return matchesCategory && matchesSearch;
  });

  document.getElementById("recipeCatalog").innerHTML =
    filtered.map(recipeCard).join("") || '<div class="empty">Рецепты не найдены</div>';

  document.querySelectorAll("[data-plan-recipe]").forEach((button) => {
    button.addEventListener("click", () => addRecipeToDay("wednesday", button.dataset.planRecipe));
  });
}

function recipeCard(recipe) {
  return `
    <article class="recipe-card">
      <div class="recipe-image ${recipe.image}"></div>
      <div class="recipe-body">
        <h3>${recipe.title}</h3>
        <div class="recipe-meta">
          <span>${recipe.category}</span>
          <span>${recipe.time} мин</span>
          <span>${recipe.difficulty}</span>
        </div>
        <p>${recipe.ingredients.map((item) => item.name).join(", ")}</p>
        <div class="recipe-actions">
          <button data-plan-recipe="${recipe.id}">В меню</button>
        </div>
      </div>
    </article>
  `;
}

function renderFamily() {
  document.getElementById("familyList").innerHTML = family
    .map((member) => `
      <article class="member-card">
        <div class="member-top">
          <span class="avatar">${member.name[0]}</span>
          <div>
            <h3>${member.name}</h3>
            <p>${member.role}, ${member.age} лет</p>
          </div>
        </div>
        <p>Любит: ${member.likes.join(", ")}</p>
        <div class="tag-list">
          ${member.allergies.map((allergy) => `<span class="tag">Аллергия: ${allergy}</span>`).join("")}
        </div>
      </article>
    `)
    .join("");
}

function renderShopping() {
  const items = buildShoppingItems();
  document.getElementById("shoppingList").innerHTML =
    items
      .map((item) => `
        <label class="shopping-item ${state.purchased.has(item.key) ? "done" : ""}">
          <input type="checkbox" data-shopping-key="${item.key}" ${state.purchased.has(item.key) ? "checked" : ""} />
          <strong>${item.name}</strong>
          <span>${formatAmount(item.quantity)} ${item.unit}</span>
        </label>
      `)
      .join("") || '<div class="empty">Добавьте блюда в меню недели, и список появится автоматически</div>';

  document.querySelectorAll("[data-shopping-key]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        state.purchased.add(checkbox.dataset.shoppingKey);
      } else {
        state.purchased.delete(checkbox.dataset.shoppingKey);
      }
      renderAll();
    });
  });
}

function buildShoppingItems() {
  const grouped = new Map();
  Object.values(state.menu)
    .flat()
    .map((recipeId) => recipeById[recipeId])
    .filter(Boolean)
    .forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const key = `${ingredient.name}:${ingredient.unit}`;
        const current = grouped.get(key) || { ...ingredient, quantity: 0, key };
        current.quantity += ingredient.amount;
        grouped.set(key, current);
      });
    });

  return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

function addQuickRecipe() {
  addRecipeToDay(document.getElementById("quickDay").value, document.getElementById("quickRecipe").value);
}

function addRecipeToDay(dayId, recipeId) {
  state.menu[dayId].push(recipeId);
  renderAll();
}

function formatAmount(value) {
  return Number.isInteger(value) ? value : value.toFixed(1);
}

init();
