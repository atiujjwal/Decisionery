document.addEventListener('DOMContentLoaded', () => {
    loadLists();
    selectList();
});

function getLists() {
    const listsJSON = localStorage.getItem('decisionLists');
    return listsJSON ? JSON.parse(listsJSON) : [];
}

function saveLists(lists) {
    localStorage.setItem('decisionLists', JSON.stringify(lists));
}

function loadLists() {
    const lists = getLists();
    const decisionListsSelect = document.getElementById('decisionLists');
    decisionListsSelect.innerHTML = '';

    if (lists.length === 0) {
        // Add a default list if none exist to guide the user
        const defaultList = {
            title: 'Example: What to Eat?',
            options: ['Pizza', 'Burger', 'Sushi', 'Salad']
        };
        lists.push(defaultList);
        saveLists(lists);
    }

    lists.forEach((list, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = list.title;
        decisionListsSelect.appendChild(option);
    });

    // Add an option to create a new list
    const createNewOption = document.createElement('option');
    createNewOption.value = 'new';
    createNewOption.textContent = '--- Create New List ---';
    decisionListsSelect.appendChild(createNewOption);
}

function selectList() {
    const lists = getLists();
    const selectedIndex = document.getElementById('decisionLists').value;
    const listTitleInput = document.getElementById('listTitle');
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    if (selectedIndex === 'new' || lists.length === 0) {
        listTitleInput.value = '';
        addOptionInput(); // Show one empty input
        addOptionInput(); // Show a second empty input
    } else {
        const selectedList = lists[selectedIndex];
        listTitleInput.value = selectedList.title;
        selectedList.options.forEach(optionText => {
            addOptionInput(optionText);
        });
    }
}

function addOptionInput(value = '') {
    const optionsContainer = document.getElementById('optionsContainer');
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'option-input-wrapper';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'option-input';
    input.value = value;
    input.placeholder = 'Enter an option';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.className = 'remove-option-btn';
    removeBtn.onclick = () => {
        inputWrapper.remove();
    };

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(removeBtn);
    optionsContainer.appendChild(inputWrapper);
}

function saveList() {
    const lists = getLists();
    const selectedIndex = document.getElementById('decisionLists').value;
    const title = document.getElementById('listTitle').value.trim();
    const optionInputs = document.querySelectorAll('.option-input');
    const options = Array.from(optionInputs)
        .map(input => input.value.trim())
        .filter(option => option !== '');

    if (!title || options.length < 2) {
        alert('Please provide a title and at least two options.');
        return;
    }

    const newList = { title, options };

    if (selectedIndex === 'new') {
        lists.push(newList);
    } else {
        lists[selectedIndex] = newList;
    }

    saveLists(lists);
    loadLists(); // Refresh dropdown
    document.getElementById('decisionLists').value = lists.findIndex(l => l.title === title);
    alert('List saved successfully!');
}

function deleteList() {
    const lists = getLists();
    const selectedIndex = document.getElementById('decisionLists').value;

    if (selectedIndex === 'new' || lists.length === 0) {
        alert('No list selected to delete.');
        return;
    }

    if (confirm(`Are you sure you want to delete the list "${lists[selectedIndex].title}"?`)) {
        lists.splice(selectedIndex, 1);
        saveLists(lists);
        loadLists();
        selectList();
    }
}

function makeDecision() {
    const lists = getLists();
    const selectedIndex = document.getElementById('decisionLists').value;
    const decisionResultDiv = document.getElementById('decisionResult');
    const historyList = document.getElementById('historyList');

    if (selectedIndex === 'new' || lists.length === 0) {
        decisionResultDiv.textContent = 'Please select or create a list first!';
        return;
    }

    const list = lists[selectedIndex];
    const options = list.options;
    const randomIndex = Math.floor(Math.random() * options.length);
    const decision = options[randomIndex];

    decisionResultDiv.textContent = `Decision: ${decision}`;

    const historyItem = document.createElement('li');
    historyItem.textContent = `${list.title}: ${decision}`;
    historyList.prepend(historyItem);
}

function clearHistory() {
    document.getElementById('historyList').innerHTML = '';
}