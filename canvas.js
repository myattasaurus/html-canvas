class Canvas {
    constructor(element) {
        this.element = element;
        this.element.width = 800;
        this.element.height = 600;
    }

    clear() {
        this.context.clearRect(0, 0, this.element.width, this.element.height);
    }

    get context() {
        return this.element.getContext('2d');
    }
}

class Menu {
    constructor(element) {
        this.element = element;
        this.visible = false;
    }

    hide() {
        this.element.innerHTML = '';
    }

    toggle() {
        this.visible = !this.visible;
        if (this.visible) {
            this.show();
        } else {
            this.hide();
        }
    }
}

class MouseMenu extends Menu {

    constructor(element, canvas) {
        super(element);
        canvas.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    show() {
        let menu = '<table>';

        menu += '<tr><td>x</td><td id="x"></td></tr>';
        menu += '<tr><td>y</td><td id="y"></td></tr>';

        menu += '</table>';

        this.element.innerHTML = menu;
    }

    onMouseMove(mouseEvent) {
        if (this.visible) {
            document.getElementById('x').innerHTML = mouseEvent.offsetX;
            document.getElementById('y').innerHTML = mouseEvent.offsetY;
        }
    }
}

class Rectangle {

    constructor(canvas) {
        canvas.element.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.element.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    onMouseDown(mouseEvent) {
        this.mouseDown = true;
        this.initialX = mouseEvent.offsetX;
        this.initialY = mouseEvent.offsetY;
        this.onMouseMove(mouseEvent);
    }

    onMouseMove(mouseEvent) {
        if (this.mouseDown) {
            this.finalX = mouseEvent.offsetX;
            this.finalY = mouseEvent.offsetY;
        }
    }

    onMouseUp(mouseEvent) {
        this.onMouseMove(mouseEvent);
        this.mouseDown = false;
    }

    draw(context) {
        context.fillRect(this.left, this.top, this.width, this.height);
    }

    get left() {
        return Math.min(this.initialX, this.finalX);
    }

    get top() {
        return Math.min(this.initialY, this.finalY);
    }

    get width() {
        return Math.abs(this.initialX - this.finalX);
    }

    get height() {
        return Math.abs(this.initialY - this.finalY);
    }
}

class Screen {
    constructor() {
        this.canvas = new Canvas(document.getElementById('canvas'));

        this.mouseMenu = new MouseMenu(document.getElementById('mouse'), this.canvas);

        this.rectangle = new Rectangle(this.canvas);
    }

    tick() {
        this.canvas.clear();

        this.rectangle.draw(this.canvas.context);
    }
}

let screen;

function onLoad() {
    screen = new Screen();

    requestAnimationFrame(tick);
}

function tick(timestamp) {
    screen.tick();
    requestAnimationFrame(tick);
}