(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

const utils = require('./utils.js');

const MOVE_SPEED = 400;
const JUMP_SPEED = 600;

function Chara(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, game.cache.getBitmapData('chara'));
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    this.anchor.set(0.5, 1);

    this.size = 1;
    this.speed = 1;
    this._wasOnAir = false;
    this.__initialCheck = true;
}

Chara.prototype = Object.create(Phaser.Sprite.prototype);
Chara.prototype.constructor = Chara;

Chara.prototype.freeze = function (dir) {
    // stop character and disable physics
    this.move(0);
    this.body.enable = false;
    this.tween = this.game.add.tween(this).to(
        {alpha: 0}, 1000, Phaser.Easing.Sinusoidal.InOut, true, 0);
};

Chara.prototype.move = function (dir) {
    this.body.velocity.x = dir * MOVE_SPEED * this.speed;
};

Chara.prototype.jump = function () {
    let canJump = !this._isOnAir();
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

Chara.prototype.die = function () {
    this.alive = false;
    this.body.enable = false;

    this.anchor.set(0.5);
    this.y -= 16;

    this.tween = this.game.add.tween(this)
        .to({alpha: 0, y: this.y - 150, angle: 3 * 360}, 1500,
            Phaser.Easing.Sinusoidal.InOut, true, 0)
        .onComplete.addOnce(function () {
            this.kill();
        }, this);
};

Chara.prototype.stopJumpBoost = function () {
    this._isBoosting = false;
};

Chara.prototype.grow = function () {
    this.size *= 1.1;
    this.speed *= 0.9;
    this.scale.set(this.size);
};

Chara.prototype.update = function () {
    // chara just landed on the ground from a jump or fall
    if (this._wasOnAir && !this._isOnAir()) {
        this.tween = this.game.add.tween(this.scale)
            .to({x: this.size * 1.2, y: this.size * 0.8}, 80, Phaser.Easing.Sinusoidal.InOut)
            .to({x: this.size * 1, y: this.size * 1}, 80, Phaser.Easing.Sinusoidal.InOut).start();
    }

    this._wasOnAir = this.__initialCheck ? false : this._isOnAir();
    this.__initialCheck = false;
};

//
// helpers
//

Chara.prototype._isOnAir = function () {
    return !this.body.wasTouching.down && !this.body.blocked.down;
};

module.exports = Chara;

},{"./utils.js":9}],2:[function(require,module,exports){
'use strict';

const WIDTH = 48;
const HEIGHT = 48;

function Ghost(game, x, y, speedX, speedY) {
    Phaser.Sprite.call(this, game, x, y, game.cache.getBitmapData('ghost'));

    this.anchor.set(0.5);
    this.alpha = 0.7;
    this.game.physics.enable(this);
    this.body.allowGravity = false;

    this.body.velocity.x = speedX;
    this.body.velocity.y = speedY;

    this.speedX = Math.abs(speedX);
    this.speedY = Math.abs(speedY);
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

},{}],3:[function(require,module,exports){
'use strict';

const utils = require('./utils.js');

const SPEED = 100;

function Walker(game, x, y, dir) {
    Phaser.Sprite.call(this, game, x, y, game.cache.getBitmapData('walker'));

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
    // if (this.body.blocked.left) {
    //     this.body.velocity.x = SPEED;
    // }
    // else if (this.body.blocked.right) {
    //     this.body.velocity.x = -SPEED;
    // }
};

Walker.prototype.turn = function () {
    this.dir = -this.dir;
    this.body.velocity.x = SPEED * this.dir;
};

module.exports = Walker;

},{"./utils.js":9}],4:[function(require,module,exports){
'use strict';

var PlayScene = require('./play-scene.js');
var TitleScene = require('./title-scene.js');
const utils = require('./utils.js');


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
        this.game.cache.addBitmapData('background',
            utils.makeImage(this.game,
                        this.game.world.width,
                        this.game.world.height,
                        '#efedef'));
        this.game.cache.addBitmapData('preloader_bar',
            utils.makeImage(this.game, this.game.world.width, 8, '#0d1321'));
    },

    create: function () {
        this.game.state.start('preloader');
    }
};


var PreloaderScene = {
    preload: function () {
        this.game.add.image(0, 0, this.game.cache.getBitmapData('background'));
        this.loadingBar = this.game.add.sprite(0, 240,
            this.game.cache.getBitmapData('preloader_bar'));
        this.loadingBar.anchor.setTo(0, 0.5);
        this.load.setPreloadSprite(this.loadingBar);

        this.game.add.text(8, 256, 'LOADING…', {
            font: 'Helvetica, Arial, sans-serif',
            fontSize: '32px',
            fontWeight: 'bold',
            fill: '#0d1321'
        });

        // generate procedural assets

        this.game.cache.addBitmapData('walker',
            utils.makeImage(this.game, 48, 48, '#966b9d'));
        this.game.cache.addBitmapData('ghost',
            utils.makeImageCircle(this.game, 48, '#966b9d'));
        this.game.cache.addBitmapData('pickup',
            utils.makeImageCircle(this.game, 16, '#b8336a'));
        this.game.cache.addBitmapData('pickup-icon',
            utils.makeImageCircle(this.game, 24, '#fff'));
        this.game.cache.addBitmapData('chara',
            utils.makeImage(this.game, 32, 32, '#0d1321'));

        //
        // game assets
        //

        // json levels
        this.game.load.json('level:1', 'data/level01.json');
        this.game.load.json('level:2', 'data/level02.json');
        this.game.load.json('level:3', 'data/level03.json');
        this.game.load.json('level:4', 'data/level04.json');
        this.game.load.json('level:5', 'data/level05.json');
        this.game.load.json('level:6', 'data/level06.json');

        // sfx
        this.game.load.audio('sfx:pickup', 'audio/pickup.wav');
        this.game.load.audio('sfx:jump', 'audio/jump.wav');
        this.game.load.audio('sfx:reload', 'audio/tremolo.wav');
        this.game.load.audio('sfx:death', 'audio/hurt.wav');
        this.game.load.audio('sfx:win', 'audio/win.wav');
        // bgm
        this.game.load.audio('bgm:main', ['audio/bgm.ogg', 'audio/bgm.mp3']);
    },

    create: function () {
        this.game.state.start('title');
        // this.game.state.start('play', true, false, 5); // start at level 1
    }
};


window.onload = function () {
    var game = new Phaser.Game(960, 600, Phaser.AUTO);

    game.state.add('boot', BootScene);
    game.state.add('preloader', PreloaderScene);
    game.state.add('title', TitleScene);
    game.state.add('play', PlayScene);

    game.state.start('boot');
};

},{"./play-scene.js":7,"./title-scene.js":8,"./utils.js":9}],5:[function(require,module,exports){
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

},{"./utils.js":9}],6:[function(require,module,exports){
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

},{"./utils.js":9}],7:[function(require,module,exports){
'use strict';

const utils = require('./utils.js');
const Chara = require('./chara.js');
const Platform = require('./platform.js');
const Pickup = require('./pickup.js');
const EnemyWalker = require('./enemy-walker.js');
const EnemyGhost = require('./enemy-ghost.js');

const GRAVITY = 1800;
const LEVEL_COUNT = 6;

var PlayScene = {};

PlayScene.init = function (level) {
    this.isVictory = false;
    this.level = (level - 1) % LEVEL_COUNT + 1;

    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        jump: Phaser.KeyCode.UP,
        ok: Phaser.KeyCode.ENTER,
        cancel: Phaser.KeyCode.ESC
    });

};

