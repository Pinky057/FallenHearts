const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
const message = document.getElementById('message');
const healthBar = document.getElementById('health');
const dialogue = document.getElementById('dialogue');

// Set canvas size to match the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game properties
let score = 0;
let health = 100;
let gameOver = false;
const gameDuration = 30; // 30 seconds
let timeLeft = gameDuration;

// Heart properties
let scale = 1; // Initial scale of the heart
let scaleDirection = 1; // Direction of scaling (1 for growing, -1 for shrinking)
const scaleSpeed = 0.01; // Speed of scaling
let hue = 0; // For color animation

// Falling hearts properties
const fallingHearts = [];
const heartColors = ['#ff4081', '#d81b60', '#ff79b0', '#ff1493']; // Different heart colors

// Famous love quotes
const loveQuotes = [
    "Love is composed of a single soul inhabiting two bodies. – Aristotle",
    "The best thing to hold onto in life is each other. – Audrey Hepburn",
    "I have found the one whom my soul loves. – Song of Solomon 3:4",
    "You are my today and all of my tomorrows. – Leo Christopher",
    "I love you not only for what you are, but for what I am when I am with you. – Roy Croft",
    "In all the world, there is no heart for me like yours. – Maya Angelou",
    "I love you more than I have ever found a way to say to you. – Ben Folds",
    "You are my heart, my life, my one and only thought. – Arthur Conan Doyle",
    "I love you and that’s the beginning and end of everything. – F. Scott Fitzgerald",
    "I have loved you in countless forms, countless times. – Rabindranath Tagore"
];

// Function to draw a retro RPG-style heart
function drawHeart(x, y, size, color, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation); // Rotate the heart
    ctx.scale(size, size);

    // Retro RPG-style heart design
    ctx.fillStyle = color;
    ctx.strokeStyle = '#d81b60';
    ctx.lineWidth = 5;

    // Draw the heart shape
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-50, -50, -100, 50, 0, 120);
    ctx.bezierCurveTo(100, 50, 50, -50, 0, 0);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

// Function to check if a point is inside the heart
function isPointInHeart(x, y, heart) {
    // Transform the point to the heart's local coordinate system
    const dx = x - heart.x;
    const dy = y - heart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if the point is within a reasonable distance from the heart's center
    return distance < 50 * heart.size;
}

// Function to animate the main heart
function animateMainHeart() {
    // Update the scale for the beating effect
    scale += scaleSpeed * scaleDirection;

    // Reverse the scaling direction if the heart gets too big or too small
    if (scale > 1.2 || scale < 0.8) {
        scaleDirection *= -1;
    }

    // Change the color over time
    hue = (hue + 1) % 360;
    const color = `hsl(${hue}, 100%, 50%)`;

    // Draw the main heart
    drawHeart(canvas.width / 2, canvas.height / 2, scale, color);
}

// Function to create falling hearts
function createFallingHearts() {
    if (Math.random() < 0.03) { // Control the frequency of falling hearts
        const x = Math.random() * canvas.width;
        const y = -50; // Start above the canvas
        const size = Math.random() * 0.5 + 0.2; // Random size
        const color = heartColors[Math.floor(Math.random() * heartColors.length)]; // Random color
        const rotationSpeed = (Math.random() - 0.5) * 0.05; // Random rotation speed
        fallingHearts.push({ x, y, size, color, rotation: 0, rotationSpeed });
    }
}

// Function to animate falling hearts
function animateFallingHearts() {
    for (let i = fallingHearts.length - 1; i >= 0; i--) {
        const heart = fallingHearts[i];
        heart.y += 2; // Move the heart down
        heart.rotation += heart.rotationSpeed; // Rotate the heart

        // Draw the falling heart
        drawHeart(heart.x, heart.y, heart.size, heart.color, heart.rotation);

        // Remove the heart if it goes off the screen
        if (heart.y > canvas.height + 100) {
            fallingHearts.splice(i, 1);
            health -= 10; // Lose health if a heart is missed
            if (health <= 0) {
                health = 0;
                endGame(false); // End the game if health reaches 0
            }
            updateHealthBar();
        }
    }
}

// Function to handle canvas clicks
canvas.addEventListener('click', (event) => {
    if (gameOver) return; // Stop clicks if the game is over

    const x = event.clientX;
    const y = event.clientY;

    // Check if a heart was clicked
    for (let i = fallingHearts.length - 1; i >= 0; i--) {
        const heart = fallingHearts[i];
        if (isPointInHeart(x, y, heart)) {
            fallingHearts.splice(i, 1); // Remove the heart
            score++; // Increase score
            updateDialogue(`Hearts collected: ${score}`);
            break; // Stop checking other hearts after one is clicked
        }
    }
});

// Function to update the health bar
function updateHealthBar() {
    healthBar.style.width = `${health}%`;
}

// Function to update the dialogue box
function updateDialogue(text) {
    dialogue.textContent = text;
}

// Function to end the game
function endGame(isWin) {
    gameOver = true;
    if (isWin) {
        updateDialogue('Time\'s up! Here\'s a sweet quote for you:');
        setTimeout(() => {
            const randomQuote = loveQuotes[Math.floor(Math.random() * loveQuotes.length)];
            updateDialogue(randomQuote);
        }, 2000); // Show the quote after 2 seconds
    } else {
        updateDialogue('Game over! Try again!');
    }
    fallingHearts.length = 0; // Clear all falling hearts
}

// Function to update the timer
function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        message.textContent = `Time left: ${timeLeft}s`;
    } else {
        endGame(true); // End the game when the timer reaches 0
    }
}

// Main animation loop
function animate() {
    if (gameOver) return; // Stop the animation if the game is over

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Animate the main heart
    animateMainHeart();

    // Create and animate falling hearts
    createFallingHearts();
    animateFallingHearts();

    // Request the next frame
    requestAnimationFrame(animate);
}

// Start the game
function startGame() {
    // Reset game properties
    score = 0;
    health = 100;
    timeLeft = gameDuration;
    gameOver = false;
    fallingHearts.length = 0;

    // Start the timer
    const timerInterval = setInterval(() => {
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timerInterval); // Stop the timer when it reaches 0
        }
    }, 1000);

    // Start the animation
    animate();
}

// Start the game
startGame();
