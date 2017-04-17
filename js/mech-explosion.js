// setup for explosion animations
function setupExplosion (explosions) {
    explosions.anchor.x = 0.5;
    explosions.anchor.y = 0.5;
    explosions.animations.add('kaboom');
}

// sends notification that explosion sound is ready
function start() {
  console.log('explosion sound is ready')
}

// function for playing explosion animation
function explodeMech(target) {
  // brings explosion group to top display layer so you can't see magic underneath
  game.world.bringToTop(explosions)
  let explosion = explosions.getFirstExists(false);
  // resets animation in case it has already played
  explosion.reset(target.body.x + 10, target.body.y + 10);
  // plays animation
  explosion.play('kaboom', 20, false, true);
  // plays sound effect
  explosionSound.play()
  // makes camera shake from power of explosion
  game.camera.shake(0.03, 500);
  // places a crater in the hex where explosion occured
  let crater = game.add.sprite(target.body.x - 15, target.body.y - 10, "crater")
  craters.add(crater)
}
