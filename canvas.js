class Canvas {
    constructor(element) {
        /**
         * @type {HTMLCanvasElement} element 
         */
        this.element = element;
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
class ShapeType {
    static RECTANGLE = 1;
}
let square = {
    type: ShapeType.RECTANGLE,
    color: 'red',
    left: 0,
    top: 0,
    width: 0,
    height: 0
};
let cursor = {
    visible: true,
    dragging: false,
    x: 0,
    y: 0
};

/**
 * @type {Array<Canvas>}
 */
let canvases = [];
let staticShapes = [];

function onLoad() {
    // Initialize all canvases
    for (let cvs of document.getElementsByTagName('canvas')) {
        canvases[cvs.id] = new Canvas(cvs);
        cvs.width = 800;
        cvs.height = 600;
    }
    // Canvas behavior
    {
        let canvas = canvases['cursor'];
        canvas.element.addEventListener('mouseenter', e => {
            cursor.visible = true;
        });
        canvas.element.addEventListener('mousedown', e => {
            // Cursor
            cursor.dragging = true;

            // Square
            square.left = e.offsetX;
            square.top = e.offsetY;
        });
        canvas.element.addEventListener('mousemove', e => {
            // Cursor
            {
                let canvas = canvases['cursor'];
                clear(canvas);
                // Update cursor position
                {
                    cursor.x = e.offsetX;
                    cursor.y = e.offsetY;
                }
                // Draw cursor
                if (cursor.visible) {
                    let brush = canvas.brush;
                    brush.translate(cursor.x, cursor.y);

                    // Draw the outline
                    brush.beginPath();
                    brush.moveTo(0, 0);
                    brush.lineTo(0, 20);
                    brush.lineTo(6, 15);
                    brush.lineTo(14, 15);
                    brush.closePath();

                    // Green with black outline
                    brush.fillStyle = 'green';
                    brush.strokeStyle = 'black';
                    brush.lineWidth = .625;

                    // Color it in
                    brush.fill();
                    brush.stroke();

                    brush.translate(-cursor.x, -cursor.y);
                }
            }
            {
                /**
                 * @type {Canvas}
                 */
                let canvas = canvases['dynamic'];
                clear(canvas);
                if (cursor.dragging) {
                    // Update the square dimensions
                    {
                        let side = Math.max(Math.abs(e.offsetX - square.left), Math.abs(e.offsetY - square.top));
                        square.width = e.offsetX < square.left ? -side : side;
                        square.height = e.offsetY < square.top ? -side : side;
                    }
                    // Draw the square
                    {
                        let brush = canvas.brush;
                        brush.fillStyle = square.color;
                        brush.fillRect(square.left, square.top, square.width, square.height);
                    }
                } else {
                    // Determine if the mouse is over any of the static shapes
                    for (let shape of staticShapes) {
                        let mouseIsOverShape = shape.left < e.offsetX && e.offsetX < shape.right && shape.top < e.offsetY && e.offsetY < shape.bottom;
                        if (mouseIsOverShape) {
                            let brush = canvas.brush;
                            // Draw an outline over the shape
                            {
                                brush.strokeStyle = 'black';
                                brush.strokeRect(shape.left, shape.top, shape.width, shape.height);
                            }

                            // Draw draggable corners
                            {

                            }
                        }
                    }
                }
            }
        });
        canvas.element.addEventListener('mouseup', e => {
            // Cursor
            cursor.dragging = false;

            // Shapes
            {
                // Normalize the square
                {
                    if (square.width > 0) {
                        square.right = square.left + square.width;
                    } else {
                        square.right = square.left;
                        square.left = square.left + square.width;
                        square.width = -square.width;
                    }
                    if (square.height > 0) {
                        square.bottom = square.top + square.height;
                    } else {
                        square.bottom = square.top;
                        square.top = square.top + square.height;
                        square.height = -square.height;
                    }
                }

                // Update shapes
                staticShapes.push(square);

                // Draw Shapes
                {
                    let canvas = canvases['static'];
                    let brush = canvas.brush;
                    for (let shape of staticShapes) {
                        brush.fillStyle = shape.color;
                        brush.fillRect(shape.left, shape.top, shape.width, shape.height);
                    }
                }
            }

            // Square
            square = {
                type: ShapeType.RECTANGLE,
                color: 'red',
            };
        });
        canvas.element.addEventListener('mouseleave', e => {
            // Cursor
            cursor.visible = false;
            clear(canvas);
        });
    }
}

/**
 * @param {Canvas} canvas 
 */
function clear(canvas) {
    canvas.brush.clearRect(0, 0, canvas.element.width, canvas.element.height);
}