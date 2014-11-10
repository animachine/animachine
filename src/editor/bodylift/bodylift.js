function marginate (x, y, w, h) {

    document.body.style.marginLeft = x + 'px';
    document.body.style.marginTop = y + 'px';
    document.body.style.marginRight = (window.innerWidth - (x + w)) + 'px';
    document.body.style.marginBottom = (window.innerHeight - (y + h)) + 'px';
}
marginate(83, 123, 609, 888);

function 