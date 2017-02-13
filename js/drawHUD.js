function drawHUD() {
  let infoHUD = game.add.graphics(100, 100);

  // set a fill and line style again
  infoHUD.beginFill(0x2176ff, 1);

  // draw a rectangle
  infoHUD.drawRect(380, -60, 150, 200);
  infoHUD.endFill();

  // set a fill and line style again
  infoHUD.beginFill(0xd1250e, 1);

  // draw a rectangle
  infoHUD.drawRect(380, 150, 150, 200);
  infoHUD.endFill();

  infoHUD.alpha = .6
  infoHUD.fixedToCamera = true
  window.graphics = infoHUD;
}
