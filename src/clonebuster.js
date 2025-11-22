let twoPi = 2 * Math.PI;
let sqrt2 = Math.sqrt(2);
let sqrt2reciprocal = 1 / sqrt2;

let gameArea = {};
let gameState = {};

function startHere() {
    initializeGameArea(gameArea);
    initializeCursor(document.getElementById('cursor'));
    initializeGameState(gameState);

    // Start animation
    requestAnimationFrame(drawFrame);
}

function startHitboxHere() {
    initializeGameArea(gameArea);
    initializeCursor(document.getElementById('cursor'));
}

function initializeGameArea(gameArea) {
    let canvases = document.getElementsByTagName('canvas');
    resize(canvases, gameArea);
    window.addEventListener('resize', e => {
        resize(canvases, gameArea);
    });
}

function resize(canvases, gameArea) {
    for (let i = 0; i < canvases.length; i++) {
        let canvas = canvases.item(i);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    gameArea.x = window.innerWidth / 2;
    gameArea.y = window.innerHeight / 2;
    gameArea.width = window.innerWidth;
    gameArea.height = window.innerHeight;
}

function initializeGameState(gameState) {
    gameState.enemies = [];
    gameState.previousFrameTimestamp = Date.now();
    gameState.spawnTimestamp = Date.now() - 5000;

    document.addEventListener('visibilitychange', e => {
        if (!document.hidden) {
            Object.assign(gameState, JSON.parse(localStorage.gameState));
            gameState.previousFrameTimestamp = Date.now();
            requestAnimationFrame(drawFrame);
        } else {
            localStorage.gameState = JSON.stringify(gameState);
        }
    });
}

function clear(canvas, brush) {
    brush.clearRect(0, 0, canvas.width, canvas.height);
}

function moveSquare(square, dSeconds) {
    // Translate
    square.x += square.dx * dSeconds;
    square.y += square.dy * dSeconds;

    // Rotate
    square.theta += (square.dTheta * dSeconds) % twoPi;

    // Despawn
    let centerToCornerDistance = square.width * sqrt2reciprocal + 5;
    square.despawn = square.x > gameArea.width + centerToCornerDistance // outside right of game area
        || square.x < -centerToCornerDistance // outside left of game area
        || square.y > gameArea.height + centerToCornerDistance // outside bottom of game area
        || square.y < -centerToCornerDistance // outside top of game area

    updateSquare(square);
}

function updateSquare(square, x = square.x, y = square.y) {
    square.x = x;
    square.y = y;
    square.left = square.x - square.width / 2;
    square.top = square.y - square.width / 2;
}

function drawSquare(brush, square) {
    brush.fillStyle = square.color;
    brush.fillRect(square.left, square.top, square.width, square.width);
}
/**
 * @param {HTMLCanvasElement} canvas
 */
function initializeCursor(canvas) {
    let cursor;
    // Canvas
    {
        /**
         * @type {CanvasRenderingContext2D}
         */
        let brush = canvas.getContext('2d');
        canvas.style = 'cursor:none';

        // Behavior
        canvas.addEventListener('mousedown', e => {
            clear(canvas, brush);
            for (let cornerSquare of cursor.cornerSquares) {
                cornerSquare.color = cornerSquare.pulseColor;
            }
            cursor.outerSquare.width = cursor.width + Math.ceil(0.1 * cursor.width);
            cursor.outerSquare.width += cursor.outerSquare.width % 2;
            normalizeCursor(cursor);
            updateCursor(cursor, e);
            drawCursor(cursor, brush);
        });
        canvas.addEventListener('mouseup', e => {
            clear(canvas, brush);
            for (let cornerSquare of cursor.cornerSquares) {
                cornerSquare.color = cornerSquare.defaultColor;
            }
            cursor.outerSquare.width = cursor.width;
            normalizeCursor(cursor);
            updateCursor(cursor, e);
            drawCursor(cursor, brush);
        });
        canvas.addEventListener('mousemove', e => {
            clear(canvas, brush);
            updateCursor(cursor, e);
            drawCursor(cursor, brush);
        });
        canvas.addEventListener('mouseleave', e => {
            clear(canvas, brush);
        });
    }
    // Struct
    {
        let bgColor = 'rgba(47, 71, 77, 0.2)';
        let width = 100;
        let centerSquareColor = 'white';
        let centerSquareWidth = 8;
        let cornerColor = 'rgb(77, 160, 179)';
        let cornerPulseColor = 'white';
        let cornerWidth = 12;

        cursor = {
            x: 0,
            y: 0,
            width: width,
            outerSquare: {
                color: bgColor,
                width: width
            },
            innerSquare: {
                color: bgColor
            },
            centerSquare: {
                color: centerSquareColor,
                width: centerSquareWidth
            },
            cornerSquares: [],
        };
        for (let i = 0; i < 4; i++) {
            cursor.cornerSquares.push({
                defaultColor: cornerColor,
                pulseColor: cornerPulseColor,
                color: cornerColor,
                width: cornerWidth
            });
        }
        normalizeCursor(cursor);
    }
}

let xOperation = [-1, -1, 1, 1];
let yOperation = [-1, 1, -1, 1];
function normalizeCursor(cursor) {
    cursor.innerSquare.width = cursor.outerSquare.width - cursor.centerSquare.width;

    for (let i = 0; i < 4; i++) {
        let cornerSquare = cursor.cornerSquares[i];
        cornerSquare.offsetX = xOperation[i] * cursor.outerSquare.width / 2 - xOperation[i] * cornerSquare.width / 2;
        cornerSquare.offsetY = yOperation[i] * cursor.outerSquare.width / 2 - yOperation[i] * cornerSquare.width / 2;
    }
}

function updateCursor(cursor, e) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    // Outer square
    updateSquare(cursor.outerSquare, cursor.x, cursor.y);

    // Corner squares
    for (let cornerSquare of cursor.cornerSquares) {
        updateSquare(cornerSquare, cursor.x + cornerSquare.offsetX, cursor.y + cornerSquare.offsetY);
    }

    // Inner square
    updateSquare(cursor.innerSquare, cursor.x, cursor.y);

    // Middle square
    updateSquare(cursor.centerSquare, cursor.x, cursor.y);
}

