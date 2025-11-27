const rollHistory = [];

const rollDice = () => {
    const numOfDice = document.getElementById("numOfDice").value;
    const diceResult = document.getElementById("diceResult");
    const diceImages = document.getElementById("diceImages");
    const historyList = document.getElementById("historyList");
    const diceRollSound = document.getElementById("diceRollSound");

    const values = [];
    const images = [];
    let total = 0;

    for (let index = 0; index < numOfDice; index++) {
        const value = Math.floor(Math.random() * 6) + 1;
        values.push(value);
        images.push(`<img src="dice_images/${value}.jpg" alt="${value}">`);
        total += value;
    }

    const resultText = `dice: ${values.join(', ')} | total: ${total}`;
    diceResult.textContent = resultText;
    diceImages.innerHTML = images.join(' ');
    diceRollSound.play();

    rollHistory.push(resultText);
    updateHistory();
}

const updateHistory = () => {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";
    for(const roll of rollHistory){
        const listItem = document.createElement("li");
        listItem.textContent = roll;
        historyList.appendChild(listItem);
    }
}

const clearHistory = () => {
    rollHistory.length = 0;
    updateHistory();
}