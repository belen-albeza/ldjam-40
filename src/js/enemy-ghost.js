'use strict';

const WIDTH = 48;
const HEIGHT = 48;

function Ghost(game, x, y, speedX, speedY) {
    Phaser.Sprite.call(this, game, x, y, game.cache.getBitmapData('ghost'));

    this.anchor.set(0.5);
    this.alpha = 0.7;
    this.speedX = speedX;
    this.speedY = speedY;

    this.game.physics.enable(this);
    this.body.allowGravity = false;

    this.body.velocity.x -= this.speedX;
    this.body.velocity.y = this.speedY;
}

Ghost.prototype = Object.create(Phaser.Sprite.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.update = function () {
    if (this.x <= WIDTH / 2) {
        this.body.velocity.x = this.speedX;
    }
    else if (this.x >= this.game.world.width - WIDTH / 2) {
        this.body.velocity.x = -this.speedX;
    }
    if (this.y <= HEIGHT / 2) {
        this.body.velocity.y = this.speedY;
    }
    else if (this.y >= this.game.world.height - HEIGHT / 2) {
        this.body.velocity.y = -this.speedY;
    }
};

module.exports = Ghost;
