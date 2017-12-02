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

},{"./utils.js":7}],2:[function(require,module,exports){
'use strict';

const utils = require('./utils.js');

const SPEED = 100;

function Walker(game, x, y, dir) {
    let img = utils.makeImage(game, 48, 48, '#966b9d');
    Phaser.Sprite.call(this, game, x, y, img);

    this.anchor.set(0.5, 1);
    this.dir = dir || 1;

    this.game.physics.enable(this);
    this.body.velocity.x = SPEED * this.dir;
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

},{"./utils.js":7}],3:[function(require,module,exports){
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
        this.game.load.audio('sfx:reload', 'audio/tremolo.wav');
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

},{"./play_scene.js":6}],4:[function(require,module,exports){
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

},{"./utils.js":7}],5:[function(require,module,exports){
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

},{"./utils.js":7}],6:[function(require,module,exports){
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
    this.isVictory = false;

    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        jump: Phaser.KeyCode.UP,
        ok: Phaser.KeyCode.ENTER
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

    //
    // handle collisions
    //
    // physical world
    this.game.physics.arcade.collide(this.chara, this.platforms);
    this.game.physics.arcade.collide(this.enemyWalkers, this.platforms);
    this.game.physics.arcade.collide(this.enemyWalkers, this.bumpers);
    // vs pickable objects
    this.game.physics.arcade.overlap(
        this.chara, this.pickups, this._onCharaVsPickup, null, this);
    // vs enemies
    this.game.physics.arcade.overlap(
        this.chara, this.enemyWalkers, this._onCharaVsEnemy, null, this);

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

PlayScene._onCharaVsEnemy = function (chara, enemy) {
    // TODO: actual game over state
    this._reload();
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
    reload.events.onInputDown.add(this._reload, this);

    group.add(reload);
    this.reloadButton = reload;
};

//
// sub-states helpers
//

PlayScene._reload = function () {
    // TODO: nice transition
    this.sfx.start.play();
    this.game.state.restart(true, false);
};

PlayScene._nextLevel = function () {
    // TODO: nice transition
    this.sfx.start.play();
    this.game.state.restart(true, false);
};

PlayScene._win = function () {
    this.isVictory = true;
    this.reloadButton.inputEnabled = false;

    let style = {
        font: 'Helvetica, Arial, sans-serif',
        fontSize: '80px',
        fontWeight: 'bold',
        fill: '#fff',
    };

    let message = this.game.make.text(this.game.world.centerX,
        this.game.world.centerY - 50, "WELL DONE", style);
    message.anchor.set(0.5);
    message.setShadow(5, 5, '#0d1321', 0);

    let help = this.game.make.text(this.game.world.centerX,
        this.game.world.centerY + 10, "PRESS <ENTER> TO CONTINUE", {
            font: 'Helvetica, Arial, sans-serif',
            fontSize: '20px',
            fill: '#0d1321'
        });
    help.anchor.set(0.5);
    help.setShadow(2, 2, '#fff', 0);

    this.hud.add(message);
    this.hud.add(help);

    message.inputEnabled = true;
    message.input.useHandCursor = true;
    message.events.onInputDown.add(this._nextLevel, this);
    message.events.onInputOver.add(function () {
        message.fill = '#0d1321';
        message.shadowColor = 'rgba(0, 0, 0, 0)';
    });
    message.events.onInputOut.add(function () {
        message.fill = '#fff';
        message.shadowColor = '#0d1321';
    });

    this.keys.ok.onDown.addOnce(this._nextLevel, this);
};


module.exports = PlayScene;

},{"./chara.js":1,"./enemy-walker.js":2,"./pickup.js":4,"./platform.js":5,"./utils.js":7}],7:[function(require,module,exports){
module.exports = {
    makeImage: function (game, width, height, color) {
        let rect = game.make.bitmapData(width, height);
        rect.ctx.fillStyle = color;
        rect.ctx.fillRect(0, 0, width, height);
        return rect;
    }
}

},{}]},{},[3]);
