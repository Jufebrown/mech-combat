'use strict';

module.exports = function() {
  Scout = function(game,x,y) {
    Phaser.Sprite.call(this, game, x, y, 'player', 0);
  
    this.name = "Scout";
    this.frame = 0
    this.scale.setTo(.25, .25);
    this.movePoints = 4
    this.weapon = "SMG"
    this.weaponRange = 3
    this.health = Math.floor((Math.random() * 50) + 200)
    this.damage = Math.floor((Math.random() * 50) + 200)
    this.critDamage = 20
    this.hasMoved = false
    this.hasFired = false
    this.animations.add('walk', [0,1,2,3,4,5,6,7])
    this.animations.add('fire', [8,9,10,11])
  
    game.physics.arcade.enable(this)
    this.body.setSize(16, 16, 0, 0)
    this.anchor.setTo(0.5, 0.5);
    this.angle = -90
    this.visible = true
    playerSquad.add(this);
  };
  Scout.prototype = Object.create(Phaser.Sprite.prototype);
  Scout.prototype.constructor = Scout;
}

