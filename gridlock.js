//Board generator
const board = document.getElementById("board");

//array that holds the numbers
let numbers = []
for (let i = 0; i < 25; i++) {
    numbers.push(i);
}

//Shuffles the stuff
for (let i= numbers.length - 1; i>0; i--)
{
    let j = Math.floor(Math.random() * (i+1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
}

//Adds them to the html for display
numbers.forEach(num => {
    const cell = document.createElement("div");
    cell.textContent = num;
    cell.style.cursor = "pointer";

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