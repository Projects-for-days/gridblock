//Timer
//edited to 15 seconds per turn, by ajii, I think 30 seconds is too long for a turn, and 15 seconds is more reasonable, but I can change it back to 30 seconds if I want to in the future
/*let turnTime = 15;` */ // seconds per turn 
// edited out by ajii didnt have any use  
let interval;
const timerButton = document.getElementById("timer-button");


// Update the display function
function updateTimerDisplay(time) {
    timerButton.textContent = `Time: ${time}s`;
}

// Start the turn timer
export function startTurn(seconds) {
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
    startTurn(15); // start 15-second timer when button is clicked, edited by ajii
});