/***************************************
MECHS
***************************************/

// prototype for enemy scout mech
EnemyScout = function(game,x,y) {
  Phaser.Sprite.call(this, game, x, y, "enemy", 0);
  // default animation frame
  this.frame = 0
  // unit name
  this.name = "Scout";
  // large sprites so 1/4 scale
  this.scale.setTo(.25, .25);
  // sets movement points
  this.movePoints = 4

  /**************************
  TODO: make weapon prototypes and weapon sets to vary mech loadouts
  **************************/

  // sets weapon
  this.weapon = "SMG"
  // sets weapon range
  this.weaponRange = 3
  // sets health
  this.health = Math.floor((Math.random() * 50) + 200)
  // sets damage
  this.damage = Math.floor((Math.random() * 50) + 200)
  // crit damage bonus
  this.critDamage = 20
  // these are for tracking units progress through turn
  this.hasMoved = false
  this.hasFired = false
  // determines tactics
  this.movePattern = "alert"
  // walking and firing animations
  this.animations.add('walk', [0,1,2,3,4,5,6,7])
  this.animations.add('fire', [8,9,10,11])

  // allows physics to act on this sprite
  game.physics.arcade.enable(this)
  // adds physics body to be acted on (must be 4x as large as needed because previous scaling affects it)
  this.body.setSize(128, 128, 0, 0)
  this.visible = true
  this.anchor.setTo(0.5, .5);
  this.angle = 90
  // adds sprite to enemySquad group
  enemySquad.add(this);
};
EnemyScout.prototype = Object.create(Phaser.Sprite.prototype);
EnemyScout.prototype.constructor = EnemyScout;
