//Board generator
const board = document.getElementById("board");

//array that holds the numbers
//edited by ajii, rule book says 1 -25 but that is 25 numbers and we need 26 for the grid, so I made it 1-25 instead
let numbers = []
for (let i = 1; i < 26; i++) {
    numbers.push(i);
}

//Shuffles the stuff
/*
for (let i= numbers.length - 1; i>0; i--)
{
    let j = Math.floor(Math.random() * (i+1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
}
    */
numbers.sort(() => Math.random() - 0.5); // Shuffle the numbers randomly, edited by ajii
//easier to read than the above code, but it is less efficient and less random, users will choose there numbers anyways in the main version,
// so it doesn't matter that much, and this is much more concise and easier to understand,
// so I will keep it here for now, but I may change it back to the above code if I want better shuffling in the future


//Adds them to the html for display
numbers.forEach(num => {
    const cell = document.createElement("div");
    cell.textContent = num;

    //edited out the cursor pointer, already in css file, by ajii

    cell.addEventListener("click", () =>{
        if (cell.classList.contains("clicked")) return;

        cell.classList.add("clicked");

        cell.textContent = "X";
        cell.style.color = "red";


    });



    board.appendChild(cell);
});

//Timer
let turnTime = 30; // seconds per turn
let interval;
const timerButton = document.getElementById("timer-button");


// Update the display function
function updateTimerDisplay(time) {
    timerButton.textContent = `Time: ${time}s`;
}

// Start the turn timer
function startTurn(seconds) {
    clearInterval(interval);        // stop previous timer if running
    let timeLeft = seconds;
    updateTimerDisplay(timeLeft);

    interval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(interval);
            timerButton.textContent = "Turn Over!";
            // Trigger whatever happens at the end of a turn
            alert("Turn over!");  
        }
    }, 1000);
}
timerButton.addEventListener("click", () => {
    startTurn(30); // start 30-second timer when button is clicked
});