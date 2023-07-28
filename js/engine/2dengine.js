const Games2D = {

    PPGraphics: function (canvas, size = { w: 540, h: 540 }) {

        this.drawPoints = false;
        this.canvas = canvas;
        this.canvas.width = size.w;
        this.canvas.height = size.h;
        this._ctx = this.canvas.getContext('2d');
        this.scale = {x: 1, y: 1, z: 0}
        this.translate = {x: 1, y: 1, z: 0}

        this.setCanvasSize = function (w, h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }

        this.drawFrame = function (data) {
            this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw Field
            this._ctx.fillStyle = "gray";
            this._ctx.fillRect(0, 0, this.canvas.width, 5);
            this._ctx.fillRect(0, this.canvas.height - 5, this.canvas.width, 5);

            // Draw objects
            let blocks = data.objects.blocks !== undefined ? data.objects.blocks : [];
            let ellipses = data.objects.ellipses !== undefined ? data.objects.ellipses : [];
            let images = data.objects.images !== undefined ? data.objects.images : [];
            let shapes = data.objects.shapes !== undefined ? data.objects.shapes : [];

            for (var s of shapes) {
                this._drawShape(s);
            }

            for (var block of blocks) {
                this._drawBlock(block);
            }

            for (var ellipse of ellipses) {
                this._drawEllipse(ellipse);
            }

            for (var img of images) {
                this._drawImage(img);
            }

            //info
            let fps = Math.round(1000 / data.refreshTime);
            this._ctx.fillStyle = "white";
            this._ctx.font = '10px';
            let fpsText = "FPS: " + fps;
            let fpsSize = this._ctx.measureText(fpsText);
            this._ctx.fillText(fpsText, this.canvas.width / 2 - fpsSize.width / 2, this.canvas.height - 20);
        }

        this._drawShape = function (shape) {
            let blocks = shape.blocks !== undefined ? shape.blocks : [];
            let ellipses = shape.ellipses !== undefined ? shape.ellipses : [];
            let arcs = shape.arcs !== undefined ? shape.arcs : [];

            for (var b of blocks) {
                this._drawBlock(b, shape);
            }
            for (var e of ellipses) {
                this._drawEllipse(b, shape);
            }
            for (var a of arcs) {
                this._drawArc(b, shape);
            }
        }

        this._drawArc = function (arc) {
            this._ctx.beginPath();
            this._ctx.fillStyle = ellipse.fc;
            this._ctx.strokeStyle = ellipse.sc;
        }


        this._drawBlock = function (block, parentShape) {

            this._ctx.fillStyle = block.fc;
            this._ctx.strokeStyle = block.sc;
            let x = (block.x - block.width / 2)
            let y = (block.y - block.height / 2)
            this._ctx.fillRect(x, y, block.width, block.height);
            this._ctx.strokeRect(x, y, block.width, block.height);

            if (this.drawPoints) {
                x = block.x;
                y = block.y;
                this._ctx.beginPath();
                this._ctx.fillStyle = '#00FF2B';
                this._ctx.ellipse(x, y, 2, 2, 0, 0, Math.PI * 2);
                this._ctx.fill();
            }
        }

        this._drawEllipse = function (ellipse) {
            this._ctx.beginPath();
            this._ctx.fillStyle = ellipse.fc;
            this._ctx.strokeStyle = ellipse.sc;
            this._ctx.ellipse(ellipse.x, ellipse.y, ellipse.rx, ellipse.ry, 0, 0, Math.PI * 2);
            this._ctx.fill();
            this._ctx.stroke();
            if (this.drawPoints) {
                x = this._xDelta * ellipse.x;
                y = this._yDelta * ellipse.y;
                this._ctx.beginPath();
                this._ctx.fillStyle = '#00FF2B';
                this._ctx.ellipse(x, y, 2, 2, 0, 0, Math.PI * 2);
                this._ctx.fill();
            }
        }

        this._drawImage = function (image) {

        }
    },

    GameObject: function (x = 0, y = 0) {
        this.x = x;
        this.y = y;

        this.vx = 0;
        this.vy = 0;
        this.maxVx = 100000;
        this.maxVy = 100000;

        this.ax = 0;
        this.ay = 0;

        this.rotation = 0;
        this.rotationV = 0;
        this.rotationA = 0;

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
                if (this.vx > this.maxVx) {
                    this.vx = this.maxVx;
                }
                if (Math.abs(this.vy) > this.maxVy) {
                    this.vy = this.maxVy;
                }
            }

            this.x = this.x + this.vx * t;
            this.y = this.y + this.vy * t;
        }
    },

    Block: function (x = 0, y = 0, w = 10, h = 10) {
        let go = new Games2D.GameObject(x, y);
        go.width = w;
        go.height = h;
        return go;
    },

    Ellipse: function (x = 0, y = 0, rx = 5, ry = 5) {
        let go = new Games2D.GameObject(x, y);
        go.rx = rx;
        go.ry = ry;
        return go;
    },

    Shape: function (x, y, blocks = [], ellipses = [], shapes = []) {
        let go = new Games2D.GameObject(x, y);
        go.blocks = blocks;
        go.ellipses = ellipses;
        go.shapes = shapes;

        go._updateObject = function (o, time) {
            o.vx = this.vx;
            o.vy = this.vy;
            o.ax = this.ax;
            o.ay = this.ay;
            o.maxVx = this.maxVx;
            o.maxVy = this.maxVy;
            o.rotation = this.rotation;
            o.rotationV = this.rotationV;
            o.rotationA = this.rotationA;
            o.stop = this.stop;
            o.update(time);
        }

        go.update = function (time) {
            for (var o of this.blocks) {
                this._updateObject(o, time);
            }
            for (var o of this.ellipses) {
                this._updateObject(o, time);
            }
            for (var s of this.shapes) {
                s.update(time);
            }
        }
        return go;
    }
}

//export {Games2D};