// Global State
let currentListIndex = 0;
let isRolling = false;
let isEditingNew = false; // Flag to track if we are creating a fresh list

document.addEventListener('DOMContentLoaded', () => {
    // Reset any old legacy data
    ensureDefaultData();
    renderSidebar();
    loadCurrentList();
});

function getLists() {
    const listsJSON = localStorage.getItem('decisionLists');
    return listsJSON ? JSON.parse(listsJSON) : [];
}

function saveLists(lists) {
    localStorage.setItem('decisionLists', JSON.stringify(lists));
}

function ensureDefaultData() {
    let lists = getLists();
    if (lists.length === 0) {
        lists.push({
            title: 'What to Eat? 🍕',
            options: ['Pizza', 'Burgers', 'Sushi', 'Salad', 'Tacos'],
            locked: true
        });
        saveLists(lists);
    }
}

// --- Sidebar Logic ---

function renderSidebar() {
    const lists = getLists();
    const container = document.getElementById('sidebarListContainer');
    container.innerHTML = '';

    lists.forEach((list, index) => {
        const div = document.createElement('div');
        div.className = `nav-item ${index === currentListIndex ? 'active' : ''}`;

        // Add lock icon if locked
        const icon = list.locked ? '<i class="fa-solid fa-lock" style="font-size:0.8em; opacity:0.5;"></i> ' : '';
        div.innerHTML = `${icon}${list.title}`;

        div.onclick = () => switchList(index);
        container.appendChild(div);
    });
}

function switchList(index) {
    currentListIndex = index;
    renderSidebar(); // Update active class
    loadCurrentList(); // Update main stage
    document.getElementById('decisionResult').innerHTML = '<span class="placeholder">Ready?</span>';
}

// --- Main Stage Logic ---

function loadCurrentList() {
    const lists = getLists();
    // Safety check if index out of bounds
    if (!lists[currentListIndex]) currentListIndex = 0;

    const list = lists[currentListIndex];
    document.getElementById('currentListTitle').textContent = list.title;
}

function makeDecision() {
    if (isRolling) return;

    const lists = getLists();
    const list = lists[currentListIndex];
    const options = list.options;
    const resultBox = document.getElementById('decisionResult');
    const rollBtn = document.getElementById('rollBtn');

    isRolling = true;
    rollBtn.disabled = true;
    rollBtn.textContent = "Rolling...";
    resultBox.style.opacity = 1;

    let steps = 0;
    const maxSteps = 20;
    const interval = setInterval(() => {
        const temp = options[Math.floor(Math.random() * options.length)];
        resultBox.textContent = temp;
        resultBox.style.opacity = 0.5;
        steps++;
        if (steps >= maxSteps) {
            clearInterval(interval);
            finalizeDecision(list, options, resultBox);
        }
    }, 80);
}

function finalizeDecision(list, options, resultBox) {
    const finalChoice = options[Math.floor(Math.random() * options.length)];
    resultBox.textContent = finalChoice;
    resultBox.style.opacity = 1;
    resultBox.style.transform = "scale(1.1)";
    setTimeout(() => resultBox.style.transform = "scale(1)", 200);

    addToHistory(list.title, finalChoice);
    isRolling = false;
    const rollBtn = document.getElementById('rollBtn');
    rollBtn.disabled = false;
    rollBtn.textContent = "Decide for me";
}

function addToHistory(title, result) {
    const ul = document.getElementById('historyList');
    const li = document.createElement('li');
    li.innerHTML = `<span>${title}</span> <strong>${result}</strong>`;
    ul.prepend(li);
}

function toggleHistory() {
    document.getElementById('historyList').classList.toggle('hidden');
    document.getElementById('historyArrow').classList.toggle('fa-chevron-up');
    document.getElementById('historyArrow').classList.toggle('fa-chevron-down');
}

function clearHistory() {
    const list = document.getElementById('historyList');
    if (list.children.length === 0) return;

    if (confirm("Clear your roll history?")) {
        list.innerHTML = '';
        // If the list was hidden, you might want to open it, 
        // or just leave it. For now, we leave it as is.
    }
}

// --- Editor / Modal Logic ---

function openCreateMode() {
    isEditingNew = true;
    document.getElementById('modalTitle').textContent = "Create New List";
    document.getElementById('listTitleInput').value = "";
    document.getElementById('deleteBtn').style.display = "none"; // Can't delete what doesn't exist yet

    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    addOptionInput();
    addOptionInput();

    document.getElementById('editorOverlay').classList.remove('hidden');
}

function openEditMode() {
    isEditingNew = false;
    const lists = getLists();
    const list = lists[currentListIndex];

    document.getElementById('modalTitle').textContent = "Edit List";
    document.getElementById('listTitleInput').value = list.title;

    const deleteBtn = document.getElementById('deleteBtn');
    if (list.locked) {
        deleteBtn.style.display = 'none';
    } else {
        deleteBtn.style.display = 'block';
    }

    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    list.options.forEach(opt => addOptionInput(opt));

    document.getElementById('editorOverlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('editorOverlay').classList.add('hidden');
}

function addOptionInput(val = '') {
    const container = document.getElementById('optionsContainer');
    const div = document.createElement('div');
    div.className = 'option-input-wrapper';
    div.innerHTML = `
        <input type="text" value="${val}" placeholder="Option...">
        <button class="remove-option-btn" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(div);
}

function saveList() {
    const title = document.getElementById('listTitleInput').value.trim();
    const inputs = document.querySelectorAll('#optionsContainer input');
    const options = Array.from(inputs).map(i => i.value.trim()).filter(v => v);

    if (!title || options.length < 2) {
        alert("Title and at least 2 options required.");
        return;
    }

    const lists = getLists();

    if (isEditingNew) {
        lists.push({ title, options, locked: false });
        currentListIndex = lists.length - 1; // Switch to new list
    } else {
        // Preserve lock status if editing existing
        const lockedStatus = lists[currentListIndex].locked || false;
        lists[currentListIndex] = { title, options, locked: lockedStatus };
    }

    saveLists(lists);
    renderSidebar();
    loadCurrentList();
    closeModal();
}

function deleteList() {
    if (confirm("Are you sure you want to delete this list?")) {
        const lists = getLists();
        lists.splice(currentListIndex, 1);
        saveLists(lists);

        currentListIndex = 0; // Reset to default
        renderSidebar();
        loadCurrentList();
        closeModal();
    }
}