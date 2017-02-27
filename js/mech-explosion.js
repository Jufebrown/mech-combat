function setupExplosion (explosions) {
    explosions.anchor.x = 0.5;
    explosions.anchor.y = 0.5;
    explosions.animations.add('kaboom');
}

function start() {
  console.log('explosion sound is ready')
}

function explodeMech(target) {
  game.world.bringToTop(explosions)
  let explosion = explosions.getFirstExists(false);
  explosion.reset(target.body.x, target.body.y);
  explosion.play('kaboom', 20, false, true);
  explosionSound.play()
  game.camera.shake(0.03, 500);
}
