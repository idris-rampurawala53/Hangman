// =============================================
// WORD LIST - random mix of categories
// =============================================
const wordsCategories = {
    fruits:["apple", "mango", "grapes", "banana", "cherry"],
    animals:["elephant", "giraffe", "dolphin", "penguin", "tiger"],
    tech:["python", "keyboard", "monitor", "internet", "browser"],
    nature:[ "mountain", "ocean", "desert", "volcano", "rainbow"],
    music:["guitar", "trumpet", "violin", "drums", "piano"],
    sports:["football", "cricket", "tennis", "basketball", "hockey" ]
}   
const words = Object.values(wordsCategories).flat();
// =============================================
// GAME VARIABLES
// =============================================
let chosenWord = "";
let guessedLetters = [];
let wrongGuesses = 0;
const maxWrong = 6;
let difficulty = "normal";
let currentCategory = "all";

// =============================================
// START GAME
// =============================================
async function startGame() {
    if (difficulty === "extreme") {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const response = await fetch("https://random-word-api.herokuapp.com/word", { signal: controller.signal });
            clearTimeout(timeout);
            const data = await response.json();
            chosenWord = data[0];
        } catch (error) {
            alert("⚠️ Extreme mode failed to load! Switching to Normal words.");
            difficulty = "normal";
            document.getElementById("btn-normal").classList.add("active");
            document.getElementById("btn-extreme").classList.remove("active");
            chosenWord = wrods[Math.floor(Math.random() * words.length)];
        }
    } else {
        const list = currentCategory === "all" ? words : wordsCategories[currentCategory]
        chosenWord = list[Math.floor(Math.random() * list.length)];
    }
    guessedLetters = [];
    wrongGuesses = 0;

    document.getElementById("wrong-count").textContent = 0;
    document.getElementById("message").textContent = "";
    document.getElementById("message").className = "message";
    document.getElementById("play-again-btn").style.display = "none";

    drawHangman(0);
    buildWordDisplay();
    buildAlphabet();
}

function setCategory(cat,clickedBtn) {
    currentCategory = cat;

    // Update active button
    document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
    clickedBtn.classList.add("active");

    startGame();
}
// =============================================
// BUILD WORD DISPLAY (blanks)
// =============================================
function buildWordDisplay() {
    const container = document.getElementById("word-display");
    container.innerHTML = "";

    // Loop through each letter in the chosen word
    for (let i = 0; i < chosenWord.length; i++) {
        const box = document.createElement("div");
        box.classList.add("letter-box");
        box.id = "box-" + i;

        // If letter already guessed, show it
        if (guessedLetters.includes(chosenWord[i])) {
            box.textContent = chosenWord[i];
        } else {
            box.textContent = "";
        }

        container.appendChild(box);
    }
}

// =============================================
// BUILD ALPHABET BUTTONS
// =============================================
function buildAlphabet() {
    const container = document.getElementById("alphabet");
    container.innerHTML = "";

    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i).toLowerCase();
        const btn = document.createElement("button");
        btn.textContent = letter.toUpperCase();
        btn.id = "btn-" + letter;
        btn.onclick = () => handleGuess(letter, btn);
        container.appendChild(btn);
    }
}

// =============================================
// HANDLE A GUESS
// =============================================
function handleGuess(letter, btn) {
    // Add to guessed letters
    guessedLetters.push(letter);
    btn.disabled = true;

    // Check if letter is in the word
    if (chosenWord.includes(letter)) {
        // Correct guess - update the word display
        btn.classList.add("correct");

        for (let i = 0; i < chosenWord.length; i++) {
            if (chosenWord[i] === letter) {
                document.getElementById("box-" + i).textContent = letter;
            }
        }

        // Check if player won
        checkWin();

    } else {
        // Wrong guess
        btn.classList.add("wrong");
        wrongGuesses++;
        document.getElementById("wrong-count").textContent = wrongGuesses;
        drawHangman(wrongGuesses);

        // Check if player lost
        if (wrongGuesses >= maxWrong) {
            document.getElementById("message").textContent = "❌ You lost! The word was: " + chosenWord;
            document.getElementById("message").className = "message lose";
            document.getElementById("play-again-btn").style.display = "inline-block";
            disableAllButtons();
        }
    }
}

// =============================================
// CHECK WIN
// =============================================
function checkWin() {
    // Check if every letter in the word has been guessed
    let allGuessed = true;

    for (let i = 0; i < chosenWord.length; i++) {
        if (!guessedLetters.includes(chosenWord[i])) {
            allGuessed = false;
            break;
        }
    }

    if (allGuessed) {
        document.getElementById("message").textContent = "🎉 You won! Great job!";
        document.getElementById("message").className = "message win";
        document.getElementById("play-again-btn").style.display = "inline-block";
        disableAllButtons();
    }
}

// =============================================
// DISABLE ALL BUTTONS (end of game)
// =============================================
function disableAllButtons() {
    const buttons = document.querySelectorAll(".alphabet button");
    buttons.forEach(btn => btn.disabled = true);
}

// =============================================
// DRAW HANGMAN ON CANVAS
// =============================================
function drawHangman(step) {
    const canvas = document.getElementById("hangman-canvas");
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // Step 0 - Always draw the gallows
    // Base
    ctx.beginPath();
    ctx.moveTo(20, 210);
    ctx.lineTo(180, 210);
    ctx.stroke();

    // Pole
    ctx.beginPath();
    ctx.moveTo(60, 210);
    ctx.lineTo(60, 20);
    ctx.stroke();

    // Top bar
    ctx.beginPath();
    ctx.moveTo(60, 20);
    ctx.lineTo(130, 20);
    ctx.stroke();

    // Rope
    ctx.beginPath();
    ctx.moveTo(130, 20);
    ctx.lineTo(130, 50);
    ctx.stroke();

    // Step 1 - Head
    if (step >= 1) {
        ctx.beginPath();
        ctx.arc(130, 70, 20, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Step 2 - Body
    if (step >= 2) {
        ctx.beginPath();
        ctx.moveTo(130, 90);
        ctx.lineTo(130, 150);
        ctx.stroke();
    }

    // Step 3 - Left arm
    if (step >= 3) {
        ctx.beginPath();
        ctx.moveTo(130, 110);
        ctx.lineTo(100, 135);
        ctx.stroke();
    }

    // Step 4 - Right arm
    if (step >= 4) {
        ctx.beginPath();
        ctx.moveTo(130, 110);
        ctx.lineTo(160, 135);
        ctx.stroke();
    }

    // Step 5 - Left leg
    if (step >= 5) {
        ctx.beginPath();
        ctx.moveTo(130, 150);
        ctx.lineTo(100, 185);
        ctx.stroke();
    }

    // Step 6 - Right leg
    if (step >= 6) {
        ctx.beginPath();
        ctx.moveTo(130, 150);
        ctx.lineTo(160, 185);
        ctx.stroke();
    }
}
function setDifficulty(level) {
    difficulty = level;
    document.getElementById("btn-normal").classList.toggle("active", level === "normal");
    document.getElementById("btn-extreme").classList.toggle("active", level === "extreme");

    // Show category only in normal mode
    const catArea = document.getElementById("category-area");
    if (level === "extreme") {
        catArea.classList.add("hidden");
    } else {
        catArea.classList.remove("hidden");
    }

    startGame();
}
// =============================================
// START THE GAME ON PAGE LOAD
// =============================================
startGame();