function drawCursor(cursor, brush) {
    // Outer square
    drawSquare(brush, cursor.outerSquare);

    // Corner squares
    for (let cornerSquare of cursor.cornerSquares) {
        drawSquare(brush, cornerSquare);
    }

    // Inner square
    brush.clearRect(cursor.innerSquare.left, cursor.innerSquare.top, cursor.innerSquare.width, cursor.innerSquare.width);
    drawSquare(brush, cursor.innerSquare);

    // Middle square
    drawSquare(brush, cursor.centerSquare);
}

function randomInt(minInclusive, maxExclusive) {
    return Math.floor(Math.random() * (maxExclusive - minInclusive + 2)) + minInclusive;
}

/**
 * Provides a random number in the range. The number will be even.
 * @param {number} minInclusive 
 * @param {number} maxExclusive 
 * @returns 
 */
function randomWidth(minInclusive, maxExclusive) {
    let randomNum = randomInt(minInclusive, maxExclusive)
    randomNum -= randomNum % 2;
    return randomNum;
}

function drawFrame() {
    let frameTimestamp = Date.now();
    let dMillis = frameTimestamp - gameState.previousFrameTimestamp;
    let dSeconds = dMillis / 1000;

    // Spawn a square at some frequency
    if (gameState.spawnTimestamp + 100 < frameTimestamp) {
        gameState.spawnTimestamp = frameTimestamp;
        let speed = randomInt(40, 81);
        let width = randomWidth(30, 101);
        let spawnRect = {
            width: gameArea.width + width * sqrt2,
            height: gameArea.height + width * sqrt2
        };
        let spawnLength = Math.random() * (2 * spawnRect.width + 2 * spawnRect.height);
        let spawnPoint;
        if (spawnLength <= spawnRect.width) {
            // Spawn along the top
            spawnPoint = {
                x: spawnLength,
                y: -width * sqrt2reciprocal
            };
        } else if (spawnLength <= spawnRect.width + spawnRect.height) {
            // Spawn on the right
            spawnPoint = {
                x: gameArea.width + width * sqrt2reciprocal,
                y: spawnLength - spawnRect.width
            };
        } else if (spawnLength <= 2 * spawnRect.width + spawnRect.height) {
            // Spawn on the bottom
            spawnPoint = {
                x: spawnLength - spawnRect.width - spawnRect.height,
                y: gameArea.height + width * sqrt2reciprocal
            };
        } else {
            // Spawn on the left
            spawnPoint = {
                x: -width * sqrt2reciprocal,
                y: spawnLength - 2 * spawnRect.width - spawnRect.height
            };
        }
        // Calculate direction
        let vector = {
            x: gameArea.x - spawnPoint.x,
            y: gameArea.y - spawnPoint.y
        };
        let magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

        // Scale the speed
        let dx = vector.x * speed / magnitude;
        let dy = vector.y * speed / magnitude;

        // Square to spawn
        let square = {
            color: `rgb(${randomInt(0, 256)},${randomInt(0, 256)},${randomInt(0, 256)})`,
            width: width,
            x: spawnPoint.x,
            y: spawnPoint.y,
            theta: 0,
            dx: dx, // pixels per second
            dy: dy, // pixels per second
            dTheta: 0.5,
            despawn: false,
        };
        updateSquare(square);
        gameState.enemies.push(square);
    }

    // Update
    for (let enemy of gameState.enemies) {
        moveSquare(enemy, dSeconds);
    }
    gameState.enemies = gameState.enemies.filter(enemy => !enemy.despawn);

    // Draw
    let canvas = document.getElementById('dynamic');
    let brush = canvas.getContext('2d');
    clear(canvas, brush);
    for (let enemy of gameState.enemies) {
        brush.save();

        brush.translate(enemy.x, enemy.y);
        brush.rotate(enemy.theta);
        brush.translate(-enemy.x, -enemy.y);

        brush.fillStyle = enemy.color;
        brush.fillRect(enemy.left, enemy.top, enemy.width, enemy.width);

        brush.restore();
    }

    // Loop again
    gameState.previousFrameTimestamp = frameTimestamp;
    if (!document.hidden) {
        requestAnimationFrame(drawFrame);
    }
}