// Declare a variable to hold the database connection
let db;

// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {
  initDB(); // Initialize the IndexedDB
  document.getElementById('todo-form').addEventListener('submit', addTodo); // Set up form submission handler
});

// Function to initialize the IndexedDB
function initDB() {
  // Open (or create) the database named 'todoDB' with version 1
  const request = indexedDB.open('todoDB', 1);

  // Handle errors during the opening of the database
  request.onerror = () => {
    console.error('Database failed to open');
  };

  // Handle successful opening of the database
  request.onsuccess = () => {
    db = request.result; // Store the database connection
    displayTodos(); // Display existing todos
  };

  // Handle the event where the database needs to be upgraded (e.g., first creation)
  request.onupgradeneeded = (e) => {
    db = e.target.result; // Get the database instance

    // Create an object store named 'todos' with an auto-incrementing key
    const objectStore = db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });

    // Create indexes for efficient querying
    objectStore.createIndex('task', 'task', { unique: false });
    objectStore.createIndex('completed', 'completed', { unique: false });
  };
}

// Function to add a new todo item
function addTodo(e) {
  e.preventDefault(); // Prevent the default form submission behavior

  const input = document.getElementById('todo-input');
  const task = input.value.trim(); // Get and trim the input value

  if (!task) return; // Exit if the input is empty

  const newItem = { task, completed: false }; // Create a new todo object

  // Start a readwrite transaction on the 'todos' object store
  const transaction = db.transaction(['todos'], 'readwrite');
  const store = transaction.objectStore('todos');

  store.add(newItem); // Add the new item to the store

  // After the transaction completes, clear the input and refresh the displayed todos
  transaction.oncomplete = () => {
    input.value = '';
    displayTodos();
  };
}

// Function to display all todo items
function displayTodos() {
  const list = document.getElementById('todo-list');
  list.innerHTML = ''; // Clear the current list

  // Start a readonly transaction to fetch data
  const transaction = db.transaction(['todos'], 'readonly');
  const store = transaction.objectStore('todos');

  // Open a cursor to iterate over all items in the store
  const request = store.openCursor();

  request.onsuccess = () => {
    const cursor = request.result;

    if (cursor) {
      const li = document.createElement('li');
      li.className = cursor.value.completed ? 'completed' : '';
      li.textContent = cursor.value.task;

      const actions = document.createElement('div');
      actions.className = 'actions';

      // Create a button to toggle completion status
      const toggleBtn = document.createElement('button');
      toggleBtn.textContent = cursor.value.completed ? 'Undo' : 'Done';
      toggleBtn.addEventListener('click', () => toggleComplete(cursor.value.id, !cursor.value.completed));

      // Create a button to delete the todo item
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteTodo(cursor.value.id));

      actions.appendChild(toggleBtn);
      actions.appendChild(deleteBtn);
      li.appendChild(actions);
      list.appendChild(li);

      cursor.continue(); // Move to the next item
    }
  };
}

// Function to toggle the completion status of a todo item
function toggleComplete(id, completed) {
  // Start a readwrite transaction
  const transaction = db.transaction(['todos'], 'readwrite');
  const store = transaction.objectStore('todos');

  // Get the specific item by its id
  const request = store.get(id);

  request.onsuccess = () => {
    const data = request.result;
    data.completed = completed; // Update the completed status
    store.put(data); // Save the updated item

    // After the transaction completes, refresh the displayed todos
    transaction.oncomplete = () => displayTodos();
  };
}

// Function to delete a todo item
function deleteTodo(id) {
  // Start a readwrite transaction
  const transaction = db.transaction(['todos'], 'readwrite');
  const store = transaction.objectStore('todos');

  store.delete(id); // Delete the item by its id

  // After the transaction completes, refresh the displayed todos
  transaction.oncomplete = () => displayTodos();
}