PlayScene.create = function () {
    this.camera.flash(0xefedef, 500);

    const LEVEL_DATA = this.game.cache.getJSON(`level:${this.level}`);

    // setup audio sfx and bgm
    this.sfx = {
        pickup: this.game.add.audio('sfx:pickup'),
        jump: this.game.add.audio('sfx:jump'),
        death: this.game.add.audio('sfx:death'),
        win: this.game.add.audio('sfx:win')
    };

    this.song = this.game.add.audio('bgm:main');
    if (this.song.isDecoded) {
        this.song.loopFull();
    }
    else {
        this.song.onDecoded.addOnce(function () {
            this.song.loopFull();
        }, this);
    }

    //
    // load level and main character
    //
    this.background = this.game.add.image(
        0, 0, this.game.cache.getBitmapData('background'));

    this.tooltips = this.game.add.group();
    if (LEVEL_DATA.tooltips) {
        this._spawnTooltips(this.tooltips, LEVEL_DATA.tooltips);
    }

    this.platforms = this.game.add.group();
    this.bumpers = this.game.add.group();
    this._spawnPlatforms(this.platforms, this.bumpers, LEVEL_DATA.platforms);

    this.pickups = this.game.add.group();
    this._spawnPickups(this.pickups, LEVEL_DATA.pickups);

    this.enemyWalkers = this.game.add.group();
    this.enemyGhosts = this.game.add.group();
    this._spawnWalkers(this.enemyWalkers, LEVEL_DATA.enemies.walkers);
    this._spawnGhosts(this.enemyGhosts, LEVEL_DATA.enemies.ghosts);

    this.chara = new Chara(this.game, LEVEL_DATA.chara.x, LEVEL_DATA.chara.y);
    this.game.add.existing(this.chara);

    this.game.physics.arcade.collide(this.chara, this.platforms);
    // UI
    this.hud = this.game.add.group();
    this._setupHud(this.hud);

    // enable gravity
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayScene.shutdown = function () {
    this.song.stop();
}


PlayScene.update = function () {
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
    this.game.physics.arcade.overlap(
        this.chara, this.enemyGhosts, this._onCharaVsEnemy, null, this);

    // read input and move main character, as long as we are not showing the
    // 'well done!' message
    if (!this.isVictory) { this._handleInput(); }

    // victory condition
    let remaining = this.pickups.countLiving();
    if (remaining === 0 && !this.isVictory) {
        this._win();
    }

    // update pickups counter label
    let pickedCount = this.pickups.length - remaining;
    this.counterLabel.setText(`${pickedCount} / ${this.pickups.length} `);
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
    this.sfx.death.play();
    this.chara.die();
    // undo the 'touching' so walkers don't treat the hero as a wall or bumper
    enemy.body.touching = enemy.body.wasTouching;

    // TODO: actual game over state
    this.chara.events.onKilled.addOnce(this._reload, this);
};

//
// input handlers
//

PlayScene._handleInput = function () {
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
        group.add(new EnemyWalker(this.game, w.x, w.y, w.dir));
    }, this);
};

