const STORAGE_KEY = "mini-todo-tasks";
const THEME_KEY = "mini-todo-theme";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const errorMessage = document.getElementById("errorMessage");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const themeToggle = document.getElementById("themeToggle");

let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (task) => task && typeof task.text === "string" && typeof task.id === "string"
    );
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    showError("Tasks could not be saved in this browser.");
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function updateStats() {
  const completed = tasks.filter((task) => task.completed).length;
  totalCount.textContent = String(tasks.length);
  completedCount.textContent = String(completed);
  emptyState.hidden = tasks.length > 0;
}

function renderTasks() {
  taskList.replaceChildren();

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item";
    if (task.completed) {
      item.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = Boolean(task.completed);
    checkbox.dataset.id = task.id;
    checkbox.setAttribute("aria-label", "Mark task as completed");

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.dataset.id = task.id;
    deleteButton.textContent = "Delete";

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
  });

  updateStats();
}

function addTask(text) {
  tasks.push({
    id: Date.now().toString(),
    text,
    completed: false,
  });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "Light" : "Dark";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );
}

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
  } catch (error) {
    // Theme still works for this session if storage is blocked.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();

  if (!text) {
    showError("Please enter a task before adding it.");
    taskInput.focus();
    return;
  }

  clearError();
  addTask(text);
  taskInput.value = "";
  taskInput.focus();
});

taskInput.addEventListener("input", () => {
  if (taskInput.value.trim()) {
    clearError();
  }
});

taskList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-btn");
  if (deleteButton) {
    deleteTask(deleteButton.dataset.id);
  }
});

taskList.addEventListener("change", (event) => {
  if (event.target.classList.contains("task-check")) {
    toggleTask(event.target.dataset.id);
  }
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, nextTheme);
  } catch (error) {
    // Keep the chosen theme for this visit even if it cannot be saved.
  }
  applyTheme(nextTheme);
});

applyTheme(loadTheme());
renderTasks();
