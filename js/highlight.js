Highlight = function(game,x,y) {
  Phaser.Sprite.call(this, game, x, y, 'highlight');
  this.anchor.setTo(0.5, 0.5);
  this.visible = true
  this.alpha = .3
  highlightGroup.add(this);
};
Highlight.prototype = Object.create(Phaser.Sprite.prototype);
Highlight.prototype.constructor = Highlight;

function highlightRange(cubeRange, nextAction) {
  highlightGroup = game.add.group()
  highlightGroup.x = hexagonGroup.x
  highlightGroup.y = hexagonGroup.y
  for(var i = 0, length1 = cubeRange.length; i < length1; i++){
    let currentHex = cubeToOffset(cubeRange[i].x, cubeRange[i].z)
    let startX = hexToPixelX(currentHex.col)
    let startY = hexToPixelY(currentHex.col,currentHex.row)
    new Highlight(game, startX, startY)
    highlightGroup.children[i].inputEnabled = true
    game.physics.enable(highlightGroup.children[i], Phaser.Physics.ARCADE)
    highlightGroup.children[i].body.setSize(16, 16, 0, 0)
    if (nextAction === 'move') {
      highlightGroup.children[i].events.onInputDown.add(checkHex, highlightGroup.children[i])
    } else if (nextAction === 'fire') {
      console.log('fire')
      targetCheck(highlightGroup.children[i])
    }
  }
}
