
let canvas;

let screen = {
    mouse: {
        menuVisible: false,
        x: null,
        y: null,
        isDown: false
    },
    rectangle: {
        menuVisible: false
    }
}

function onLoad() {
    canvas = document.getElementById('canvas');

    canvas.height = 600;
    canvas.width = 800;

    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    requestAnimationFrame(tick);
}

function onClickMouse() {
    screen.mouse.menuVisible = !screen.mouse.menuVisible;
}

function onMouseMove(mouseEvent) {
    screen.mouse.x = mouseEvent.offsetX;
    screen.mouse.y = mouseEvent.offsetY;
}

function onMouseDown(mouseEvent) {
    screen.mouse.isDown = true;
}

function onMouseUp(mouseEvent) {
    screen.mouse.isDown = false;
}

function showMouseMenu() {
    let menu = '<table>';

    menu += row('x', screen.mouse.x);
    menu += row('y', screen.mouse.y);
    menu += row('isDown', screen.mouse.isDown);

    menu += '</table>';
    document.getElementById('mouse').innerHTML = menu;
}

function hideMouseMenu() {
    document.getElementById('mouse').innerHTML = '';
}

function row(key, value) {
    return '<tr><td>' + key + '</td><td>' + value + '</td></tr>';
}

function tick(timestamp) {
    if (screen.mouse.menuVisible) {
        showMouseMenu();
    } else {
        hideMouseMenu();
    }
    requestAnimationFrame(tick);
}