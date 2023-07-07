function BrickSnakeGame(canvas) {

    const BLOCK = 0x0;
    const SNAKE = 0x1;
    const APPLE = 0x2;
    const PINEAPPLE = 0x3;
    const GRANADE = 0x4;
    const GRANADE_SEED = 0x5;
    const BOMB = 0x6;


    const BOMB_GRAY = '#8e7d7d';
    const ROPE = '#bd712e';

    const SNAKE_BLOCK_SIZE = 10;
    const SNAKE_FILL_COLOR = '#00ff00';
    const SNAKE_FILL_COLOR2 = '#21B14C';
    const SNAKE_STROKE_COLOR = '#ff0000';

    const APPLE_BLOCK_SIZE = 10
    const APPLE_FILL_COLOR = '#ff0000'
    const APPLE_STROKE_COLOR = '#fe00a2'

    const PINEAPPLE_BLOCK_SIZE = 20;
    const PINEAPPLE_FILL_COLOR = '#f5fd00';
    const PINEAPPLE_STROKE_COLOR = '#73fd00';

    const GRANADE_BLOCK_SIZE = 30;
    const GRANADE_FILL_COLOR = '#ff08da';
    const GRANADE_STROKE_COLOR = '#08f0ff';

    let Block = function (px = 0, py = 0, w = 10, h = 10, fillColor = '#ffffff', strokeColor = '#ff0000') {
        this.type = BLOCK;
        this.x = px;
        this.y = py;
        this.width = w;
        this.height = h;
        this.immune = false;
        this.fillcolor = fillColor;
        this.strokeColor = strokeColor;
        this._transformSize = { dw: 0, dh: 0 }
    }

    Block.prototype._draw = function (ctx, args) {
        ctx.strokeStyle = this.strokeColor;
        ctx.fillStyle = this.fillcolor;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    Block.prototype.draw = function (ctx, args) {
        this._draw(ctx, args);
    }

    Block.prototype.setTransformSize = function (dw, dh) {
        this._transformSize = { dw: dw, dh: dh };
    }

    let AppleBlock = function (px = 0, py = 0) {
        let block = new Block(px, py, APPLE_BLOCK_SIZE, APPLE_BLOCK_SIZE, APPLE_FILL_COLOR, APPLE_STROKE_COLOR);
        block.type = APPLE;
        return block;
    }

    let PineAppleBlock = function (px = 0, py = 0) {
        let block = new Block(px, py, PINEAPPLE_BLOCK_SIZE, PINEAPPLE_BLOCK_SIZE, PINEAPPLE_FILL_COLOR, PINEAPPLE_STROKE_COLOR);
        block.type = PINEAPPLE;
        return block;
    }

    let GranadeBlock = function (px = 0, py = 0) {
        let block = new Block(px, py, GRANADE_BLOCK_SIZE, GRANADE_BLOCK_SIZE, GRANADE_FILL_COLOR, GRANADE_STROKE_COLOR);
        block.type = GRANADE;
        return block;
    }

    let GranadeSeedBlock = function (px = 0, py = 0) {
        let block = new Block(px, py, 5, 5, GRANADE_STROKE_COLOR, GRANADE_FILL_COLOR);
        block.type = GRANADE_SEED;
        block.vx = 5;
        block.vy = 5;
        block.immune = false;
        block.remove = false;
        return block;
    }

    let Bomb = function (px = 0, py = 0) {
        let bomb = new Block(px, py, APPLE_BLOCK_SIZE, APPLE_BLOCK_SIZE, APPLE_FILL_COLOR, APPLE_STROKE_COLOR);
        bomb.type = BOMB;
        bomb.isTriggered = false;
        bomb.isExploded = false;
        bomb.timeToExplode = 5;

        bomb.draw = function (ctx, args) {

            this._draw(ctx, args);
            if (this.isTriggered && !this.isExploded) {
                ctx.fillStyle = '#000000';
                ctx.textBaseline = 'middle'
                ctx.font = "bold 24px monospace"
                let txt = Math.floor(this.timeToExplode);
                let txtInfo = ctx.measureText(txt);
                ctx.fillText(txt, this.x - txtInfo.width / 2, this.y);
                ctx.fillStyle = BOMB_GRAY;
            }


        }

        bomb.update = function (t) {
            if (this.isTriggered) {
                let time = this.timeToExplode - t;
                if (time < 0) {
                    this.isExploded = true;
                    this.timeToExplode = 0;
                    return;
                }
                this.timeToExplode = time;
            }
        }

        bomb.trigger = function () {
            this.isTriggered = true;
            this.width = 40;
            this.height = 40;
            this.fillStyle = BOMB_GRAY;
            this.strokeStyle = APPLE_FILL_COLOR;
        }
        return bomb;
    }

    let SnakeBlock = function (px = 0, py = 0,) {
        let block = new Block(px, py, SNAKE_BLOCK_SIZE, SNAKE_BLOCK_SIZE, SNAKE_FILL_COLOR, SNAKE_STROKE_COLOR);
        block.type = SNAKE;
        block.draw = function (ctx, args) {
            let color = (args.pos % 2 == 0) ? SNAKE_FILL_COLOR : SNAKE_FILL_COLOR2;
            ctx.strokeStyle = SNAKE_STROKE_COLOR;
            ctx.fillStyle = color;
            let x = this.x - this.width / 2 + (-this._transformSize.dw * this.width / 2);
            let y = this.y - this.height / 2 + (-this._transformSize.dh * this.height / 2);
            let width = this.width + (this._transformSize.dw * this.width);
            let height = this.height + (this._transformSize.dh * this.height);
            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);
        }
        return block;
    }

    let Animation = function (duration = 5) {
        this.duration = duration;
        this.passedTime = 0;
        this._isFinished = false;
        this._onEndCallbacks = [];

    }

    Animation.prototype.draw = function (ctx, args) { };
    Animation.prototype._update = function (time) {
        if(this._isFinished){
            return;
        }
        this.passedTime += time;
        if (this.passedTime >= this.duration) {
            this._isFinished = true;
            this._doEnd();
        }
    };
    Animation.prototype.update = function (time) {
        this._update(time);
    };

    /*
    * The instance of this animation is passed as an argument to the function
    */
    Animation.prototype.addOnEndCallback = function (f) {
        if (this._isFinished) {
            f(this);
        } else {
            this._onEndCallbacks.push(f);
        }
    }

    Animation.prototype._doEnd = function () {
        this._isFinished = true;
        for (var f of this._onEndCallbacks) {
            f(this);
        }
    }

    let GranadeAnimation = function (granade, seeds = []) {
        let animation = new Animation(15);
        animation.granade = granade;
        animation.seeds = seeds;
        animation._time = 0;
        animation.blinkInterval = 0.5;
        animation.granadeAnimationState = false;
        animation._immuneTime = 2;

        for (let seed of seeds) {
            let r = Math.random() < 0.5;
            seed.vx = (Math.random() * 40) * ((Math.random() < 0.5) ? 1 : -1);
            seed.vy = (Math.random() * 40) * ((Math.random() < 0.5) ? 1 : -1);
            if (Math.abs(seed.vx) + Math.abs(seed.vy) < 15) {
                seed.vx += 10;
                seed.vy += 10;
            }
            seed.immune = true;
            seed.fillColor = (r) ? GRANADE_FILL_COLOR : GRANADE_STROKE_COLOR;
            seed.strokeColor = (r) ? GRANADE_STROKE_COLOR : GRANADE_FILL_COLOR;
        }

        animation.update = function (time) {
            if (this._isFinished) {
                return;
            }

            this._update(time);
            this._time += time;
            this._immuneTime -= time;
            let blink = this._time >= this.blinkInterval;
            if (blink) {
                this._time = 0;
                if (this.granade.width <= 0 && this.granade.height <= 0) {
                    this._doEnd();
                    return;
                }
                if (this.granadeAnimationState) {
                    this.granade.width += 5;
                    this.granade.height += 5;
                } else {
                    this.granade.width -= 7;
                    this.granade.height -= 7;
                }
                this.granadeAnimationState = !this.granadeAnimationState;
            }

            let seed;
            let immune = animation._immuneTime > 0;
            for (let i = animation.seeds.length - 1; i > 0; i--) {
                seed = seeds[i];
                if (!immune) {
                    seed.immune = false;
                }
                if (seed.remove) {
                    seeds.splice(i, 1);
                    continue;
                }
                seed.x += time * seed.vx;
                seed.y += time * seed.vy;
                if (blink) {
                    let sc = seed.strokeColor;
                    seed.strokeColor = seed.fillColor;
                    seed.fillColor = sc;
                }
            }
        }

        return animation;
    }

    let ExplosionAnimation = function (bomb, tiktak = 5, explosionTime = 5) {
        let animation = new Animation(10);
        animation.duration = tiktak + explosionTime;
        animation.bomb = bomb;
        animation.particles = [];
        animation.colors = ['#ff0000', '#ff4f08', '#ff9208', '#ffe108', '#ffec08', '#615952']

        let sx, sy;
        for (let i = 0, c = 0, x = 0; i < 500;
            i++, (i >= 500 / animation.colors.length * (c + 1)) ? c++ : c, x = Math.floor(i / 100)) {
            let p = new Block(bomb.x, bomb.y, 5, 5, animation.colors[c], animation.colors[c]);
            sx = (Math.random() < 0.5) ? 1 : -1;
            sy = (Math.random() < 0.5) ? 1 : -1;
            p.vx = Math.random() * 100 * sx;
            p.vy = Math.random() * 100 * sy;
            p.ax = (1 + x * 6) * sx;
            p.ay = (1 + x * 6) * sy;
            animation.particles.push(p);
        }

        animation.update = function (time) {
            if (this._isFinished) {
                return;
            }
            this._update(time);
            this.bomb.update(time);
            if (this.bomb.isExploded) {
                let tsquarediv2 = Math.pow(time, 2);
                for (var p of this.particles) {
                    p.x += p.vx * time + p.ax * tsquarediv2;
                    p.y += p.vy * time + p.ay * tsquarediv2;
                }
            }
        }

        animation.draw = function (ctx, args) {
            if (this.bomb.isExploded) {
                console.log(this.particles);
                this.particles.forEach(p => {
                    p.draw(ctx);
                });
            }
        }
        return animation;
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
    this._foodEaten = [];
    this._paused = false;
    this.isFinished = false;
    this._animations = [];

    this._gameLoop = function (time) {

        if (this._paused) {
            window.requestAnimationFrame(() => { this._printPaused(); });
            return;
        }

        if (this._isFinished) {
            let startbttn = document.querySelector('#bricksnake-start');
            startbttn.style.display = 'block';
            return;
        }

        this._refreshTime = (time - this._lastTime) / 1000;
        if (this._refreshTime < (1 / this._frameLimit)) {
            this._lastTime -= this._refreshTime;
            window.requestAnimationFrame((t) => { this._gameLoop(t) });
            return;
        }
        this._lastTime = time;
        this._updateObjects(this._refreshTime);
        this._handleCollisions();
        this._drawObjects();
        window.requestAnimationFrame((t) => { this._gameLoop(t) });
    }

    this._updateObjects = function (t) {
        this._moveSnake();
        this._handleEatenBlocks();
        this._updateAnimations(t);
    }

    this._moveSnake = function () {
        let head = this.snake[0];
        let nextHead;
        let d = 0;
        switch (this.direction) {
            case 0:
                d = head.y - SNAKE_BLOCK_SIZE;
                if (head.y < 5) {
                    d = this._canvas.height;
                }
                nextHead = new SnakeBlock(head.x, d);
                break;
            case 1:
                d = head.y + SNAKE_BLOCK_SIZE;
                if (head.y + 5 >= this._canvas.height) {
                    d = 0;
                }
                nextHead = new SnakeBlock(head.x, d);
                break;
            case 2:
                d = head.x - SNAKE_BLOCK_SIZE;
                if (head.x < 5) {
                    d = this._canvas.width;
                }
                nextHead = new SnakeBlock(d, head.y);
                break;
            case 3:
                d = head.x + SNAKE_BLOCK_SIZE;
                if (head.x + 5 >= this._canvas.width) {
                    d = 0;
                }
                nextHead = new SnakeBlock(d, head.y);
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
                if (this._grow < 0) {
                    this.snake.pop();
                    this._grow++;
                }
            }
        }
    }

    this._handleEatenBlocks = function () {
        let consumed = false;

        for (let i = 0; i < this.snake.length; i++) {
            for (let j = this._foodEaten.length - 1; j >= 0; j--) {
                if (this._foodEaten[j] === this.snake.length + 1) {
                    this._foodEaten.splice(j, 1);
                    this._grow++;
                    continue;
                }

                if (this._foodEaten[j] == i) {
                    consumed = true;
                    this.snake[i].setTransformSize(0.3, 0.3);
                }
            }

            if (!consumed) {
                this.snake[i].setTransformSize(0, 0);
            }
        }

        for (let j = 0; j < this._foodEaten.length; j++) {
            this._foodEaten[j] = ++this._foodEaten[j];
        }
    }

    this._updateAnimations = function (t) {
        for (let a of this._animations) {
            a.update(t);
        }
    }

    this._handleCollisions = function () {

        //Fruit collisions with snake
        let head = this.snake[0];
        let idxs = [];
        let fruit;

        for (let i = 0; i < this.fruits.length; i++) {
            fruit = this.fruits[i];
            let dx = Math.abs(head.x - fruit.x);
            let dy = Math.abs(head.y - fruit.y);
            let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            let minDx = head.width / 2 + fruit.width / 2;
            let minDy = head.height / 2 + fruit.height / 2;
            if (d < minDx && d < minDy) {
                if (fruit.immune) {
                    continue;
                }
                idxs.push({ fruit: fruit, i: i });
            } else if (fruit.type === BOMB && d < 60) {
                if(!fruit.isTriggered){
                    fruit.trigger();
                    this._startExplosionAnimation(fruit);
                }

            }
        }

        // Process eaten fruits
        for (var idx of idxs) {
            switch (idx.fruit.type) {
                case APPLE:
                    this._score++;
                    this._generateFruit();
                    this._foodEaten.push(0);
                    this._frameLimit += 0.2
                    this.fruits.splice(idx.i, 1);
                    break;
                case PINEAPPLE:
                    this._score += 5;
                    this._foodEaten.push(0);
                    this._foodEaten.push(1);
                    this._frameLimit++; // This will havce no effect at some point depending on clients refresh rate.
                    this.fruits.splice(idx.i, 1);
                    break;
                case GRANADE:
                    this._score += 10;
                    this._foodEaten.push(0);
                    this._foodEaten.push(1);
                    this._frameLimit++; // This will havce no effect at some point depending on clients refresh rate.
                    this._startGranadeAnimation(idx.fruit);
                    break;
                case GRANADE_SEED:
                    this._score += 2;
                    this._foodEaten.push(0);
                    idx.fruit.remove = true;
                    this.fruits.splice(idx.i, 1);
                    break;
                case BOMB:
                    break;
                default:
                    this._score++;
                    this._foodEaten.push(0);
                    this._frameLimit += 0.2
                    this.fruits.splice(idx.i, 1);
                    break;
            }
        }

        if (idxs.length >= 1 && this._score % 10 == 0) {
            this._generateFruit(1, PINEAPPLE);
        }

        if (idxs.length >= 1 && this._score % 50 == 0) {
            this._generateFruit(1, GRANADE);
        }

        // Snake collisions with itself
        for (let i = 3; i < this.snake.length; i++) {
            let dx = Math.abs(head.x - this.snake[i].x);
            let dy = Math.abs(head.y - this.snake[i].y);
            let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            if (d < head.width) {
                this._isFinished = true;
            }
        }
    }

    this._startExplosionAnimation = function (bomb) {
        let bombAnimation = new ExplosionAnimation(bomb);
        bombAnimation.addOnEndCallback((a) => {
            // Remove bomb from fruits
            for (let i = 0; i < this.fruits.length; i++) {
                if (this.fruits[i] === a.bomb) {
                    this.fruits.splice(i, 1);
                    break;
                }
            }
            this._removeAnimation(a);
        })
        this._animations.push(bombAnimation);
    }

    this._startGranadeAnimation = function (granade) {
        let seeds = [];
        granade.immune = true;
        for (let i = 0; i < 200; i++) {
            let g = new GranadeSeedBlock(granade.x, granade.y)
            seeds.push(g);
            this.fruits.push(g);
        }

        let ga = new GranadeAnimation(granade, seeds);
        ga.addOnEndCallback((a) => {
            let fruit;
            for (let i = this.fruits.length - 1; i >= 0; i--) {
                fruit = this.fruits[i];
                if (fruit === a.granade) {
                    this.fruits.splice(i, 1);
                    continue;
                }
                for (let j = a.seeds.length - 1; j >= 0; j--) {
                    if (fruit === a.seeds[j]) {
                        this.fruits.splice(i, 1);
                        a.seeds.splice(j, 1);
                        break;
                    }
                }
            }
            this._removeAnimation(a);
        });
        this._animations.push(ga);
    }

    this._removeAnimation = function (a) {
        for (let i = this._animations.length - 1; i >= 0; i--) {
            if (this._animations[i] === a) {
                this._animations.splice(i, 1);
                break;
            }
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

        for (let i = 0; i < this.snake.length; i++) {
            this.snake[i].draw(this._ctx, { pos: i });
        }

        this.fruits.forEach(fruit => { fruit.draw(this._ctx); });
        this._animations.forEach(a => { a.draw(this._ctx); })
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
                if (this.direction != 1) {
                    this.direction = 0;
                }
                break;
            case 'KeyS':
                if (this.direction != 0) {
                    this.direction = 1;
                }
                break;
            case 'KeyA':
                if (this.direction != 3) {
                    this.direction = 2;
                }
                break;
            case 'KeyD':
                if (this.direction != 2) {
                    this.direction = 3;
                }
                break;
            case 'KeyP':
                this._paused = !this._paused;
                if (!this._paused) {
                    this._gameLoop();
                }
                break;
        }
    }

    this.load = function () {
        var width = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        var height = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

        this._canvas.width = width > 720 ? 720 : width - 20;
        this._canvas.height = height > 540 ? 540 : height / 2;

        this.ctx = this._canvas.getContext('2d');
        this.snake = [
            new SnakeBlock(200, 200),
            new SnakeBlock(200, 210)];

        //this._generateFruit(3);
        this._generateFruit(1, GRANADE);
        this._generateFruit(1, BOMB);

        document.addEventListener('keydown', (e) => { this._onKeyDown(e) });
        this._isloaded = true;
    }

    this._generateFruit = function (amount = 1, type = APPLE) {
        if (Number.isNaN(amount) || amount < 1) {
            amount = 1;
        }
        for (let i = 0; i < amount; i++) {
            let x = Math.random() * (this._canvas.width - 10) + 10;
            let y = Math.random() * (this._canvas.height - 45) + 40;
            switch (type) {
                case APPLE:
                    this.fruits.push(new AppleBlock(x, y));
                    break;
                case PINEAPPLE:
                    this.fruits.push(new PineAppleBlock(x, y));
                    break;
                case GRANADE:
                    this.fruits.push(new GranadeBlock(x, y));
                    break;
                case GRANADE_SEED:
                    this.fruits.push(new GranadeSeedBlock(x, y));
                    break;
                case BOMB:
                    this.fruits.push(new Bomb(x, y));
                    break;
            }

        }
    }

    this.start = function () {
        if (!this._isloaded) {
            this.load();
        }
        window.requestAnimationFrame((t) => { this._gameLoop(t) });
    }

    this._printPaused = function () {
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
        let pcControls2 = 'PAUSE = P';
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

        this._ctx.font = "20px monospace";
        txt = this._ctx.measureText(pcControls2)
        this._ctx.strokeText(pcControls2, this._canvas.width / 2 - txt.width / 2, 212);

        txt = this._ctx.measureText(phoneControls)
        this._ctx.strokeText(phoneControls, this._canvas.width / 2 - txt.width / 2, 416);
    }
}

let startbttn = document.querySelector('#bricksnake-start');
let bsg = new BrickSnakeGame(document.querySelector('#snake-canvas'));
startbttn.addEventListener('click', () => {
    if (bsg._isFinished) {
        bsg = new BrickSnakeGame(document.querySelector('#snake-canvas'));
    }
    bsg.start();
    startbttn.style.display = "none";
});

bsg.load();
bsg.printInstructions();




