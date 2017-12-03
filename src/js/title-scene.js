'use strict';
const utils = require('./utils.js');

var TitleScene = {};

TitleScene.init = function () {
    this.keys = this.game.input.keyboard.addKeys({
        ok: Phaser.KeyCode.ENTER
    });

    this.keys.ok.onDown.addOnce(function () {
        this.camera.fade(0xefedef, 1000);
        this.camera.onFadeComplete.addOnce(function () {
            this.game.state.start('play', true, false, 1); // start at level 1
        }, this);
    }, this);
};

TitleScene.create = function () {
    this.game.add.image(0, 0, this.game.cache.getBitmapData('background'));
    let band = this.game.add.image(0, this.game.world.centerY - 50,
        utils.makeImage(this.game,
                        this.game.world.width,
                        Math.floor(this.game.world.height / 4),
                        '#0d1321'));
    band.anchor.set(0, 0.5);

    let title = this.game.add.text(
        this.game.world.centerX, this.game.world.centerY - 50, 'grooOW!', {
            font: 'Helvetica, Arial, sans-serif',
            fontSize: '80px',
            fontWeight: 'bold',
            fill: '#fff',
            backgroundColor: '#0d1321'
        });
    title.anchor.set(0.5);
    // title.setShadow(5, 5, '#0d1321', 0);

    let help = this.game.add.text(this.game.world.centerX,
        this.game.world.centerY + 64, "PRESS <ENTER> TO START", {
            font: 'Helvetica, Arial, sans-serif',
            fontSize: '20px',
            fill: '#0d1321'
        });
    help.anchor.set(0.5);
    help.setShadow(2, 2, '#fff', 0)
};


TitleScene.update = function () {

};

module.exports = TitleScene;
