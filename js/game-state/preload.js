'use strict';

module.exports = function() {
  //preloads images and audio
  function onPreload() {
    game.load.image("grassland", "assets/images/map_tiles/grassland.png");
    game.load.image("highlight", "assets/images/map_tiles/highlight.png");
    game.load.image("crater", "assets/images/map_tiles/crater.png");
    // game.load.image("player", "assets/images/mechs/player_ph.png")
    game.load.spritesheet('player', 'assets/images/mechs/playerMech.png', 131, 152, 12);
    game.load.spritesheet('enemy', 'assets/images/mechs/enemyMech.png', 131, 152, 12);
    // game.load.image("enemy", "assets/images/mechs/enemy_ph.png")
    game.load.spritesheet('mechExplosion', 'assets/images/explosions/mech-explosion.png', 100, 100, 81)
    game.load.audio('mechExplosionSound', 'assets/sounds/big-explosion.mp3');
    game.load.audio('alertMusic', ['assets/sounds/Alert.mp3']);
  }
}
