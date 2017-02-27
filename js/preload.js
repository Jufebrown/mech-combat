//preloads images and audio
function onPreload() {
  game.load.image("grassland", "assets/images/map_tiles/grassland.png");
  game.load.image("highlight", "assets/images/map_tiles/highlight.png");
  game.load.image("player", "assets/images/mechs/player_ph.png")
  game.load.image("enemy", "assets/images/mechs/enemy_ph.png")
  game.load.spritesheet('mechExplosion', 'assets/images/explosions/mech-explosion.png', 100, 100, 81)
  game.load.audio('mechExplosionSound', 'assets/sounds/big-explosion.mp3');
  game.load.audio('alertMusic', ['assets/sounds/Alert.mp3']);
}
