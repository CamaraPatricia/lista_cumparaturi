const firebaseConfig = {
  apiKey: "AIzaSyDpV4EpXKaRlN6TUBKxUk4z6I9k0_RUxLg",
  authDomain: "cumparaturi-60cff.firebaseapp.com",
  databaseURL: "https://cumparaturi-60cff-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cumparaturi-60cff",
  storageBucket: "cumparaturi-60cff.firebasestorage.app",
  messagingSenderId: "521344517621",
  appId: "1:521344517621:web:76b84d9dc1aef5d8c72c89"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const listRef = db.ref('lista');

let currentCategory = 0;
const listElement = document.getElementById('shoppingList');
const inputElement = document.getElementById('itemInput');
const addBtn = document.getElementById('addBtn');
const emptyState = document.getElementById('emptyState');
const categoryBtns = document.querySelectorAll('.category-btn');

// Ascultă modificările din Firebase
listRef.on('value', (snapshot) => {
  listElement.innerHTML = '';
  const data = snapshot.val();
  let hasItems = false;

  if (data) {
    Object.entries(data).forEach(([key, item]) => {
      // Migrează automat datele vechi fără category
      if (item.category === undefined) {
        listRef.child(key).update({ category: 0 });
        item.category = 0;
      }

      // Afișează doar itemele din categoria curentă
      if (item.category === currentCategory) {
        hasItems = true;
        addItemToDOM(key, item.text || item, item.checked || false);
      }
    });
  }

  emptyState.style.display = hasItems ? 'none' : 'block';
});

// Schimbă categoria
categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = parseInt(btn.dataset.category);
    
    // Re-trigger actualizarea listei
    listRef.once('value', (snapshot) => {
      listElement.innerHTML = '';
      const data = snapshot.val();
      let hasItems = false;

      if (data) {
        Object.entries(data).forEach(([key, item]) => {
          if ((item.category !== undefined ? item.category : 0) === currentCategory) {
            hasItems = true;
            addItemToDOM(key, item.text || item, item.checked || false);
          }
        });
      }

      emptyState.style.display = hasItems ? 'none' : 'block';
    });
  });
});

// Adaugă item
function addItem() {
  const itemText = inputElement.value.trim();
  if (itemText === '') return;

  listRef.push({
    text: itemText,
    checked: false,
    category: currentCategory
  });

  inputElement.value = '';
}

addBtn.addEventListener('click', addItem);
inputElement.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addItem();
});

// Adaugă item în DOM
function addItemToDOM(key, text, checked) {
  const li = document.createElement('li');
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = checked;
  checkbox.addEventListener('change', () => {
    listRef.child(key).update({ checked: checkbox.checked });
  });

  const span = document.createElement('span');
  span.textContent = text;
  if (checked) span.classList.add('checked');

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Șterge';
  deleteBtn.className = 'delete-btn';
  deleteBtn.addEventListener('click', () => {
    listRef.child(key).remove();
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);
  listElement.appendChild(li);
}
