Scout = function(game,x,y) {
  Phaser.Sprite.call(this, game, x, y, 'player');

  this.name = "Scout";
  this.movePoints = 4
  this.weapon = "SMG"
  this.weaponRange = 3
  this.health = Math.floor((Math.random() * 50) + 200)
  this.damage = Math.floor((Math.random() * 50) + 200)
  this.critDamage = 20
  this.hasMoved = false
  this.hasFired = false

  game.physics.enable(this, Phaser.Physics.ARCADE)
  this.body.setSize(16, 16, 0, 0)
  this.anchor.setTo(0.5375, .5);
  this.visible = true
  playerSquad.add(this);
};
Scout.prototype = Object.create(Phaser.Sprite.prototype);
Scout.prototype.constructor = Scout;
