/**
 * Brainight, 2023
 */
const coin = document.querySelector('#coin');
const coinBlock = document.querySelector('#coin-block');
const coinHeads = document.querySelector('#heads');
const coinTails = document.querySelector('#tails');
const cursor = document.querySelector('#cursor');
const coinTrack = document.querySelector('#coin-track')
const maxHeight = coinTrack.clientHeight * 0.8;

const defRot = 15;
let rotation = 0;
let rotD = 1;
let rotI = 15;

let height = 0;
let direction = false;
let stay = 10;

let move = false;

async function rotate() {
    if (move) {
        return;
    }

    init();
    while (move) {
        await new Promise(r => { setTimeout(r, 25) });
        doMotion();
        if (!move || height <= 0 && direction) {
            direction = false;
            move = false;
            setRestPosition();
            break;
        }
    }
}

function init() {
    move = true;
    rotD = Math.random() * 2 + 1;
    rotI = defRot * rotD;
    rotation = 0;
    height = 0;
    stay = 10;
}

function doMotion() {
    rotation += rotI;
    if (rotation > 360 || rotation < -360) {
        rotation = rotI;
    }


    if (height >= maxHeight) {
        direction = true;
        if (stay <= 0) {
            height += (direction) ? -10 : 10;
            stay = 10;
        } else {
            stay--;
        }
    } else {
        // move = maxHeight - height / height:
        var delta = (maxHeight - height) * 1.5 / maxHeight + 1;
        height += (direction) ? -10 * delta : 10 * delta;
    }

    render();
}

function renderFaceImg() {
    if (rotation > 270 || rotation < 90) {
        coinHeads.classList.remove('hide');
        coinTails.classList.add('hide');
    } else {
        coinHeads.classList.add('hide');
        coinTails.classList.remove('hide');
    }
}

function render() {
    coin.style.transform = "translateY(" + -height + "px) rotateX(" + rotation + "deg)";
    renderFaceImg();
}

function setRestPosition() {
    rotation = (rotation >= 90 && rotation <= 270) ? 180 : 0;
    renderFaceImg();
    coin.style.transform = "translateY(" + -height + "px) rotateX(45deg)";
}

function mouseDown(e) {
    document.body.style.cursor = "url(/img/4fingevil.png) 2 2, pointer";
}

function mouseUp(e) {
    document.body.style.cursor = "url(/img/4fingpeace.png) 2 2, pointer";
}

const coinFaceHandler = {

    scf: undefined,
    disabled: undefined,

    init: function () {
        this.addOpenChooseCoinListeners();
        this.initializeSelectionCoinListeners();
    },

    swap: function () {
        var heads = coinHeads.src;
        var tails = coinTails.src;
        var headsImgs = document.querySelectorAll('.img-heads');
        var tailsImgs = document.querySelectorAll('.img-tails');
        headsImgs.forEach(h => { h.src = tails });
        tailsImgs.forEach(t => { t.src = heads });
    },

    addOpenChooseCoinListeners: function () {
        var heads = document.querySelector('#heads-face');
        var tails = document.querySelector('#tails-face');
        heads.addEventListener('click', () => { this.showChooseCoin(true, 'CHOOSE HEADS') });
        tails.addEventListener('click', () => { this.showChooseCoin(false, 'CHOOSE TAILS') });
    },

    showChooseCoin: function (face, title) {
        this.scf = face;
        var winTitle = document.querySelector("#select-coin-title");
        winTitle.innerHTML = title;
        var ccWin = document.querySelector('#select-coin');
        ccWin.classList.remove('select-coin-hidden');
        ccWin.classList.add('select-coin-visible');
        ccWin.scrollTo(0,0);

        var disabled = (face) ? coinTails.src : coinHeads.src;
        var coins = document.querySelectorAll('.select-coin-item');
        coins.forEach(c => {
            if (c.src === disabled) {
                c.classList.add('coin-disabled');
                this.disabled = disabled;
            } else {
                c.classList.remove('coin-disabled');
            }
        })

        var modalBg = document.querySelector('#coin-modal-carpet');
        modalBg.classList.add('visible-modal-bg');

    },

    hideChooseCoin: function () {
        var ccWin = document.querySelector('#select-coin');
        ccWin.classList.add('select-coin-hidden');
        ccWin.classList.remove('select-coin-visible');
        var modalBg = document.querySelector('#coin-modal-carpet');
        modalBg.classList.remove('visible-modal-bg');
    },

    initializeSelectionCoinListeners: function () {
        var coins = document.querySelectorAll('.select-coin-item');
        var validChange = false;
        coins.forEach(c => {
            c.addEventListener('click', () => {
                var newCoin = c.src;
                if (this.disabled === newCoin) {
                    return;
                }

                if (this.scf) {
                    coinHeads.src = newCoin;
                    var headsImgs = document.querySelectorAll('.img-heads');
                    headsImgs.forEach(h => {
                        h.src = newCoin
                    });
                } else {
                    coinTails.src = newCoin;
                    var tailsImgs = document.querySelectorAll('.img-tails');
                    tailsImgs.forEach(t => { t.src = newCoin });
                }
                this.hideChooseCoin();
            });

        });
    }
}



coinFaceHandler.init();
window.addEventListener('mousedown', mouseDown);
window.addEventListener('mouseup', mouseUp);