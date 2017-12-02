'use strict';

const utils = require('./utils.js');
const Chara = require('./chara.js');
const Platform = require('./platform.js');
const Pickup = require('./pickup.js');
const EnemyWalker = require('./enemy-walker.js');

const GRAVITY = 1800;

const LEVEL_DATA = {
    platforms: [
        {x: 0, y: 576, width: 960, height: 24},
        {x: 0, y: 440, width: 320, height: 24},
        {x: 640, y: 440, width: 320, height: 24},
        {x: 400, y: 320, width: 160, height: 24}
    ],
    pickups: [
        {x: 164, y: 576 - 16},
        {x: 196, y: 576 - 16},
        // {x: 576, y: 576 - 16},
        // {x: 608, y: 576 - 16},
        // {x: 640, y: 576 - 16},
        // {x: 672, y: 576 - 16},
        // {x: 288, y: 440 - 16},
        // {x: 256, y: 440 - 16},
        // {x: 704, y: 440 - 16},
        // {x: 736, y: 440 - 16},
        // {x: 768, y: 440 - 16}
    ],
    enemies: {
        walkers: [
            {x: 32, y: 440, dir: 1}
        ]
    },
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
        pickup: this.game.add.audio('sfx:pickup'),
        jump: this.game.add.audio('sfx:jump'),
        start: this.game.add.audio('sfx:reload')
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
    this.bumpers = this.game.add.group();
    this._spawnPlatforms(this.platforms, this.bumpers, LEVEL_DATA.platforms);
    this.pickups = this.game.add.group();
    this._spawnPickups(this.pickups, LEVEL_DATA.pickups);
    this.enemyWalkers = this.game.add.group();
    this._spawnWalkers(this.enemyWalkers, LEVEL_DATA.enemies.walkers);

    this.chara = new Chara(this.game, LEVEL_DATA.chara.x, LEVEL_DATA.chara.y);
    this.game.add.existing(this.chara);

    // UI
    this.hud = this.game.add.group();
    this._setupHud(this.hud);

    // enable gravity
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayScene.update = function () {
    // TODO: assert chara is alive

    // handle collisions
    this.game.physics.arcade.collide(this.chara, this.platforms);
    this.game.physics.arcade.collide(this.enemyWalkers, this.platforms);
    this.game.physics.arcade.collide(this.enemyWalkers, this.bumpers);
    this.game.physics.arcade.overlap(
        this.chara, this.pickups, this._onCharaVsPickup, null, this);

    // read input and move main character
    this._handleInput();

    // victory condition
    if (this.pickups.countLiving() === 0 && !this.isVictory) {
        this._win();
    }
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
        let didJump = this.chara.jump();
        if (didJump) { this.sfx.jump.play(); }
    }
    else {
        this.chara.stopJumpBoost();
    }
};

//
// level creation helpers
//

PlayScene._spawnPlatforms = function (group, bumperGroup, data) {
    data.forEach(function (p) {
        group.add(new Platform(
            this.game, p.x, p.y, p.width, p.height));

        // add bumpers
        let imgBumper = utils.makeImage(this.game, 8, 64, '#ff0000');
        bumperGroup.enableBody = true;

        let leftBumper = this.game.make.sprite(p.x, p.y, imgBumper);
        leftBumper.anchor.set(1, 1);
        bumperGroup.add(leftBumper);
        let rightBumper = this.game.make.sprite(p.x + p.width, p.y, imgBumper);
        rightBumper.anchor.set(0, 1);
        bumperGroup.add(rightBumper);
    }, this);

    bumperGroup.setAll('body.immovable', true);
    bumperGroup.setAll('body.allowGravity', false);
    bumperGroup.visible = false;
};

PlayScene._spawnPickups = function (group, data) {
    data.forEach(function (p) {
        group.add(new Pickup(
            this.game, p.x, p.y));
    }, this);
};

PlayScene._spawnWalkers = function (group, data) {
    data.forEach(function (w) {
        group.add(new EnemyWalker(this.game, w.x, w.y));
    }, this);
};

//
// hud helpers
//

PlayScene._setupHud = function (group) {
    //
    // reload button
    //

    let style = {
        font: 'Helvetica, Arial, sans-serif',
        fontSize: '32px',
        fontWeight: 'bold',
        fill: '#fff'
    };
    let reload = this.game.make.text(this.game.world.width - 8, 8, "RELOAD",
        style);
    reload.anchor.set(1, 0);
    reload.inputEnabled = true;
    reload.input.useHandCursor = true;
    reload.setShadow(2, 2, '#bfb6b1', 0);

    reload.events.onInputOver.add(function () {
        reload.fill = 'rgba(13, 19, 33, 0.8)'
        reload.shadowColor = 'rgba(0, 0, 0, 0)';
    });
    reload.events.onInputOut.add(function () {
        reload.fill = '#fff';
        reload.shadowColor = '#bfb6b1';
    });
    reload.events.onInputDown.add(function () {
        // TODO: nice transition
        this.sfx.start.play();
        this.game.state.restart();
    }, this);

    group.add(reload);
};

//
// sub-states helpers
//

PlayScene._win = function () {
    this.isVictory = true;
    let style = {
        font: 'Helvetica, Arial, sans-serif',
        fontSize: '80px',
        fontWeight: 'bold',
        fill: '#efedef',
    };

    let message = this.game.make.text(this.game.world.centerX,
        this.game.world.centerY, "WELL DONE", style);
    message.anchor.set(0.5);
    message.setShadow(5, 5, 'rgba(13, 19, 33, 0.8)', 0);

    this.hud.add(message);
};


module.exports = PlayScene;
