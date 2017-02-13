/***************************************
MECHS
***************************************/

EnemyScout = function(game,x,y) {
  Phaser.Sprite.call(this, game, x, y, "enemy");

  this.name = "Scout";
  this.movePoints = 4
  this.weapon = "SMG"
  this.weaponRange = 2
  this.health = Math.floor((Math.random() * 50) + 200)
  this.damage = Math.floor((Math.random() * 50) + 200)
  this.hasMoved = false
  this.hasFired = false

  this.visible = true
  this.anchor.setTo(0.5375, .5);
  enemySquad.add(this);
};
EnemyScout.prototype = Object.create(Phaser.Sprite.prototype);
EnemyScout.prototype.constructor = EnemyScout;
