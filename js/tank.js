const PPConstants = {
    MIN_REFRESH_TIME: 1 / 75,
    FIELD_WIDTH: 1080,
    FIELD_HEIGHT: 1080,

    CTRL_AWSD: 0,
    CTRL_ARROW: 1,
    CTRL_CPU: 2,

    PGUN_PISTOL: { name: 'pistol', fr: 0.4, dmg: 30, v: 200, area: 1, w: 5, h: 5, fc: '#ffffff', sc: '#32a2a2a' },
    PGUN_SHOTGUN: { name: 'shotgun', fr: 0.7, dmg: 20, v: 300, area: 1, w: 3, h: 3, fc: '#00ffff', sc: '#ffffff' },
    PGUN_MISSILE: { name: 'missile', fr: 1, dmg: 200, v: 350, area: 100, w: 30, h: 10, fc: '#ffffff', sc: '#32a2a2a' },
    PGUN_AR: { name: 'assault rifle', fr: 0.2, dmg: 49, v: 450, area: 10, w: 10, h: 5, fc: '#ff00ff', sc: '#ffffff' },
    PGUN_SMG: { name: 'submachine gun', fr: 0.1, dmg: 30, v: 400, area: 2, w: 7, h: 5, fc: '#ffff00', sc: '#ffffff' },
    PGUN_LASER: { name: 'laser', fr: 0.2, dmg: 200, v: 500, area: 50, w: 15, h: 5, fc: '#ff00000', sc: '#00ff00' },

    LVL_0_CPU_UPDATE_S: 0.5,
    LVL_1_CPU_UPDATE_S: 0.25,
    LVL_2_CPU_UPDATE_S: 0.1,
    LVL_3_CPU_UPDATE_S: 0.05,

    C_BLACK: "#000000",
    C_GREEN_FIELD: "#3e9935",
    C_TANK_GRAY: '#9d878d',
    C_TANK_TIP: '#ff0000',
    C_TREE_TRUNK: '#b2781a',
    C_TREE_LEAF: '#1cb621',
    C_TREE_LEAF2: '#047800',
    C_LAKE_WATER: '#3fe3e8',

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

let Tree = function (x = 0, y = 0) {
    let trunk = new Games2D.Block(x, y, 5, 15);
    trunk.fc = PPConstants.C_TREE_TRUNK;
    trunk.sc = PPConstants.C_BLACK;
    let leaf;
    let leaves = [];
    for (var i = 0; i < 40; i++) {
        leaf = new Games2D.Block(x + (18 * Math.random() * ((Math.random() > 0.5) ? 1 : -1)), y - 6 - (18 * Math.random()), 6, 6);
        leaf.fc = PPConstants.C_TREE_LEAF;
        leaf.sc = PPConstants.C_BLACK
        leaves.push(leaf);
    }
    leaves.unshift(trunk)
    let shape = new Games2D.Shape(0, 0, leaves);
    return shape;
}

let Tree2 = function (x = 0, y = 0) {
    let trunk = new Games2D.Block(x, y, 5, 15);
    trunk.fc = PPConstants.C_TREE_TRUNK;
    trunk.sc = PPConstants.C_BLACK;
    let leaf;
    let leaves = [];
    for (var i = 0; i < 40; i++) {
        leaf = new Games2D.Block(x + (12 * Math.random() * ((Math.random() > 0.5) ? 1 : -1)), y - 6 - (28 * Math.random()), 4, 10);
        leaf.fc = PPConstants.C_TREE_LEAF2;
        leaf.sc = PPConstants.C_BLACK
        leaves.push(leaf);
    }
    leaves.unshift(trunk)
    let shape = new Games2D.Shape(0, 0, leaves);
    return shape;
}

let Lake = function (x = 0, y = 0) {
    let lake = new Games2D.Ellipse(x, y, 200 * Math.random(), 200 * Math.random());
    lake.fc = PPConstants.C_LAKE_WATER;
    lake.sc = PPConstants.C_BLACK;
    return lake;
}

let Tank = function () {
    let body = new Games2D.Block(PPConstants.FIELD_WIDTH / 2, PPConstants.FIELD_HEIGHT / 2, 40, 30);
    body.fc = PPConstants.C_TANK_GRAY
    body.sc = PPConstants.C_BLACK;
    let barrel = new Games2D.Block(PPConstants.FIELD_WIDTH / 2 + 20, PPConstants.FIELD_HEIGHT / 2, 40, 10);
    barrel.fc = PPConstants.C_TANK_GRAY
    barrel.sc = PPConstants.C_BLACK;
    let barrelEnd = new Games2D.Block(PPConstants.FIELD_WIDTH / 2 + 30, PPConstants.FIELD_HEIGHT / 2, 5, 10)
    barrelEnd.fc = PPConstants.C_TANK_TIP
    barrelEnd.sc = PPConstants.C_BLACK;
    let shape = new Games2D.Shape(PPConstants.FIELD_WIDTH / 2, PPConstants.FIELD_HEIGHT / 2, [body, barrel, barrelEnd]);
    return shape;
}

let Gun = function (stats = PPConstants.PGUN_LASER) {
    this.stats = stats;
    this._lastFired = 1000;
    this.fire = function (time) {
        if (this._lastFired > this.stats.fr) {
            this._lastFired = 0;
            return true;
        } else {
            this._lastFired += time;
            return false;
        }
    }
}

let Player = function () {
    this.o = new Tank();
    this.shooting = false;
    this.gun = new Gun();
    this.points = 0;
    this.life = 100;
    this.gun.chambered = false;
    this.shoot = function (time) { // Returns true if shoot / false if player is not shooting or firerated > lastFired.
        let s = (this.shooting || this.gun.chambered) && this.gun.fire(time);
        if (this.gun.chambered) {
            this.gun.chambered = false;
        }
        return s;
    }
}


let TankGame = function () {

    this.player = undefined;
    this.timer = undefined;
    this.gs = undefined;
    this.mousePosition = { x: PPConstants.FIELD_WIDTH / 2, y: PPConstants.FIELD_HEIGHT / 2 }

    this.objects = {
        tank: undefined,
        bullets: [],
        enemies: [],
    }

    this.map = {
        trees: [],
        lakes: []
    }

    this.load = function () {
        let canvas = document.createElement('canvas');
        canvas.style['background-color'] = PPConstants.C_GREEN_FIELD;
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
        this.gs.setCanvasSize(w, h);
        let tscMatrix = new DOMMatrixReadOnly([dx, 0, 0, dy, dx, dy]).translate(PPConstants.FIELD_WIDTH / 2, PPConstants.FIELD_HEIGHT / 2);
        this.gs.gsdMap.scaled = new Games2D.GraphicsData(new DOMMatrixReadOnly([dx, 0, 0, dy, dx, dy]));
        this.gs.gsdMap.tank = new Games2D.GraphicsData(tscMatrix);

        this.player = new Player();
        this.timer = new Timer();
        this.objects.tank = this.player.o;
        this._generateMap();
        this._addListeners(canvas);
    }

    this._generateMap = function () {
        let trees = [];
        for (var i = 0; i < 40; i++) {
            var tree = new Tree(PPConstants.FIELD_WIDTH * Math.random(), PPConstants.FIELD_HEIGHT * Math.random())
            var tree2 = new Tree2(PPConstants.FIELD_WIDTH * Math.random(), PPConstants.FIELD_HEIGHT * Math.random())
            trees.push(tree);
            trees.push(tree2);
        }

        let lakes = [new Lake(PPConstants.FIELD_WIDTH * Math.random(), PPConstants.FIELD_HEIGHT * Math.random()),
        new Lake(PPConstants.FIELD_WIDTH * Math.random(), PPConstants.FIELD_HEIGHT * Math.random())]

        this.map.trees = trees;
        this.map.lakes = lakes;
    }

    this._update = function (time) {
        this._updatePlayer(time / 1000);
        for (var o in this.objects) {
            let objs = this.objects[o];
            if (Array.isArray(objs)) {
                for (var obj of objs) {
                    obj.update(time);
                }
            } else {
                objs.update(time);
            }
        }

    }

    this._updatePlayer = function (time) { // Time is in s
        var p = this.gs.getUntransformedPoint('scaled', this.mousePosition.x, this.mousePosition.y);
        let dx = this.player.o.x - p.x;
        let dy = this.player.o.y - p.y;
        this.player.o.rotation = Math.atan2(dy, dx);
        if (this.player.shoot(time)) {
            this.createBullet();
        }
    }

    this.createBullet = function () {
        this._createBullet();
        if (this.player.gun.stats.name == 'shotgun') {
            console.log('shotgun')
            var a = Math.random();
            this._createBullet(100 * a, -100 * a);
            a = Math.random();
            this._createBullet(100 * a, -100 * a);
            a = Math.random();
            this._createBullet(100 * a, -100 * a);
            a = Math.random();
            this._createBullet(100 * a, -100 * a);
            a = Math.random();
            this._createBullet(100 * a, -100 * a);
            a = Math.random();
            this._createBullet(100 * a, -100 * a);
            a = Math.random();
            this._createBullet(100 * a, -100 * a);
            a = Math.random();
            this._createBullet(100 * a, -100 * a);
            a = Math.random();
            this._createBullet(100 * a, -100 * a);
        }
    }

    this._createBullet = function (dvx = 0, dvy = 0) {
        let x = this.player.o.x;
        let y = this.player.o.y;
        let b = new Games2D.Block(x, y, this.player.gun.stats.w, this.player.gun.stats.h);
        b.ox = x;
        b.oy = y;
        b.type = this.player.gun.stats.name;
        b.rotation = this.player.o.rotation;
        b.vx = this.player.gun.stats.v * Math.cos(this.player.o.rotation);
        b.vy = this.player.gun.stats.v * Math.sin(this.player.o.rotation);
        b.vx += b.vx > 0 ? dvx : -dvx;
        b.vy += b.vy > 0 ? dvy : -dvy;
        b.fc = this.player.gun.stats.fc;
        b.sc = this.player.gun.stats.sc;
        b.useCurrentXYAsOrigin = true;
        this.objects.bullets.push(b);
    }

    this._mouseMoveEventListener = function (e) {
        this.mousePosition = { x: e.clientX - e.target.offsetLeft, y: e.clientY - e.target.offsetTop }
    }

    this._mouseDownEventListener = function (e) {
        this.player.shooting = true;
    }

    this._mouseUpEventListener = function (e) {
        this.player.shooting = false;
        if (!this.player.gun.chambered) {
            this.player.gun.chambered = true;
        }
    }

    this._keyDownEventListener = function (e) {
        switch (e.code) {
            case 'Digit1':
                this.player.gun.stats = PPConstants.PGUN_PISTOL;
                break;
            case 'Digit2':
                this.player.gun.stats = PPConstants.PGUN_SHOTGUN;
                break;
            case 'Digit3':
                this.player.gun.stats = PPConstants.PGUN_SMG;
                break;
            case 'Digit4':
                this.player.gun.stats = PPConstants.PGUN_AR;
                break;
            case 'Digit5':
                this.player.gun.stats = PPConstants.PGUN_MISSILE;
                break;
            case 'Digit6':
                this.player.gun.stats = PPConstants.PGUN_LASER;
                break;
        }
        this.player.gun.chambered = true;
        this.player.gun._lastFired = 10000;
    }

    this._addListeners = function (canvas) {
        canvas.addEventListener('mousemove', this._mouseMoveEventListener.bind(this));
        canvas.addEventListener('mouseup', this._mouseUpEventListener.bind(this));
        canvas.addEventListener('mousedown', this._mouseDownEventListener.bind(this));
        document.addEventListener('keydown', this._keyDownEventListener.bind(this));
    }

    this._draw = function () {
        this.gs.gsdMap.tank.shapes = [this.objects.tank];
        this.gs.gsdMap.tank.blocks = this.objects.bullets;
        this.gs.gsdMap.scaled.shapes = this.map.trees;
        this.gs.gsdMap.scaled.ellipses = this.map.lakes;
        this.gs.drawFrame()
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



let game = new TankGame();
game.load();
game.start();