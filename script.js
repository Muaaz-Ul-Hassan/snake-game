const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20; // size of snake segment
const canvasSize = 400;

let snake = [];
let food = {};
let score = 0;
let direction = null;
let gameInterval;

function startGame() {
    // Initialize game
    snake = [{x: 8*box, y: 8*box}]; // starting position
    score = 0;
    direction = null;
    generateFood();
    document.getElementById("score").textContent = "Score: 0";

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(draw, 150);
}

// Generate random food position
function generateFood() {
    food.x = Math.floor(Math.random() * (canvasSize/box)) * box;
    food.y = Math.floor(Math.random() * (canvasSize/box)) * box;
}

// Listen for arrow keys
document.addEventListener("keydown", function(event) {
    if(event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    else if(event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    else if(event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    else if(event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

function draw() {
    // Clear canvas
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Move snake
    let head = {...snake[0]};

    if(direction === "UP") head.y -= box;
    if(direction === "DOWN") head.y += box;
    if(direction === "LEFT") head.x -= box;
    if(direction === "RIGHT") head.x += box;

    // Check collision with walls
    if(head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize || collision(head, snake)) {
        clearInterval(gameInterval);
        alert("Game Over! Score: " + score);
        return;
    }

    snake.unshift(head);

    // Check if snake eats food
    if(head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById("score").textContent = "Score: " + score;
        generateFood();
    } else {
        snake.pop(); // remove tail if not eating
    }

    // Draw snake
    for(let i=0; i<snake.length; i++) {
        ctx.fillStyle = i === 0 ? "green" : "lime"; // head darker, body lighter
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }
}

// Collision with itself
function collision(head, array) {
    for(let i=0; i<array.length; i++) {
        if(head.x === array[i].x && head.y === array[i].y) return true;
    }
    return false;
}

