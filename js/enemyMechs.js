/***************************************
MECHS
***************************************/

EnemyScout = function(game,x,y) {
  Phaser.Sprite.call(this, game, x, y, "enemy");

  this.name = "Scout";
  this.movePoints = 4
  this.weapon = "SMG"
  this.weaponRange = 3
  this.health = Math.floor((Math.random() * 50) + 200)
  this.damage = Math.floor((Math.random() * 50) + 200)
  this.critDamage = 20
  this.hasMoved = false
  this.hasFired = false
  this.movePattern = "alert"

  game.physics.enable(this, Phaser.Physics.ARCADE)
  this.body.setSize(16, 16, 0, 0)
  this.visible = true
  this.anchor.setTo(0.5, .5);
  this.angle = 90
  enemySquad.add(this);
};
EnemyScout.prototype = Object.create(Phaser.Sprite.prototype);
EnemyScout.prototype.constructor = EnemyScout;
