const STORAGE_KEY = "dailyTaskPlannerTasks";

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const message = document.getElementById("message");

document.getElementById("currentDate").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function showMessage(text, type = "success") {
  message.innerHTML = `
    <div class="alert alert-${type} py-2">${text}</div>
  `;

  setTimeout(() => {
    message.innerHTML = "";
  }, 2000);
}

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    showMessage("Please enter a task.", "warning");
    taskInput.focus();
    return;
  }

  tasks.push({
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  saveTasks();
  taskInput.value = "";
  renderTasks();
  showMessage("Task added successfully.");
  taskInput.focus();
});

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  showMessage("Task deleted.", "info");
}

function editTask(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  const task = tasks.find(item => item.id === id);

  if (!card || !task) return;

  card.innerHTML = `
    <div class="d-flex flex-column gap-2">
      <input type="text" class="form-control edit-input" id="edit-${id}" value="${escapeHtml(task.text)}">
      <div class="task-actions">
        <button class="btn btn-sm btn-success" onclick="saveEdit(${id})">Save</button>
        <button class="btn btn-sm btn-secondary" onclick="renderTasks()">Cancel</button>
      </div>
    </div>
  `;

  document.getElementById(`edit-${id}`).focus();
}

function saveEdit(id) {
  const input = document.getElementById(`edit-${id}`);
  const newText = input.value.trim();

  if (!newText) {
    showMessage("Task cannot be empty.", "warning");
    return;
  }

  tasks = tasks.map(task =>
    task.id === id ? { ...task, text: newText } : task
  );

  saveTasks();
  renderTasks();
  showMessage("Task updated successfully.");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getFilteredTasks() {
  if (currentFilter === "pending") {
    return tasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <div class="text-center text-muted py-4">
        No tasks found.
      </div>
    `;
  } else {
    taskList.innerHTML = filteredTasks.map(task => `
      <div class="task-card ${task.completed ? "completed" : ""}" data-id="${task.id}">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
          <div class="d-flex align-items-start gap-2">
            <input
              type="checkbox"
              class="form-check-input mt-1"
              ${task.completed ? "checked" : ""}
              onchange="toggleTask(${task.id})"
            >
            <div>
              <div class="task-text ${task.completed ? "completed-text" : ""}">
                ${escapeHtml(task.text)}
              </div>
              <small class="text-muted">Added at ${task.createdAt}</small>
            </div>
          </div>

          <div class="task-actions">
            <button class="btn btn-sm btn-outline-primary" onclick="editTask(${task.id})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  updateStats();
}

function updateStats() {
  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("pendingCount").textContent =
    tasks.filter(task => !task.completed).length;
  document.getElementById("completedCount").textContent =
    tasks.filter(task => task.completed).length;
}

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", function () {
    document.querySelectorAll(".filter-btn").forEach(btn =>
      btn.classList.remove("active")
    );

    this.classList.add("active");
    currentFilter = this.dataset.filter;
    renderTasks();
  });
});

document.getElementById("clearCompleted").addEventListener("click", function () {
  const completedTasks = tasks.filter(task => task.completed).length;

  if (completedTasks === 0) {
    showMessage("No completed tasks to clear.", "warning");
    return;
  }

  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
  showMessage("Completed tasks cleared.", "success");
});

renderTasks();
