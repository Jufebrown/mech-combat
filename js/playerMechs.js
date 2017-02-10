Scout = function(game,x,y) {
  Phaser.Sprite.call(this, game, x, y, 'player');
  this.name = "Scout";
  this.movePoints = 4
  this.weapon = "SMG"
  this.weaponRange = 2
  this.health = Math.floor((Math.random() * 50) + 200)
  this.damage = Math.floor((Math.random() * 50) + 200)
  this.anchor.setTo(0.5375, .5);
  this.visible = true
  playerSquad.add(this);
};
Scout.prototype = Object.create(Phaser.Sprite.prototype);
Scout.prototype.constructor = Scout;
