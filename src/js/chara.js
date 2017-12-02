'use strict';

const utils = require('./utils.js');

const MOVE_SPEED = 300;
const JUMP_SPEED = 600;

function Chara(game, x, y) {
    // TODO: replace this with an actual sprite
    const WIDTH = 32;
    const HEIGHT = 32;
    let img = utils.makeImage(game, WIDTH, HEIGHT, '#0d1321');

    Phaser.Sprite.call(this, game, x, y, img);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    this.anchor.set(0.5, 1);
}

Chara.prototype = Object.create(Phaser.Sprite.prototype);
Chara.prototype.constructor = Chara;

Chara.prototype.move = function (dir) {
    this.body.velocity.x = dir * MOVE_SPEED;
};

Chara.prototype.jump = function () {
    let canJump = this.body.wasTouching.down || this.body.blocked.down;
    let didJump = false;

    if (canJump || this._isBoosting) {
        this.body.velocity.y = -JUMP_SPEED;
        this._isBoosting = true;
        if (canJump) {
            // TODO: play jump sfx
            didJump = true;
        }
    }

    return didJump;
};


Chara.prototype.stopJumpBoost = function () {
    this._isBoosting = false;
};

//
// helpers
//

// Chara.prototype._isOnAir = function () {
//     return !this.body.touching.down;
// };


module.exports = Chara;
