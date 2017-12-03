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
