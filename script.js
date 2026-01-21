<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Snake Game</title>
<style>
  canvas { background: #f0f0f0; display: block; margin: 20px auto; }
  #score { text-align: center; font-size: 20px; margin-top: 10px; }
</style>
</head>
<body>

<canvas id="gameCanvas" width="400" height="400"></canvas>
<div id="score">Score: 0</div>
<button onclick="startGame()">Start Game</button>

<script>
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
    snake = [{x: 8*box, y: 8*box}]; // center start
    score = 0;
    direction = null;
    generateFood();
    document.getElementById("score").textContent = "Score: 0";

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(draw, 150);
}

function generateFood() {
    food.x = Math.floor(Math.random() * (canvasSize/box)) * box;
    food.y = Math.floor(Math.random() * (canvasSize/box)) * box;

    // Ensure food doesn't spawn on snake
    for(let i = 0; i < snake.length; i++) {
        if(food.x === snake[i].x && food.y === snake[i].y) {
            generateFood();
            return;
        }
    }
}

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

    if(direction) { // move only if arrow pressed
        let head = {...snake[0]};

        if(direction === "UP") head.y -= box;
        if(direction === "DOWN") head.y += box;
        if(direction === "LEFT") head.x -= box;
        if(direction === "RIGHT") head.x += box;

        // Wall or self collision
        if(head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize || collision(head, snake)) {
            clearInterval(gameInterval);
            alert("Game Over! Score: " + score);
            return;
        }

        snake.unshift(head);

        // Eating food
        if(head.x === food.x && head.y === food.y) {
            score++;
            document.getElementById("score").textContent = "Score: " + score;
            generateFood();
        } else {
            snake.pop(); // remove tail
        }
    }

    // Draw snake
    for(let i=0; i<snake.length; i++) {
        ctx.fillStyle = i === 0 ? "green" : "lime";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }
}

function collision(head, array) {
    for(let i=1; i<array.length; i++) { // start from 1 to ignore head
        if(head.x === array[i].x && head.y === array[i].y) return true;
    }
    return false;
}
</script>

</body>
</html>
