'use strict';

const utils = require('./utils.js');

function Platform(game, x, y, width, height) {
    // TODO: actual images?
    let img = utils.makeImage(game, width, height, '#bfb6b1');

    Phaser.Sprite.call(this, game, x, y, img);

    this.game.physics.enable(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
}

Platform.prototype = Object.create(Phaser.Sprite.prototype);
Platform.prototype.constructor = Platform;

module.exports = Platform;
