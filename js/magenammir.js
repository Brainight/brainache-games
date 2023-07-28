const PPConstants = {
    MIN_REFRESH_TIME: 1 / 75,
    FIELD_WIDTH: 1080,
    FIELD_HEIGHT: 1080,

    CTRL_AWSD: 0,
    CTRL_ARROW: 1,
    CTRL_CPU: 2,

    LVL_0_CPU_UPDATE_S: 0.5,
    LVL_1_CPU_UPDATE_S: 0.25,
    LVL_2_CPU_UPDATE_S: 0.1,
    LVL_3_CPU_UPDATE_S: 0.05,

    GAME_STATUS_READY: 0,
    GAME_STATUS_RUNNING: 1,
    GAME_STATUS_FINISHED: 2,
    GAME_STATUS_PAUSED: 3
}

let Timer = function () { // Times are stored in ms

    this.totalTime = 0;
    this.lastRefresh = 0;
    this.refreshTime = 0;

    this.update = function (time) {
        this.refreshTime = time - this.lastRefresh;
        this.lastRefresh = time;
        this.totalTime += this.refreshTime;
    }
}

let MageNammir = function () {
    let body = new Games2D.Block(PPConstants.FIELD_WIDTH / 2, PPConstants.FIELD_HEIGHT / 2, 40, 40);
    body.fc = '#00ff00';
    body.sc = '#ffffff';
    let barrel = new Games2D.Block(PPConstants.FIELD_WIDTH / 2 + 20, PPConstants.FIELD_HEIGHT / 2, 40, 15);
    body.fc = '#ff00ff';
    body.sc = '#ffffff';
    let shape = new Games2D.Shape(PPConstants.FIELD_WIDTH / 2, PPConstants.FIELD_HEIGHT / 2, [body, barrel]);
    return shape;
}

let Player = function () {
    this.o = new MageNammir();
    this.points = 0;
    this.life = 100;
}

let MageNammirGame = function () {

    this.player = undefined;
    this.timer = undefined;
    this.gs = undefined;
    this.mousePosition = { x: PPConstants.FIELD_WIDTH / 2, y: PPConstants.FIELD_HEIGHT / 2 }
    this.objects = {
        blocks: [],
        ellipses: [],
        shapes: []
    }

    this.load = function () {
        let canvas = document.createElement('canvas');
        canvas.style['background-color'] = '#0a0a0a';
        document.querySelector('#root').appendChild(canvas);
        this.gs = new Games2D.PPGraphics(canvas);

        var screenW = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
        var screenH = (window.innerHeight || document.documentElement.clientHeight | document.body.clientHeight);


        var w, h;
        if (screenW < screenH) {
            w = screenW - 100
            h = w;
        } else {
            h = screenH - 100
            w = h;
        }
        let dx = w / PPConstants.FIELD_WIDTH;
        let dy = h / PPConstants.FIELD_HEIGHT;
        this.gs._ctx.setTransform({ m11: dx, m13: dx, m33: dy + dx + 1 })
        this.gs.setCanvasSize(w, h)


        this.player = new Player();
        this.timer = new Timer();
        this.objects.shapes.push(this.player.o);
        this._addListener(canvas);
    }

    this._update = function (time) {
        let dx = this.player.o.x - this.mousePosition.x;
        let dy = this.player.o.y - this.mousePosition.y;
        this.player.o.rotation = Math.atan2(dy, dx);
        for (var obj in this.objects) {
            for (var o of this.objects[obj]) {
                o.update(time);
            }
        }
    }

    this._mouseMoveEventListener = function (e) {
        this.mousePosition = { x: e.pageX, y: e.pageY }
    }

    this._addListener = function (canvas) {
        canvas.addEventListener('mousemove', this._mouseMoveEventListener.bind(this));
    }

    this._draw = function () {
        this.gs.drawFrame({ objects: this.objects, refreshTime: this.timer.refreshTime })
    }

    this._gameLoop = function (time) {
        this.timer.update(time);
        if (this.timer.refreshTime > PPConstants.MIN_REFRESH_TIME) {
            this._update(this.timer.refreshTime);
            this._draw();
        }
    }

    this.gameLoop = function (time) {
        this._gameLoop(time);
        window.requestAnimationFrame((t) => { this.gameLoop(t) });
    }

    this.start = function () {
        window.requestAnimationFrame((t) => { this.gameLoop(t) });
    }
}



let game = new MageNammirGame();
game.load();
game.start();