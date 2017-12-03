'use strict';

const utils = require('./utils.js');

const SPEED = 100;

function Walker(game, x, y, dir) {
    Phaser.Sprite.call(this, game, x, y, game.cache.getBitmapData('walker'));

    this.anchor.set(0.5, 1);
    this.dir = dir || 1;

    this.game.physics.enable(this);
    this.body.velocity.x = SPEED * this.dir;

    this.game.add.tween(this.scale).to({x: 1.1, y: 0.9}, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);
}

Walker.prototype = Object.create(Phaser.Sprite.prototype);
Walker.prototype.constructor = Walker;

Walker.prototype.update = function () {
    if (this.body.touching.left || this.body.touching.right) {
        this.turn();
    }
};

Walker.prototype.turn = function () {
    this.dir = -this.dir;
    this.body.velocity.x = SPEED * this.dir;
};

module.exports = Walker;
