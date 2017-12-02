'use strict';

const utils = require('./utils.js');
const Chara = require('./chara.js');
const Platform = require('./platform.js');
const Pickup = require('./pickup.js');

const GRAVITY = 1800;

const LEVEL_DATA = {
    platforms: [
        {x: 0, y: 576, width: 960, height: 24},
        {x: 0, y: 440, width: 320, height: 24},
        {x: 640, y: 440, width: 320, height: 24}
    ],
    pickups: [
        {x: 164, y: 576 - 16},
        {x: 196, y: 576 - 16},
        {x: 576, y: 576 - 16},
        {x: 608, y: 576 - 16},
        {x: 640, y: 576 - 16},
        {x: 672, y: 576 - 16},
        {x: 288, y: 440 - 16},
        {x: 256, y: 440 - 16},
        {x: 704, y: 440 - 16},
        {x: 736, y: 440 - 16},
        {x: 768, y: 440 - 16}
    ],
    chara: {x: 16, y: 576}
    // chara: {x: 480, y: 576}
};

var PlayScene = {};

PlayScene.init = function () {
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        jump: Phaser.KeyCode.UP
    });
};

PlayScene.create = function () {
    // setup audio sfx and bgm
    this.sfx = {
        pickup: this.game.add.audio('sfx:pickup')
    };

    //
    // load level and main character
    //
    this.background = this.game.add.image(0, 0,
        utils.makeImage(this.game,
                        this.game.world.width,
                        this.game.world.height,
                        '#efedef'));

    this.platforms = this.game.add.group();
    this._spawnPlatforms(this.platforms, LEVEL_DATA.platforms);

    this.pickups = this.game.add.group();
    this._spawnPickups(this.pickups, LEVEL_DATA.pickups);

    this.chara = new Chara(this.game, LEVEL_DATA.chara.x, LEVEL_DATA.chara.y);
    this.game.add.existing(this.chara);

    // enable gravity
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayScene.update = function () {
    this.game.physics.arcade.collide(this.chara, this.platforms);

    this._handleInput();

    // TODO: assert chara is alive
    this.game.physics.arcade.overlap(
        this.chara, this.pickups, this._onCharaVsPickup, null, this);
}

//
// collision handlers
//

PlayScene._onCharaVsPickup = function (chara, pickup) {
    this.sfx.pickup.play();
    pickup.kill();
    chara.grow();
    // TODO: grow sound play
    // TODO: update and show a counter
};

//
// input handlers
//

PlayScene._handleInput = function () {
    // TODO: make sure chara is alive

    // move main chara
    if (this.keys.left.isDown) { // move left
        this.chara.move(-1);
    }
    else if (this.keys.right.isDown) { // move right
        this.chara.move(1);
    }
    else { // stop
        this.chara.move(0);
    }

    // make main chara jump
    const JUMP_HOLD = 200; // TODO: adjust
    // if (this.keys.jump.isDown) {
    if (this.keys.jump.downDuration(JUMP_HOLD)) {
        this.chara.jump();
    }
    else {
        this.chara.stopJumpBoost();
    }
};

//
// level creation helpers
//

PlayScene._spawnPlatforms = function (group, data) {
    data.forEach(function (p) {
        group.add(new Platform(
            this.game, p.x, p.y, p.width, p.height));
    }, this);
};

PlayScene._spawnPickups = function (group, data) {
    data.forEach(function (p) {
        group.add(new Pickup(
            this.game, p.x, p.y));
    }, this);
};


module.exports = PlayScene;
