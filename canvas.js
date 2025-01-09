class Canvas {
    constructor(element) {
        this.element = element;
        this.element.width = 800;
        this.element.height = 600;
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

class Screen {
    constructor() {
        this.canvas = new Canvas(document.getElementById('canvas'));

        this.mouseMenu = new MouseMenu(document.getElementById('mouse'));

        this.canvas.element.addEventListener('mousemove', (e) => this.mouseMenu.onMouseMove(e));
    }

    tick() {

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