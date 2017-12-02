(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

const utils = require('./utils.js');

const MOVE_SPEED = 400;
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

    this.size = 1;
    this.speed = 1;
}

Chara.prototype = Object.create(Phaser.Sprite.prototype);
Chara.prototype.constructor = Chara;

Chara.prototype.move = function (dir) {
    this.body.velocity.x = dir * MOVE_SPEED * this.speed;
};

Chara.prototype.jump = function () {
    let canJump = this.body.wasTouching.down || this.body.blocked.down;
    let didJump = false;

    if (canJump || this._isBoosting) {
        this.body.velocity.y = -JUMP_SPEED * this.speed;
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

Chara.prototype.grow = function () {
    this.size *= 1.1;
    this.speed *= 0.9;
    this.scale.set(this.size);
};

module.exports = Chara;

},{"./utils.js":6}],2:[function(require,module,exports){
'use strict';

var PlayScene = require('./play_scene.js');


var BootScene = {
    init: function () {
        // NOTE: change this to suit your preferred scale mode.
        //       see http://phaser.io/docs/2.6.2/Phaser.ScaleManager.html
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
    },
    preload: function () {
        // load here assets required for the loading screen
        this.game.load.image('preloader_bar', 'images/preloader_bar.png');
    },

    create: function () {
        this.game.state.start('preloader');
    }
};


var PreloaderScene = {
    preload: function () {
        this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
        this.loadingBar.anchor.setTo(0, 0.5);
        this.load.setPreloadSprite(this.loadingBar);

        // TODO: load here the assets for the game
        this.game.load.audio('sfx:pickup', 'audio/pickup.wav');
        this.game.load.audio('sfx:jump', 'audio/jump.wav');
    },

    create: function () {
        this.game.state.start('play');
    }
};


window.onload = function () {
    var game = new Phaser.Game(960, 600, Phaser.AUTO);

    game.state.add('boot', BootScene);
    game.state.add('preloader', PreloaderScene);
    game.state.add('play', PlayScene);

    game.state.start('boot');
};

},{"./play_scene.js":5}],3:[function(require,module,exports){
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

},{"./utils.js":6}],4:[function(require,module,exports){
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

},{"./utils.js":6}],5:[function(require,module,exports){
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
        pickup: this.game.add.audio('sfx:pickup'),
        jump: this.game.add.audio('sfx:jump')
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

    // UI
    this.hud = this.game.add.group();

    // enable gravity
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayScene.update = function () {
    // TODO: assert chara is alive

    // handle collisions
    this.game.physics.arcade.collide(this.chara, this.platforms);
    this.game.physics.arcade.overlap(
        this.chara, this.pickups, this._onCharaVsPickup, null, this);

    // read input and move main character
    this._handleInput();

    // victory condition
    if (this.pickups.countLiving() === 0 && !this.isVictory) {
        console.log('Well done!');
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

},{"./chara.js":1,"./pickup.js":3,"./platform.js":4,"./utils.js":6}],6:[function(require,module,exports){
module.exports = {
    makeImage: function (game, width, height, color) {
        let rect = game.make.bitmapData(width, height);
        rect.ctx.fillStyle = color;
        rect.ctx.fillRect(0, 0, width, height);
        return rect;
    }
}

},{}]},{},[2]);
