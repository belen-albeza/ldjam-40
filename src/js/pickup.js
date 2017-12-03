'use strict';

const utils = require('./utils.js');

function Pickup(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, game.cache.getBitmapData('pickup'));

    this.game.physics.enable(this);
    this.body.allowGravity = false;

    this.anchor.set(0.5);
}

Pickup.prototype = Object.create(Phaser.Sprite.prototype);
Pickup.prototype.constructor = Pickup;


module.exports = Pickup;
