
let canvas;

function onLoad() {
    canvas = document.getElementById('canvas');

    canvas.height = 600;
    canvas.width = 800;

    canvas.addEventListener('mousemove', onMouseMove);

    requestAnimationFrame(tick);
}

function onMouseMove(mouseMoveEvent) {
    let proto = Object.getPrototypeOf(mouseMoveEvent);
    let descriptors = Object.getOwnPropertyDescriptors(proto);
    let properties = '<table>';
    for (const key of Object.keys(descriptors)) {
        if (descriptors[key].get && !key.endsWith('Element')) {
            properties += '<tr><td>' + key + '</td><td>' + mouseMoveEvent[key] + '</td></tr>';
        }
    }
    properties += '</table>';

    let show = document.getElementById('show');
    show.innerHTML = properties;
}

function tick(timestamp) {

    requestAnimationFrame(tick);
}