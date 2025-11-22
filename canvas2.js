class Canvas {
    constructor(element, width = window.innerWidth, height = window.innerHeight) {
        /**
         * @type {HTMLCanvasElement} element 
         */
        this.element = element;
        this.element.width = width;
        this.element.height = height;
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.brush = this.element.getContext('2d');
        /**
         * @type {string} element 
         */
        this.id = element.id;
    }
}
let sqrt2reciprocal = 1 / Math.sqrt(2);
let cursor;
let square;
let enemies;

/**
 * @type {Array<Canvas>}
 */
let canvas;
let previousFrameTimestamp;

function onLoad() {
    // Initialize all canvases
    canvas = {
        static: new Canvas(document.getElementById('static')),
        dynamic: new Canvas(document.getElementById('dynamic')),
        cursor: new Canvas(document.getElementById('cursor')),
    }
    window.addEventListener('resize', e => {
        canvas.static.element.width = canvas.dynamic.element.width = canvas.cursor.element.width = window.innerWidth;
        canvas.static.element.height = canvas.dynamic.element.height = canvas.cursor.element.height = window.innerHeight
    })
    // Initialize cursor
    {
        let bgColor = 'rgba(47, 71, 77, 0.2)';
        let width = 90;
        let centerSquareColor = 'white';
        let centerSquareWidth = 8;
        let cornerColor = 'rgb(77, 160, 179)';
        let cornerPulseColor = 'white';
        let cornerWidth = 12;

        cursor = {
            visible: true,
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
    // Canvas behavior
    {
        canvas.cursor.element.addEventListener('mouseenter', e => {
            cursor.visible = true;
        });
        canvas.cursor.element.addEventListener('mousedown', e => {
            clear(canvas.cursor);
            // Grow cursor
            for (let cornerSquare of cursor.cornerSquares) {
                cornerSquare.color = cornerSquare.pulseColor;
            }
            cursor.outerSquare.width = cursor.width + Math.ceil(0.1 * cursor.width);
            cursor.outerSquare.width += cursor.outerSquare.width % 2;
            normalizeCursor(cursor);
            updateCursor(cursor, e);
            drawCursor(canvas.cursor.brush, cursor);
        });
        canvas.cursor.element.addEventListener('mouseup', e => {
            clear(canvas.cursor);
            // Shrink cursor
            for (let cornerSquare of cursor.cornerSquares) {
                cornerSquare.color = cornerSquare.defaultColor;
            }
            cursor.outerSquare.width = cursor.width;
            normalizeCursor(cursor);
            updateCursor(cursor, e);
            drawCursor(canvas.cursor.brush, cursor);
        });
        canvas.cursor.element.addEventListener('mousemove', e => {
            // Cursor
            {
                clear(canvas.cursor);
                updateCursor(cursor, e);
                drawCursor(canvas.cursor.brush, cursor);
            }
        });
        canvas.cursor.element.addEventListener('mouseleave', e => {
            // Cursor
            cursor.visible = false;
            clear(canvas.cursor);
        });
    }
    // Spawn a square
    enemies = [];
    {
        let width = 70;
        square = {
            color: 'red',
            width: width,
            x: -width * sqrt2reciprocal,
            y: 100,
            theta: 0,
            dx: 40, // pixels per second
            dy: 10, // pixels per second
            dTheta: 0.3,
        };
        updateSquare(square);
        enemies.push(square);

        width = 50;
        square = {
            color: 'rgb(55, 114, 173)',
            width: width,
            x: 700,
            y: -width * sqrt2reciprocal,
            theta: 0,
            dx: 5, // pixels per second
            dy: 40, // pixels per second
            dTheta: -0.5,
        };
        updateSquare(square);
        enemies.push(square);
    }
    // Start animation
    previousFrameTimestamp = Date.now();
    requestAnimationFrame(drawFrame);
}

/**
 * @param {Canvas} canvas 
 */
function clear(canvas) {
    canvas.brush.clearRect(0, 0, canvas.element.width, canvas.element.height);
}

function moveSquare(square, dSeconds) {
    square.x += square.dx * dSeconds;
    square.y += square.dy * dSeconds;
    square.theta += square.dTheta * dSeconds;
    updateSquare(square);
}

function updateSquare(square, x = square.x, y = square.y) {
    square.x = x;
    square.y = y;
    square.left = x - square.width / 2;
    square.top = y - square.width / 2;
}

function drawSquare(brush, square) {
    brush.fillStyle = square.color;
    brush.fillRect(square.left, square.top, square.width, square.width);
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

function drawCursor(brush, cursor) {
    if (cursor.visible) {
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
}

function drawFrame() {
    let frameTimestamp = Date.now();
    let dMillis = frameTimestamp - previousFrameTimestamp;
    let dSeconds = dMillis / 1000;

    // Update
    for (let enemy of enemies) {
        moveSquare(enemy, dSeconds);
    }

    // Draw
    clear(canvas.dynamic);
    for (let enemy of enemies) {
        let brush = canvas.dynamic.brush;
        brush.save();

        brush.translate(enemy.x, enemy.y);
        brush.rotate(enemy.theta);
        brush.translate(-enemy.x, -enemy.y);

        brush.fillStyle = enemy.color;
        brush.fillRect(enemy.left, enemy.top, enemy.width, enemy.width);

        brush.restore();
    }

    // Loop again
    previousFrameTimestamp = frameTimestamp;
    requestAnimationFrame(drawFrame);
}