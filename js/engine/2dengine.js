const Games2D = {

    GraphicsData: function (matrix = new DOMMatrix(), b = [], e = [], s = [], t = [], i = []) {
        this.matrix = matrix;
        this.blocks = b;
        this.ellipses = e;
        this.shapes = s;
        this.images = i;
        this.texts = t;
    },

    _GameObject: function (x = 0, y = 0) {
        this.type = 'go'

        this.ox = 0;
        this.oy = 0;
        this.useCurrentXYAsOrigin = false;
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
        let go = new Games2D._GameObject(x, y);
        go.type = 'b'
        go.width = w;
        go.height = h;
        return go;
    },

    Ellipse: function (x = 0, y = 0, rx = 5, ry = 5) {
        let go = new Games2D._GameObject(x, y);
        go.type = 'e'
        go.rx = rx;
        go.ry = ry;
        return go;
    },

    Shape: function (x, y, blocks = [], ellipses = [], shapes = []) {
        let go = new Games2D._GameObject(x, y);
        go.type = 's'
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
    },

    PPGraphics: function (canvas, size = { w: 540, h: 540 }) {

        this.drawPoints = false;
        this.canvas = canvas;
        this.canvas.width = size.w;
        this.canvas.height = size.h;
        this._ctx = this.canvas.getContext('2d');
        this.gsdMap = {
            i: new Games2D.GraphicsData()
        };

        this.setCanvasSize = function (w, h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }

        this.drawFrame = function () {
            this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);


            for (var gsdkey in this.gsdMap) {
                var gsd = this.gsdMap[gsdkey];
                if (gsd.matrix !== undefined && gsd.matrix instanceof DOMMatrix || gsd.matrix instanceof DOMMatrixReadOnly) {
                    this._ctx.setTransform(gsd.matrix);
                }

                // Draw objects
                let blocks = gsd.blocks !== undefined ? gsd.blocks : [];
                let ellipses = gsd.ellipses !== undefined ? gsd.ellipses : [];
                let images = gsd.images !== undefined ? gsd.images : [];
                let shapes = gsd.shapes !== undefined ? gsd.shapes : [];

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
                this._ctx.resetTransform();
            }


        }

        this._drawShape = function (shape) {
            let blocks = shape.blocks !== undefined ? shape.blocks : [];
            let ellipses = shape.ellipses !== undefined ? shape.ellipses : [];
            let arcs = shape.arcs !== undefined ? shape.arcs : [];

            for (var b of blocks) {
                this._drawBlock(b, shape);
            }
            for (var e of ellipses) {
                this._drawEllipse(e, shape);
            }
            for (var a of arcs) {
                this._drawArc(a, shape);
            }
        }

        this._drawArc = function (arc) {
            this._ctx.beginPath();
            this._ctx.fillStyle = ellipse.fc;
            this._ctx.strokeStyle = ellipse.sc;
        }


        this._drawBlock = function (block, parentShape) {

            let r = (parentShape) ? parentShape.rotation : block.rotation;
            let rx = (parentShape) ? parentShape.x : block.ox;
            let ry = (parentShape) ? parentShape.y : block.oy;
            let bx = block.x - rx;
            let by = block.y - ry;
            let x = y = 0;
            this._ctx.save();
            if (block.useCurrentXYAsOrigin) {
                x -= block.width / 2
                y -= block.height / 2;
                this._ctx.translate(block.x - block.ox, block.y - block.oy);
            } else {
                x = (bx - block.width / 2)
                y = (by - block.height / 2)
            }
            this._ctx.rotate(r);
            this._ctx.fillStyle = block.fc;
            this._ctx.strokeStyle = block.sc;

            this._ctx.fillRect(x, y, block.width, block.height);
            this._ctx.strokeRect(x, y, block.width, block.height);
            if (this.drawPoints) {
                this._ctx.beginPath();
                this._ctx.fillStyle = '#00FF2B';
                this._ctx.ellipse(x, y, 2, 2, 0, 0, Math.PI * 2);
                this._ctx.fill();
            }
            this._ctx.restore();
        }

        this._drawEllipse = function (ellipse, parentShape) {
            let r = (parentShape) ? parentShape.rotation : ellipse.rotation;
            let rx = (parentShape) ? parentShape.x : ellipse.ox;
            let ry = (parentShape) ? parentShape.y : ellipse.oy;
            let bx = ellipse.x - rx;
            let by = ellipse.y - ry;
            let x = y = 0;
            this._ctx.save();
            if (ellipse.useCurrentXYAsOrigin) {
                this._ctx.translate(ellipse.x - ellipse.ox, ellipse.y - ellipse.oy);
            } else {
                x = bx
                y = by 
            }
            this._ctx.rotate(r);

            this._ctx.beginPath();
            this._ctx.fillStyle = ellipse.fc;
            this._ctx.strokeStyle = ellipse.sc;
            this._ctx.ellipse(x, y, ellipse.rx, ellipse.ry, 0, 0, Math.PI * 2);
            this._ctx.fill();
            this._ctx.stroke();
            if (this.drawPoints) {
                this._ctx.beginPath();
                this._ctx.fillStyle = '#00FF2B';
                this._ctx.ellipse(x, y, 2, 2, 0, 0, Math.PI * 2);
                this._ctx.fill();
            }
        }

        this._drawImage = function (image) {

        }

        this._printText = function (text) {
            his._ctx.fillStyle = text.fc;
            this._ctx.font = text.font;
            let size = this._ctx.measureText(text.content);
            this._ctx.fillText(text, this.text.x - size.width / 2, this.text.y);
        }

        this.getUntransformedPoint = function (matrixid, x, y) {
            let m = this._ctx.getTransform();
            return { x: x / this.gsdMap[matrixid].matrix.a, y: y / this.gsdMap[matrixid].matrix.d }
        }
    }
}

//export {Games2D};