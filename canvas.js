
let canvas;

window.addEventListener('mousemove', (e) => {
    if (e.srcElement === canvas) {
        let proto = Object.getPrototypeOf(e);
        let descriptors = Object.getOwnPropertyDescriptors(proto);
        let properties = '<table>';
        for (const key of Object.keys(descriptors)) {
            if (descriptors[key].get && !key.endsWith('Element')) {
                properties += '<tr><td>' + key + '</td><td>' + e[key] + '</td></tr>';
            }
        }
        properties += '</table>';

        let show = document.getElementById('show');
        show.innerHTML = properties;
    }
});

function onLoad() {
    canvas = document.getElementById('canvas');

    canvas.height = 600;
    canvas.width = 800;

    requestAnimationFrame(tick);
}

function tick(timestamp) {

    requestAnimationFrame(tick);
}