PlayScene._spawnGhosts = function (group, data) {
    data.forEach(function (g) {
        group.add(new EnemyGhost(this.game, g.x, g.y, g.speedX, g.speedY));
    }, this);
};

PlayScene._spawnTooltips = function (group, data) {
    const PADDING = 16;
    data.forEach(function (t) {
        let label = this.game.make.text(t.x, t.y, t.text.toUpperCase(), {
            fontSize: '18px',
            font: 'Helvetica, Arial, sans-serif',
            fontWeight: 'bold',
            fill: '#bfb6b1',
            backgroundColor: '#fff'
        });
        let bubble = this.game.make.image(
            t.x - PADDING,
            t.y - PADDING,
            utils.makeImage(
                this.game,
                label.width + PADDING * 2,
                label.height + PADDING * 2,
                '#ffffff')
        );
        group.add(bubble);
        group.add(label);
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
    // reload level by clicking this button or pressing esc
    reload.events.onInputDown.add(this._reload, this);
    this.keys.cancel.onDown.addOnce(this._reload, this);

    group.add(reload);
    this.reloadButton = reload;

    //
    // pickups counter
    //
    let counterGroup = this.game.make.group();
    counterGroup.position.set(8, 32);
    group.add(counterGroup);
    let icon = this.game.make.image(
        0, -2, this.game.cache.getBitmapData('pickup-icon'));
    icon.anchor.setTo(0, 0.5);
    let iconShadow = this.game.make.image(
        2, 0, this.game.cache.getBitmapData('pickup-icon'));
    iconShadow.anchor.setTo(0, 0.5);
    iconShadow.tint = 0xbfb6b1;
    counterGroup.add(iconShadow);
    counterGroup.add(icon);

    this.counterLabel = this.game.make.text(32, 0, '', style);
    this.counterLabel.setShadow(2, 2, '#bfb6b1', 0);
    this.counterLabel.anchor.set(0, 0.5);
    counterGroup.add(this.counterLabel);
};

//
// sub-states helpers
//

PlayScene._reload = function () {
    this._changeToLevel(this.level);
};

PlayScene._nextLevel = function () {
    this._changeToLevel(this.level < LEVEL_COUNT ? this.level + 1 : -1);
};

PlayScene._changeToLevel = function (level) {
    this.camera.fade(0xefedef, 1000);
    this.camera.onFadeComplete.addOnce(function () {
        if (level > 0) { // change to indicated level
            this.game.state.restart(true, false, level);
        }
        else { // go back to title screen -- this is on total victory
            // TODO: play total victory tune
            this.game.state.start('title', true, false);
        }
    }, this);
};

PlayScene._win = function () {
    this.isVictory = true;
    let isGameFinished = this.level === LEVEL_COUNT;
    if (isGameFinished) {
        this.song.fadeOut(1000);
        this.song.onFadeComplete.addOnce(function () {
            this.song.stop();
        }, this);
        this.sfx.win.play();
    }

    // disable reload and control of main character
    this.reloadButton.inputEnabled = false;
    this.chara.freeze();
    this.game.add.tween(this.tooltips).to({alpha: 0}, 500).start();

    let style = {
        font: 'Helvetica, Arial, sans-serif',
        fontSize: '80px',
        fontWeight: 'bold',
        fill: '#fff',
    };

    let message = this.game.make.text(
        this.game.world.centerX,
        this.game.world.centerY - 50,
        isGameFinished ? "VICTORY" : "WELL DONE",
        style);
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

},{"./chara.js":1,"./enemy-ghost.js":2,"./enemy-walker.js":3,"./pickup.js":5,"./platform.js":6,"./utils.js":9}],8:[function(require,module,exports){
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

},{"./utils.js":9}],9:[function(require,module,exports){
module.exports = {
    makeImage: function (game, width, height, color) {
        let rect = game.make.bitmapData(width, height);
        rect.ctx.fillStyle = color;
        rect.ctx.fillRect(0, 0, width, height);
        return rect;
    },
    makeImageCircle: function (game, diam, color) {
        let img = game.make.bitmapData(diam, diam);
        img.circle(diam / 2, diam / 2, diam / 2, color);
        return img;
    }
}

},{}]},{},[4]);
