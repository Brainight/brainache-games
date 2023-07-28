const PPConstants = {
    MIN_REFRESH_TIME: 1 / 75,
    FIELD_WIDTH: 1080,
    FIELD_HEIGHT: 540,

    PAD_HEIGHT: 90,
    PAD_WIDTH: 5,
    PAD_DEF_ACC: 400,

    BALL_RADIUS: 4,
    BALL_MAX_V: 800,
    BALL_ACC: 100,

    ONLINE: 0,
    LOCAL: 1,

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

let PPGraphics = function (canvas) {

    this.drawPoints = false;
    this.canvas = canvas;
    this._ctx = this.canvas.getContext('2d');
    this.canvas.width = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - 200;
    this.canvas.height = (window.innerHeight || document.documentElement.clientHeight | document.body.clientHeight) - 200;
    this._xDelta = this.canvas.width / PPConstants.FIELD_WIDTH;
    this._yDelta = this.canvas.height / PPConstants.FIELD_HEIGHT;

    this.drawFrame = function (data) {
        this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Field
        this._ctx.fillStyle = "gray";
        this._ctx.fillRect(0, 0, this.canvas.width, 5);
        this._ctx.fillRect(0, this.canvas.height - 5, this.canvas.width, 5);

        // Draw objects
        let blocks = data.objects.blocks;
        let ellipses = data.objects.ellipses;

        for (var block of blocks) {
            this._drawBlock(block);
        }

        for (var ellipse of ellipses) {
            this._drawEllipse(ellipse);
        }

        //info
        let fps = Math.round(1000 / data.refreshTime);
        this._ctx.fillStyle = "white";
        this._ctx.font = '10px';
        let fpsText = "FPS: " + fps;
        let fpsSize = this._ctx.measureText(fpsText);
        this._ctx.fillText(fpsText, this.canvas.width / 2 - fpsSize.width / 2, this.canvas.height - 20);

        let gameInfo = data.gameInfo;
        this._ctx.font = '16px';
        let score = 'SCORE';
        let scoreBoard = gameInfo.p1Score + ' - ' + gameInfo.p2Score;
        let p1 = gameInfo.p1.name;
        let p2 = gameInfo.p2.name;

        let scts = this._ctx.measureText(score)
        let scbts = this._ctx.measureText(scoreBoard)
        let p2ts = this._ctx.measureText(p2)

        this._ctx.fillText(score, this.canvas.width / 2 - scts.width / 2, 20);
        this._ctx.fillText(scoreBoard, this.canvas.width / 2 - scbts.width / 2, 36);
        this._ctx.fillText(p1, 20, 20);
        this._ctx.fillText(p2, this.canvas.width - 20 - p2ts.width, 20);
    }


    this._drawBlock = function (block) {
        this._ctx.fillStyle = block.fc;
        this._ctx.strokeStyle = block.sc;
        let x = (block.x - block.width / 2) * this._xDelta;
        let y = (block.y - block.height / 2) * this._yDelta;
        this._ctx.fillRect(x, y, block.width * this._xDelta, block.height * this._yDelta);
        this._ctx.strokeRect(x, y, block.width * this._xDelta, block.height * this._yDelta);

        if (this.drawPoints) {
            x = this._xDelta * block.x;
            y = this._yDelta * block.y;
            this._ctx.beginPath();
            this._ctx.fillStyle = '#00FF2B';
            this._ctx.ellipse(x, y, 2 * this._xDelta, 2 * this._yDelta, 0, 0, Math.PI * 2);
            this._ctx.fill();
        }
    }

    this._drawEllipse = function (ellipse) {
        this._ctx.beginPath();
        this._ctx.fillStyle = ellipse.fc;
        this._ctx.strokeStyle = ellipse.sc;
        this._ctx.ellipse(ellipse.x * this._xDelta, ellipse.y * this._yDelta, ellipse.rx * this._xDelta, ellipse.ry * this._yDelta, 0, 0, Math.PI * 2);
        this._ctx.fill();
        this._ctx.stroke();
        if (this.drawPoints) {
            x = this._xDelta * ellipse.x;
            y = this._yDelta * ellipse.y;
            this._ctx.beginPath();
            this._ctx.fillStyle = '#00FF2B';
            this._ctx.ellipse(x, y, 2 * this._xDelta, 2 * this._yDelta, 0, 0, Math.PI * 2);
            this._ctx.fill();
        }
    }
}

let GameObject = function (x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.maxVx = 100000;
    this.maxVy = 100000;
    this.ax = 0;
    this.ay = 0;
    this.stop = false;
    this.fc = '#FFFFFF';
    this.sc = '#000000';

    this.update = function (time) {
        let t = time / 1000;
        if (this.stop) {
            this.vx = 0;
            this.vy = 0;
            this.ax = 0;
            this.ay = 0;
        } else {
            this.vx = this.vx + this.ax * t;
            this.vy = this.vy + this.ay * t;
            if (Math.abs(this.vx) > this.maxVx) {
                this.vx = this.vx / Math.abs(this.vx) * this.maxVx;
            }
            if (Math.abs(this.vy) > this.maxVy) {
                this.vy = this.vy / Math.abs(this.vy) * this.maxVy;
            }
        }

        this.x = this.x + this.vx * t;
        this.y = this.y + this.vy * t;
    }

}

let Ball = function () {
    let o = new GameObject();
    o.rx = PPConstants.BALL_RADIUS;
    o.ry = PPConstants.BALL_RADIUS;
    o.maxVx = PPConstants.BALL_MAX_V / 2;
    o.maxVy = PPConstants.BALL_MAX_V / 2;
    o.screenRx = PPConstants.BALL_RADIUS;
    o.screenRy = PPConstants.BALL_RADIUS;
    o.fc = 'yellow';
    o.sc = 'white';
    return o;
}


let Pad = function () {
    let o = new GameObject();
    o.width = PPConstants.PAD_WIDTH;
    o.height = PPConstants.PAD_HEIGHT;
    o.screenW = PPConstants.PAD_WIDTH;
    o.screenH = PPConstants.PAD_HEIGHT;
    o.fc = 'gray'
    o.sc = 'red';
    o.senseChange = false;

    o.update = function (time) {
        let t = time / 1000;
        if (this.stop) {
            if (this.vy !== 0) {
                this.ay = this.vy > 0 ? -PPConstants.PAD_DEF_ACC * 3 : PPConstants.PAD_DEF_ACC * 3;
            } else {
                this.ay = 0;
                this.ax = 0;
            }
        }
        if (!this.stop && this.ay * this.vy < 0) { //a goes in opposite sense than v
            this.ay = this.ay * 2;
            this.senseChange = true;
        } else if (this.senseChange) {
            this.ay = this.ay < 0 ? -PPConstants.PAD_DEF_ACC : PPConstants.PAD_DEF_ACC;
            this.senseChange = !this.senseChange;
        }

        let lvy = this.vy;
        this.vy = this.vy + this.ay * t;
        if (this.stop && lvy * this.vy < 0) {
            this.vy = 0;
        }
        this.y = this.y + this.vy * t;
    }
    return o;
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

let Player = function (name, human = true, ctrls = PPConstants.CTRL_AWSD) {
    this.name = name
    this.human = human;
    this.pad = undefined;
    this.ctrls = ctrls;
}


let PingPong = function () {

    this.status = undefined;
    this._gameContainer = undefined;
    this.gs = undefined;
    this.player1 = undefined;
    this.player2 = undefined;
    this.p1LastUpdate = 0;
    this.p2LastUpdate = 0;
    this.ball = undefined;
    this.objects = {
        blocks: [],
        ellipses: []
    }

    this.gameInfo = {
        p1: undefined,
        p2: undefined,
        p1Score: 0,
        p2Score: 0,
        remainig: 300
    }

    this.timer = new Timer();
    this.modality = PPConstants.LOCAL;
    this.cpuPlayerUpdateTime = PPConstants.LVL_3_CPU_UPDATE_S;

    this.load = function () {
        this.initializeGraphics();
        this.initializeObjects();
        this.initializeControls();
        this.status = PPConstants.GAME_STATUS_READY;
        this._draw();
    }

    this.initializeGraphics = function () {
        var canvas = document.querySelector('#pp-canvas');
        this.gs = new PPGraphics(canvas);
    }

    this.initializeControls = function () {
        this._gameContainer = document.querySelector('#game-container');
        this._gameContainer.addEventListener('keydown', this._onKeyDown.bind(this), false);
        this._gameContainer.addEventListener('keyup', this._onKeyUp.bind(this), false);
    }

    this.initializeObjects = function () {
        this.ball = new Ball();
        this.ball.x = PPConstants.FIELD_WIDTH / 2;
        this.ball.y = (this.ball.rx + this.ball.ry) * 5;
        this.objects.ellipses.push(this.ball);

        let p1Pad = new Pad();
        p1Pad.x = 10;
        p1Pad.y = PPConstants.FIELD_HEIGHT / 2 - p1Pad.width / 2

        let p2Pad = new Pad();
        p2Pad.x = PPConstants.FIELD_WIDTH - 10;
        p2Pad.y = PPConstants.FIELD_HEIGHT / 2 - p1Pad.width / 2

        this.player1.pad = p1Pad;
        this.player2.pad = p2Pad;
        this.objects.blocks.push(p1Pad);
        this.objects.blocks.push(p2Pad);

        this.gameInfo = {
            p1: this.player1,
            p2: this.player2,
            p1Score: 0,
            p2Score: 0,
            remainig: 300
        }
    }

    this.setPlayer1 = function (player) {
        this.player1 = player;

    }

    this.setPlayer2 = function (player) {
        this.player2 = player;
    }

    this.startLocal = function () {
        if (this.status === PPConstants.GAME_STATUS_READY) {
            this.status = PPConstants.GAME_STATUS_RUNNING;
            this._resetBall();
            window.requestAnimationFrame((t) => { this._gameLoop(t) });
        }
    }

    this.startOnline = function () {
        if (this.status === PPConstants.GAME_STATUS_READY) {
            this.status = PPConstants.GAME_STATUS_RUNNING;
            window.requestAnimationFrame((t) => { this._onlineGameLoop(t) });
        }
    }

    this.__gameLoop = function (time) {
        this.timer.update(time);
        this.gameInfo.remaining = this.timer.totalTime - this.gameInfo.remaining;
        if (this.timer.refreshTime > PPConstants.MIN_REFRESH_TIME) {
            this._update(this.timer.refreshTime);
            this._draw();
        }
    }

    this._gameLoop = function (time) {
        let t = time / 1000;
        this._updateCPUPlayers(t);
        this.__gameLoop(time);
        window.requestAnimationFrame((t) => { this._gameLoop(t) });
    }

    this._onlineGameLoop = function (time) {
        this.__gameLoop(time);
        window.requestAnimationFrame((t) => { this._onlineGameLoop(t) });
    }

    this._updateCPUPlayers = function (t) {
        if (!this.player1.human) {
            if (this.p1LastUpdate < this.cpuPlayerUpdateTime) {
                this.p1LastUpdate += t;
            } else {
                this._calculateNewCPUPlayerAcceleration(this.player1);
            }
        }

        if (!this.player2.human) {
            if (this.p1LastUpdate < this.cpuPlayerUpdateTime) {
                this.p1LastUpdate += t;
            } else {
                this._calculateNewCPUPlayerAcceleration(this.player2);
            }
        }

    }

    this._calculateNewCPUPlayerAcceleration = function (player) {

        let nby = this.ball.y + this.ball.vy * this.cpuPlayerUpdateTime;

        if (player.cpu_ballx_prev_u === undefined) {
            player.cpu_ballx_prev_u = 0;
        }

        player.cpu_ballx_curr_u = this.ball.x;

        if (player.pad.x < player.cpu_ballx_prev_u && player.cpu_ballx_prev_u < player.cpu_ballx_curr_u) { // Left player is cpu and ball is going away
            if (player.pad.y + 5 < PPConstants.FIELD_HEIGHT / 2) {
                player.pad.ay = PPConstants.PAD_DEF_ACC;
                player.pad.stop = false;
            } else if (player.pad.y - 5 > PPConstants.FIELD_HEIGHT / 2) {
                player.pad.ay = -PPConstants.PAD_DEF_ACC;
                player.pad.stop = false;
            } else {
                player.pad.stop = true;
            }
            player.cpu_ballx_prev_u = this.ball.x;
            return;
        }

        if (player.pad.x > player.cpu_ballx_prev_u && player.cpu_ballx_prev_u > player.cpu_ballx_curr_u) { // Right player is cpu and ball is going away
            if (player.pad.y + 5 < PPConstants.FIELD_HEIGHT / 2) {
                player.pad.ay = PPConstants.PAD_DEF_ACC;
                player.pad.stop = false;
            } else if (player.pad.y - 5 > PPConstants.FIELD_HEIGHT / 2) {
                player.pad.ay = -PPConstants.PAD_DEF_ACC;
                player.pad.stop = false;
            } else {
                player.pad.stop = true;
            }
            player.cpu_ballx_prev_u = this.ball.x;
            return;
        }

        if (player.pad.y > nby) {
            player.pad.ay = -PPConstants.PAD_DEF_ACC;
            player.pad.stop = false;
        } else if (player.pad.y < nby) {
            player.pad.ay = PPConstants.PAD_DEF_ACC;
            player.pad.stop = false;
        } else {
            player.pad.stop = true;
        }
        player.cpu_ballx_prev_u = this.ball.x;
    }

    this._update = function (time) {
        this._checkPlayerCollisions(this.player1);
        this._checkPlayerCollisions(this.player2);
        this._checkBallCollisions();
        for (var otype in this.objects) {
            for (var o of this.objects[otype]) {
                o.update(time);
            }
        }
    }

    this._resetBall = function () {
        this.ball.x = PPConstants.FIELD_WIDTH / 2;
        this.ball.y = (this.ball.rx + this.ball.ry) * 5;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.ax = 0;
        this.ball.ay = 0;
        setTimeout((ball) => {
            let x = Math.random();
            ball.ax = ((Math.random() < 0.5) ? 1 : -1) * PPConstants.BALL_ACC * (1 + x);
            ball.ay = ((Math.random() < 0.5) ? 1 : -1) * PPConstants.BALL_ACC * (1 - x);
            ball.stop = false;
        }, 2000, this.ball);
    }

    this._resetPlayers = function () {
        this.player1.pad.x = 10;
        this.player1.pad.y = PPConstants.FIELD_HEIGHT / 2 - this.player1.pad.width / 2

        this.player2.pad.x = PPConstants.FIELD_WIDTH - 10;
        this.player2.pad.y = PPConstants.FIELD_HEIGHT / 2 - this.player2.pad.width / 2
    }

    this._checkBallCollisions = function () {
        if (this.ball.y <= 2) {
            this.ball.y = 3;
            this.ball.ay = -this.ball.ay;
            this.ball.vy = -this.ball.vy;
        } else if (this.ball.y >= PPConstants.FIELD_HEIGHT - 2) {
            this.ball.y = PPConstants.FIELD_HEIGHT - 3;
            this.ball.ay = -this.ball.ay;
            this.ball.vy = -this.ball.vy;
        }

        // Player 1 collision or goal
        if (this.ball.x <= this.player1.pad.x + this.player1.pad.width / 2) {
            if (this.ball.y < this.player1.pad.y - this.player1.pad.height / 2 || this.ball.y > this.player1.pad.y + this.player1.pad.height / 2) {
                console.log(this.player2.name + ' scored!');
                this.gameInfo.p2Score += 1;
                this.ball.stop = true;
                this._resetBall();
            } else {
                let dy = Math.abs(this.ball.y - this.player1.pad.y);
                let delta = dy / this.player1.pad.height / 2;
                this.ball.ax = -this.ball.ax;
                this.ball.ay = this.ball.ay;
                this.ball.vx = -this.ball.vx * (1 + delta);
                this.ball.vy = this.ball.vy * (1 - delta);
                this.ball.x = this.player1.pad.x + this.player1.pad.width;
            }
        }


        // Player 2 collision or goal
        if (this.ball.x >= this.player2.pad.x - this.player2.pad.width / 2) {
            if (this.ball.y < this.player2.pad.y - this.player2.pad.height / 2 || this.ball.y > this.player2.pad.y + this.player2.pad.height / 2) {
                console.log(this.player1.name + ' scored!');
                this.gameInfo.p1Score += 1;
                this.ball.stop = true;
                this._resetBall();
            } else {
                let dy = Math.abs(this.ball.y - this.player2.pad.y);
                let delta = dy / this.player2.pad.height / 2;
                this.ball.ax = -this.ball.ax;
                this.ball.ay = this.ball.ay;
                this.ball.vx = -this.ball.vx * (1 + delta);
                this.ball.vy = this.ball.vy * (1 - delta);
                this.ball.x = this.player2.pad.x;
            }

        }
    }

    this._checkPlayerCollisions = function (player) {
        if (player.pad.y - player.pad.height / 2 <= 1 && player.pad.vy < 0) { // V is up and player is at top -> Bounce
            player.pad.y = player.pad.height / 2;
            player.pad.vy = player.pad.vy / 2 * -1;
            player.pad.ay = PPConstants.PAD_DEF_ACC * 2;
            player.pad.stop = true;
        } else if (player.pad.y + player.pad.height / 2 >= PPConstants.FIELD_HEIGHT - 1 && player.pad.vy > 0) {
            player.pad.y = PPConstants.FIELD_HEIGHT - player.pad.height / 2;
            player.pad.vy = player.pad.vy / 2 * -1;
            player.pad.ay = -PPConstants.PAD_DEF_ACC * 2;
            player.pad.stop = true;
        }
    }

    this._draw = function () {
        this.gs.drawFrame({
            objects: this.objects,
            refreshTime: this.timer.refreshTime,
            gameInfo: this.gameInfo
        });
    }

    this._onKeyDown = function (evt) {

        switch (evt.code) {
            case 'KeyW':
                if (this.player1.human) {
                    this.player1.pad.ay = -PPConstants.PAD_DEF_ACC;
                    this.player1.pad.stop = false;
                }
                break;
            case 'KeyS':
                if (this.player1.human) {
                    this.player1.pad.ay = PPConstants.PAD_DEF_ACC;
                    this.player1.pad.stop = false;
                }
                break;
            case 'ArrowUp':
                if (this.player2.human) {
                    this.player2.pad.ay = -PPConstants.PAD_DEF_ACC;
                    this.player2.pad.stop = false;
                }
                break;
            case 'ArrowDown':
                if (this.player2.human) {
                    this.player2.pad.ay = PPConstants.PAD_DEF_ACC;
                    this.player2.pad.stop = false;
                }
                break;
        }
    }

    this._onKeyUp = function (evt) {

        switch (evt.code) {
            case 'KeyW':
                if (this.player1.human) {
                    this.player1.pad.stop = true;
                }
                break;
            case 'KeyS':
                if (this.player1.human) {
                    this.player1.pad.stop = true;
                }
                break;
            case 'ArrowUp':
                if (this.player2.human) {
                    this.player2.pad.stop = true;
                }
                break;
            case 'ArrowDown':
                if (this.player2.human) {
                    this.player2.pad.stop = true;
                }
                break;
        }
    }

    this.addPlayerControls = function (player, ctrls) {
        if (player === undefined || player == null) {
            throw new Exception('Play cannot be undefined');
        }

        player.controls = ctrls;

    }


}

let pp = new PingPong();
let p1 = new Player('Jane Doe');
let p2 = new Player('CPU', false);
pp.setPlayer1(p1);
pp.setPlayer2(p2);
pp.load();

pp._gameContainer.addEventListener('focus', () => { pp.startLocal(); });