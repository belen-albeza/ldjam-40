'use strict';

const utils = require('./utils.js');

const MOVE_SPEED = 400;
const JUMP_SPEED = 600;

function Chara(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, game.cache.getBitmapData('chara'));
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    this.anchor.set(0.5, 1);

    this.size = 1;
    this.speed = 1;
    this._wasOnAir = false;
    this.__initialCheck = true;
}

Chara.prototype = Object.create(Phaser.Sprite.prototype);
Chara.prototype.constructor = Chara;

Chara.prototype.move = function (dir) {
    this.body.velocity.x = dir * MOVE_SPEED * this.speed;
};

Chara.prototype.jump = function () {
    let canJump = !this._isOnAir();
    let didJump = false;

    if (canJump || this._isBoosting) {
        this.body.velocity.y = -JUMP_SPEED * this.speed;
        this._isBoosting = true;
        if (canJump) {
            didJump = true;
        }
    }

    return didJump;
};

Chara.prototype.die = function () {
    this.alive = false;
    this.body.enable = false;

    this.anchor.set(0.5);
    this.y -= 16;

    this.tween = this.game.add.tween(this)
        .to({alpha: 0, y: this.y - 150, angle: 3 * 360}, 1500, Phaser.Easing.Sinusoidal.InOut, true, 0)
        .onComplete.addOnce(function () {
            this.kill();
        }, this);
};

Chara.prototype.stopJumpBoost = function () {
    this._isBoosting = false;
};

Chara.prototype.grow = function () {
    this.size *= 1.1;
    this.speed *= 0.9;
    this.scale.set(this.size);
};

Chara.prototype.update = function () {
    // chara just landed on the ground from a jump or fall
    if (this._wasOnAir && !this._isOnAir()) {
        this.tween = this.game.add.tween(this.scale)
            .to({x: this.size * 1.2, y: this.size * 0.8}, 80, Phaser.Easing.Sinusoidal.InOut)
            .to({x: this.size * 1, y: this.size * 1}, 80, Phaser.Easing.Sinusoidal.InOut).start();
    }

    this._wasOnAir = this.__initialCheck ? false : this._isOnAir();
    this.__initialCheck = false;
};

//
// helpers
//

Chara.prototype._isOnAir = function () {
    return !this.body.wasTouching.down && !this.body.blocked.down;
};

module.exports = Chara;
