function BrickSnakeGame(canvas) {

    const SNAKE_BLOCK_SIZE = 10
    const SNAKE_FILL_COLOR = '#00ff00'
    const SNAKE_STROKE_COLOR = '#ff0000'

    const FRUIT_BLOCK_SIZE = 10
    const FRUIT_FILL_COLOR = '#ff0000'
    const FRUIT_STROKE_COLOR = '#fe00a2'

    let Block = function (px = 0, py = 0, w = 10, h = 10) {
        this.x = px;
        this.y = py;
        this.width = w;
        this.height = h;
    }

    this._canvas = canvas;
    this._ctx = this._canvas.getContext('2d');
    this._isloaded = false;
    this.snake = []
    this.direction = -1; // -1 still, 0 up, 1 down, 2 left, 3 right
    this.fruits = [];
    this._score = 0;

    this._refreshTime = 0;
    this._lastTime = 0;
    this._frameLimit = 10;
    this._grow = 0;

    this._paused = false;

    this._gameLoop = function (time) {

        if(this._paused){
            window.requestAnimationFrame(() => {this._printPaused();});
            return;
        }

        this._refreshTime = (time - this._lastTime) / 1000;
        if (this._refreshTime < (1 / this._frameLimit)) {
            this._lastTime -= this._refreshTime;
            window.requestAnimationFrame((t) => { this._gameLoop(t) });
            return;
        }
        this._lastTime = time;
        this._updateObjects();
        this._handleCollisions();
        this._drawObjects();
        window.requestAnimationFrame((t) => { this._gameLoop(t) });
    }

    this._updateObjects = function () {

        let head = this.snake[0];
        let nextHead;
        let d = 0;
        switch (this.direction) {
            case 0:
                d = head.y - SNAKE_BLOCK_SIZE;
                if (head.y < 5) {
                    d = this._canvas.height;
                }
                nextHead = new Block(head.x, d, SNAKE_BLOCK_SIZE, SNAKE_BLOCK_SIZE);
                break;
            case 1:
                d = head.y + SNAKE_BLOCK_SIZE;
                if (head.y + 5 >= this._canvas.height) {
                    d = 0;
                }
                nextHead = new Block(head.x, d, SNAKE_BLOCK_SIZE, SNAKE_BLOCK_SIZE);
                break;
            case 2:
                d = head.x - SNAKE_BLOCK_SIZE;
                if (head.x < 5) {
                    d = this._canvas.width;
                }
                nextHead = new Block(d, head.y, SNAKE_BLOCK_SIZE, SNAKE_BLOCK_SIZE);
                break;
            case 3:
                d = head.x + SNAKE_BLOCK_SIZE;
                if (head.x + 5 >= this._canvas.width) {
                    d = 0;
                }
                nextHead = new Block(d, head.y, SNAKE_BLOCK_SIZE, SNAKE_BLOCK_SIZE);
                break;
            default:
                break;
        }
        if (nextHead !== undefined) {
            this.snake.unshift(nextHead);
            if (this._grow > 0) {
                this._grow--;
            } else {
                this.snake.pop();
            }



        }
    }

    this._handleCollisions = function () {
        let head = this.snake[0];
        let idxs = [];
        let fruit;
        for (let i = 0; i < this.fruits.length; i++) {
            fruit = this.fruits[i];
            let x = head.x + 10 > fruit.x && head.x - 10 < fruit.x;
            let y = head.y + 10 > fruit.y && head.y - 10 < fruit.y;
            if (x & y) {
                idxs.push(i);
                this._grow++;
                this._score++;
            }
        }

        // Remove fruits
        for (var idx of idxs) {
            this.fruits.splice(idx, 1);
        }

        if (idxs.length >= 1) {
            this._generateFruit(idxs.length);
        }

    }

    this.setFrameLimit = function (limit) {
        if (!Number.isNaN(limit)) {
            this._frameLimit = limit;
        }
    }

    this._drawObjects = function () {
        this._ctx.clearRect(0, 0, canvas.width, canvas.height);
        this._drawInfo();

        this.snake.forEach(block => {
            this._ctx.strokeStyle = SNAKE_STROKE_COLOR;
            this._ctx.fillStyle = SNAKE_FILL_COLOR;
            this._ctx.fillRect(block.x, block.y, block.width, block.height);
            this._ctx.strokeRect(block.x, block.y, block.width, block.height);

        });

        this.fruits.forEach(fruit => {
            this._ctx.strokeStyle = FRUIT_STROKE_COLOR;
            this._ctx.fillStyle = FRUIT_FILL_COLOR;
            this._ctx.fillRect(fruit.x, fruit.y, fruit.width, fruit.height);
            this._ctx.strokeRect(fruit.x, fruit.y, fruit.width, fruit.height);
        });
    }

    this._drawInfo = function () {
        fps = Math.round(1 / this._refreshTime);
        this._ctx.fillStyle = "white";
        this._ctx.font = 'bold 10px monospace';
        this._ctx.fillText("FPS: " + fps, this._canvas.width - 50, 20);

        this._ctx.font = 'bold 16px monospace';
        let text = this._ctx.measureText("Score");
        this._ctx.fillText("Score", this._canvas.width / 2 - text.width / 2, 20);
        text = this._ctx.measureText(this._score);
        this._ctx.fillText(this._score, this._canvas.width / 2 - text.width / 2, 36);
    }

    this._onKeyDown = function (e) {
        switch (e.code) {
            case 'KeyW':
                this.direction = 0;
                break;
            case 'KeyS':
                this.direction = 1;
                break;
            case 'KeyA':
                this.direction = 2;
                break;
            case 'KeyD':
                this.direction = 3;
                break;
            case 'KeyP':
                this._paused = !this._paused;
                if(!this._paused){
                    this._gameLoop();
                }
                break;
        }
    }

    this.load = function () {
        this._canvas.width = 720;
        this._canvas.height = 540;

        this.ctx = this._canvas.getContext('2d');
        this.snake = [
            new Block(200, 200, this.SNAKE_BLOCK_SIZE, this.SNAKE_BLOCK_SIZE),
            new Block(200, 200 + this.SNAKE_BLOCK_SIZE, this.SNAKE_BLOCK_SIZE,
                this.SNAKE_BLOCK_SIZE)];

        this._generateFruit(3);

        document.addEventListener('keydown', (e) => { this._onKeyDown(e) });
        this._isloaded = true;
    }

    this._generateFruit = function (amount = 1) {
        if (Number.isNaN(amount) || amount < 1) {
            amount = 1;
        }
        for (let i = 0; i < amount; i++) {
            let x = Math.random() * (this._canvas.width - 10) + 10;
            let y = Math.random() * (this._canvas.height - 45) + 40;
            this.fruits.push(new Block(x, y, 10, 10));
        }
    }

    this.start = function () {
        if (!this._isloaded) {
            this.load();
        }
        window.requestAnimationFrame((t) => { this._gameLoop(t) });
    }

    this._printPaused = function(){
        this._ctx.clearRect(0, 0, canvas.width, canvas.height);
        this._ctx.font = "48px monospace";
        let p = 'PAUSED';
        let t = this._ctx.measureText(p);
        this._ctx.strokeStyle = "white";
        this._ctx.strokeText(p, this._canvas.width / 2 - t.width / 2,
         this._canvas.height / 2 - 12);
    }

    this.printInstructions = function () {
        let pc = 'PC';
        let pcControls = 'UP = W | DOWN = S | LEFT = A | RIGHT = S';
        let pcControls2 = 'PAUSE = P | ';
        let phone = "PHONE/TABLET";
        let phoneControls = 'Non Existent Yet'


        this._ctx.strokeStyle = 'white';

        this._ctx.font = "32px monospace";
        let txt = this._ctx.measureText(pc);
        this._ctx.strokeText(pc, this._canvas.width / 2 - txt.width / 2, 150);

        txt = this._ctx.measureText(phone)
        this._ctx.strokeText(phone, this._canvas.width / 2 - txt.width / 2, 380);

        this._ctx.font = "20px monospace";
        txt = this._ctx.measureText(pcControls)
        this._ctx.strokeText(pcControls, this._canvas.width / 2 - txt.width / 2, 186);

        txt = this._ctx.measureText(phoneControls)
        this._ctx.strokeText(phoneControls, this._canvas.width / 2 - txt.width / 2, 416);
    }
}

let startbttn = document.querySelector('#bricksnake-start');
let bsg = new BrickSnakeGame(document.querySelector('#snake-canvas'));
startbttn.addEventListener('click', () => {
    bsg.load();
    bsg.start();
    startbttn.style.display = "none";
});

bsg.load();
bsg.printInstructions();




