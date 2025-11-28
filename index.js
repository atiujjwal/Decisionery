document.addEventListener('DOMContentLoaded', () => {
    loadLists();
    handleListChange();
});

// --- State Management ---
function getLists() {
    const listsJSON = localStorage.getItem('decisionLists');
    return listsJSON ? JSON.parse(listsJSON) : [];
}

function saveLists(lists) {
    localStorage.setItem('decisionLists', JSON.stringify(lists));
}

// --- Initialization & UI Loading ---
function loadLists() {
    const lists = getLists();
    const select = document.getElementById('decisionLists');
    const currentVal = select.value;

    select.innerHTML = '';

    // Initialize Default if empty
    if (lists.length === 0) {
        const defaultList = {
            title: 'What to Eat? (Example)',
            options: ['Pizza 🍕', 'Burgers 🍔', 'Sushi 🍣', 'Salad 🥗', 'Tacos 🌮'],
            locked: true // <--- THIS MAKES IT UNDELETABLE
        };
        lists.push(defaultList);
        saveLists(lists);
    }

    // Populate Dropdown
    lists.forEach((list, index) => {
        const option = document.createElement('option');
        option.value = index;
        // Add a lock icon visually if it is locked
        option.textContent = list.locked ? `🔒 ${list.title}` : list.title;
        select.appendChild(option);
    });

    // Create New Option
    const createNewOption = document.createElement('option');
    createNewOption.value = 'new';
    createNewOption.textContent = '+ Create New List';
    select.appendChild(createNewOption);

    // Restore selection or default to 0
    if (currentVal && currentVal !== 'new' && lists[currentVal]) {
        select.value = currentVal;
    } else {
        select.value = 0;
    }
}

// --- Core Logic: Rolling ---
let isRolling = false;

function makeDecision() {
    if (isRolling) return; // Prevent double clicks

    const lists = getLists();
    const selectedIndex = document.getElementById('decisionLists').value;

    // Safety check
    if (selectedIndex === 'new') {
        toggleEditMode(true);
        return;
    }

    const list = lists[selectedIndex];
    const options = list.options;
    const resultBox = document.getElementById('decisionResult');

    isRolling = true;
    const btn = document.getElementById('rollBtn');
    btn.disabled = true;
    btn.textContent = "Rolling...";

    // Animation Logic: Shuffle through options
    let steps = 0;
    const maxSteps = 20; // How many shuffles before stopping
    const speed = 100; // Speed in ms

    const interval = setInterval(() => {
        const tempIndex = Math.floor(Math.random() * options.length);
        resultBox.textContent = options[tempIndex];
        resultBox.style.opacity = 0.5; // Visual effect
        steps++;

        if (steps >= maxSteps) {
            clearInterval(interval);
            finalizeDecision(list, options, resultBox);
        }
    }, speed);
}

function finalizeDecision(list, options, resultBox) {
    const finalIndex = Math.floor(Math.random() * options.length);
    const decision = options[finalIndex];

    resultBox.textContent = decision;
    resultBox.style.opacity = 1;
    resultBox.style.transform = "scale(1.1)";
    setTimeout(() => resultBox.style.transform = "scale(1)", 200);

    addToHistory(list.title, decision);

    // Reset State
    isRolling = false;
    const btn = document.getElementById('rollBtn');
    btn.disabled = false;
    btn.textContent = "Decide for me";
}

function addToHistory(title, result) {
    const historyList = document.getElementById('historyList');
    const li = document.createElement('li');
    li.innerHTML = `<span>${title}</span> <strong>${result}</strong>`;
    historyList.prepend(li);
}

function toggleHistory() {
    document.getElementById('historyList').classList.toggle('hidden');
}

// --- Editor Logic ---

function handleListChange() {
    const val = document.getElementById('decisionLists').value;
    if (val === 'new') {
        // Prepare editor for new list
        document.getElementById('listTitle').value = '';
        document.getElementById('optionsContainer').innerHTML = '';
        addOptionInput();
        addOptionInput();
        toggleEditMode(true);
    }
}

function toggleEditMode(forceOpen = false) {
    const overlay = document.getElementById('editorOverlay');
    const lists = getLists();
    const select = document.getElementById('decisionLists');
    const selectedIndex = select.value;
    const deleteBtn = document.getElementById('deleteBtn'); // Get the button

    // If opening...
    if ((!overlay.classList.contains('hidden') === false) || forceOpen) {
        if (selectedIndex !== 'new' && lists[selectedIndex]) {
            const list = lists[selectedIndex];
            document.getElementById('listTitle').value = list.title;

            // --- NEW LOGIC: Hide Delete Button if Locked ---
            if (list.locked) {
                deleteBtn.style.display = 'none'; // Hide it
            } else {
                deleteBtn.style.display = 'block'; // Show it
            }
            // -----------------------------------------------

            const container = document.getElementById('optionsContainer');
            container.innerHTML = '';
            list.options.forEach(opt => addOptionInput(opt));
        } else {
            // New List Mode: Always show delete (or cancel) logic
            deleteBtn.style.display = 'none'; // Optional: hide delete for new lists until saved
        }
        overlay.classList.remove('hidden');
    } else {
        // Closing
        overlay.classList.add('hidden');
        if (selectedIndex === 'new') {
            select.value = 0;
        }
    }
}

function addOptionInput(value = '') {
    const container = document.getElementById('optionsContainer');
    const div = document.createElement('div');
    div.className = 'option-input-wrapper';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'Enter option...';

    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fa-solid fa-trash"></i>'; // FontAwesome Icon
    btn.className = 'remove-option-btn';
    btn.onclick = () => div.remove();

    div.appendChild(input);
    div.appendChild(btn);
    container.appendChild(div);
}

function saveList() {
    const title = document.getElementById('listTitle').value.trim();
    const inputs = document.querySelectorAll('#optionsContainer input');
    const options = Array.from(inputs).map(i => i.value.trim()).filter(v => v);

    if (!title || options.length < 2) {
        alert("Please provide a title and at least 2 options.");
        return;
    }

    const lists = getLists();
    const select = document.getElementById('decisionLists');
    let selectedIndex = select.value;

    // Check if we are editing an existing list to preserve its 'locked' status
    let isLocked = false;
    if (selectedIndex !== 'new' && lists[selectedIndex]) {
        isLocked = lists[selectedIndex].locked || false;
    }

    const newList = {
        title,
        options,
        locked: isLocked // Preserve the lock status
    };

    if (selectedIndex === 'new') {
        lists.push(newList);
        selectedIndex = lists.length - 1;
    } else {
        lists[selectedIndex] = newList;
    }

    saveLists(lists);
    loadLists();

    document.getElementById('decisionLists').value = selectedIndex;
    toggleEditMode(false);
}

function deleteList() {
    const select = document.getElementById('decisionLists');
    const index = select.value;
    const lists = getLists();

    // Safety Check: If it's the new option or the list is locked
    if (index === 'new') {
        toggleEditMode(false);
        select.value = 0;
        return;
    }

    // --- SECURITY CHECK ---
    if (lists[index].locked) {
        alert("This example list cannot be deleted.");
        return;
    }
    // ----------------------

    if (confirm("Delete this list?")) {
        lists.splice(index, 1);
        saveLists(lists);
        loadLists();
        toggleEditMode(false);
    }
}