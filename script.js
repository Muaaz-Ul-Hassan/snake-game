// Game variables
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const instructionsBtn = document.getElementById('instructions-btn');
const gameStatus = document.getElementById('game-status');
const statusTitle = document.getElementById('status-title');
const statusMessage = document.getElementById('status-message');
const closeStatusBtn = document.getElementById('close-status');

// Game constants
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// Game state
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameSpeed = 150; // milliseconds
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let gameLoop;

// Initialize game
function init() {
    // Set high score from localStorage
    highScoreElement.textContent = highScore;
    
    // Create initial snake
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    
    // Generate first food
    generateFood();
    
    // Draw initial game state
    draw();
    
    // Set up event listeners
    setupEventListeners();
}

// Generate food at random position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
    };
    
    // Make sure food doesn't appear on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            break;
        }
    }
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#0d1930';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    drawGrid();
    
    // Draw snake
    snake.forEach((segment, index) => {
        // Snake head
        if (index === 0) {
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // Draw eyes
            ctx.fillStyle = '#000';
            let eyeSize = gridSize / 5;
            
            if (direction === 'right') {
                ctx.fillRect((segment.x * gridSize) + gridSize - eyeSize*2, (segment.y * gridSize) + eyeSize*2, eyeSize, eyeSize);
                ctx.fillRect((segment.x * gridSize) + gridSize - eyeSize*2, (segment.y * gridSize) + gridSize - eyeSize*3, eyeSize, eyeSize);
            } else if (direction === 'left') {
                ctx.fillRect((segment.x * gridSize) + eyeSize, (segment.y * gridSize) + eyeSize*2, eyeSize, eyeSize);
                ctx.fillRect((segment.x * gridSize) + eyeSize, (segment.y * gridSize) + gridSize - eyeSize*3, eyeSize, eyeSize);
            } else if (direction === 'up') {
                ctx.fillRect((segment.x * gridSize) + eyeSize*2, (segment.y * gridSize) + eyeSize, eyeSize, eyeSize);
                ctx.fillRect((segment.x * gridSize) + gridSize - eyeSize*3, (segment.y * gridSize) + eyeSize, eyeSize, eyeSize);
            } else if (direction === 'down') {
                ctx.fillRect((segment.x * gridSize) + eyeSize*2, (segment.y * gridSize) + gridSize - eyeSize*2, eyeSize, eyeSize);
                ctx.fillRect((segment.x * gridSize) + gridSize - eyeSize*3, (segment.y * gridSize) + gridSize - eyeSize*2, eyeSize, eyeSize);
            }
        } 
        // Snake body
        else {
            // Create gradient for snake body
            const gradient = ctx.createLinearGradient(
                segment.x * gridSize, 
                segment.y * gridSize, 
                segment.x * gridSize + gridSize, 
                segment.y * gridSize + gridSize
            );
            
            gradient.addColorStop(0, '#00cc6a');
            gradient.addColorStop(1, '#00994d');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // Body pattern
            ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
            ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 4, gridSize - 8, gridSize - 8);
        }
        
        // Draw border around each segment
        ctx.strokeStyle = '#007a3d';
        ctx.lineWidth = 1;
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    
    // Draw food
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Add shine effect to food
    ctx.fillStyle = '#ff6b81';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/3,
        food.y * gridSize + gridSize/3,
        gridSize/6,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Draw grid lines
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Update game state
function update() {
    // Update snake direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // Check for collision with walls
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameOver();
        return;
    }
    
    // Check for collision with self
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    // Add new head to snake
    snake.unshift(head);
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        scoreElement.textContent = score;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Increase level every 50 points
        level = Math.floor(score / 50) + 1;
        levelElement.textContent = level;
        
        // Increase speed with each level (cap at 50ms)
        gameSpeed = Math.max(50, 150 - (level - 1) * 10);
        
        // Generate new food
        generateFood();
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }
    
    // Draw updated game state
    draw();
}

// Game loop
function gameUpdate() {
    if (gameRunning && !gamePaused) {
        update();
    }
}

// Start game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        clearInterval(gameLoop);
        gameLoop = setInterval(gameUpdate, gameSpeed);
        
        // Hide status if shown
        gameStatus.style.display = 'none';
    }
}

// Pause game
function pauseGame() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        
        if (gamePaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            showStatus('Game Paused', 'Click Resume to continue playing');
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            gameStatus.style.display = 'none';
        }
    }
}

// Reset game
function resetGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    gamePaused = false;
    score = 0;
    level = 1;
    gameSpeed = 150;
    direction = 'right';
    nextDirection = 'right';
    
    scoreElement.textContent = score;
    levelElement.textContent = level;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    
    init();
    showStatus('Game Reset', 'Click Start Game to begin!');
}

// Game over
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    showStatus('Game Over!', `Your final score: ${score}<br>High Score: ${highScore}`);
    
    // Reset for next game
    score = 0;
    level = 1;
    gameSpeed = 150;
    direction = 'right';
    nextDirection = 'right';
    
    scoreElement.textContent = score;
    levelElement.textContent = level;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
    
    // Reinitialize snake
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    
    generateFood();
    draw();
}

// Show status message
function showStatus(title, message) {
    statusTitle.innerHTML = title;
    statusMessage.innerHTML = message;
    gameStatus.style.display = 'flex';
}

// Handle keyboard input
function handleKeyDown(event) {
    // Prevent default behavior for arrow keys
    if ([37, 38, 39, 40].includes(event.keyCode)) {
        event.preventDefault();
    }
    
    // Don't process input if game is not running or is paused
    if (!gameRunning || gamePaused) return;
    
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
            // Spacebar toggles pause
            pauseGame();
            break;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    
    // Button controls
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    resetBtn.addEventListener('click', resetGame);
    
    instructionsBtn.addEventListener('click', () => {
        showStatus('Game Instructions', 
            'Use <strong>Arrow Keys</strong> or <strong>WASD</strong> to control the snake<br><br>' +
            'Eat the <span style="color:#ff4757">red food</span> to grow and increase your score<br><br>' +
            'Avoid hitting the walls or yourself<br><br>' +
            'The game speeds up as you level up!'
        );
    });
    
    closeStatusBtn.addEventListener('click', () => {
        gameStatus.style.display = 'none';
    });
    
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        event.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchend', (event) => {
        if (!gameRunning || gamePaused) return;
        
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // Determine swipe direction
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal swipe
            if (dx > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (dx < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // Vertical swipe
            if (dy > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (dy < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
        
        event.preventDefault();
    }, { passive: false });
}

// Initialize the game when page loads
window.onload = init;
