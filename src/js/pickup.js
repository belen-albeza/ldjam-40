'use strict';

const utils = require('./utils.js');

function Pickup(game, x, y) {
    let img = utils.makeImage(game, 16, 16, '#b8336a');
    Phaser.Sprite.call(this, game, x, y, img);

    this.game.physics.enable(this);
    this.body.allowGravity = false;

    this.anchor.set(0.5);
}

Pickup.prototype = Object.create(Phaser.Sprite.prototype);
Pickup.prototype.constructor = Pickup;

module.exports = Pickup;
