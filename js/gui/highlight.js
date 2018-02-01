/**************************************
                Player
**************************************/
function highlightRange(cubeRange, nextAction) {
  highlightGroup = game.add.group()
  highlightGroup.x = hexagonGroup.x
  highlightGroup.y = hexagonGroup.y
  highlightGroup.z = 1
  targetFound = false
  for(var i = 0, length1 = cubeRange.length; i < length1; i++){
    let currentHex = cubeToOffset(cubeRange[i].x, cubeRange[i].z)
    let startX = hexToPixelX(currentHex.col)
    let startY = hexToPixelY(currentHex.col,currentHex.row)
    new Highlight(game, startX, startY)
    highlightGroup.children[i].inputEnabled = true
    game.physics.enable(highlightGroup.children[i], Phaser.Physics.ARCADE)
    highlightGroup.children[i].body.setSize(32, 32, 0, 0)
    if (nextAction === 'move') {
      highlightGroup.children[i].events.onInputDown.add(checkHex, highlightGroup.children[i])
    } else if (nextAction === 'fire') {
      targetCheck(highlightGroup.children[i])
    }
  }
}

function killHighlight() {
  for(let i = 0, length1 = highlightGroup.children.length; i < length1; i++){
    highlightGroup.children[i].visible = false
  }
  highlightGroup.children = []
}

function spriteTint(highlightSprite) {
  targetFound = true
  highlightSprite.tint = 0xff2100
  highlightSprite.alpha = .3
  for(let i = 0, length1 = enemySquad.children.length; i < length1; i++){
    let targetCandidate = enemySquad.children[i]
    game.physics.arcade.overlap(targetCandidate, highlightSprite, this.targetEnable, null, this)
  }
}

function targetCheck(highlightSprite) {
  game.physics.arcade.overlap(highlightSprite, enemySquad, this.spriteTint, null, this)
  game.time.events.add(Phaser.Timer.SECOND * .5, resolveTargetNotFound, this)
}

Highlight = function(game,x,y) {
  Phaser.Sprite.call(this, game, x, y, 'highlight');
  this.anchor.setTo(0.5, 0.5);
  this.visible = true
  this.alpha = .3
  highlightGroup.add(this);
};
Highlight.prototype = Object.create(Phaser.Sprite.prototype);
Highlight.prototype.constructor = Highlight;

function resolveTargetNotFound() {
  if (targetFound === false) {
    currentSprite.hasFired = true
    killHighlight()
    enablePlayerMoves()
    checkEndPlayerTurn()
  }
}
/**************************************
                Enemy
**************************************/
// function enemyHighlightRange(cubeRange) {
//   targetFound = false
//   for(var i = 0, length1 = cubeRange.length; i < length1; i++){
//     let currentHex = cubeToOffset(cubeRange[i].x, cubeRange[i].z)
//     let startX = hexToPixelX(currentHex.col)
//     let startY = hexToPixelY(currentHex.col,currentHex.row)
//     new EnemyHighlight(game, startX, startY)
//     game.physics.enable(enemyHighlightGroup.children[i], Phaser.Physics.ARCADE)
//     enemyHighlightGroup.children[i].body.setSize(16, 16, 0, 0)
//     enemyTargetCheck(enemyHighlightGroup.children[i])
//   }
// }

// function killEnemyHighlight() {
//   for(var i = 0, length1 = enemyHighlightGroup.children.length; i < length1; i++){
//     enemyHighlightGroup.children[i].visible = false
//   }
//   enemyHighlightGroup.children = []
// }




// function enemyResolveTargetNotFound() {
//   if (enemyTargetFound === false) {
//     console.log('is this working')
//     currentlyMovingEnemy.hasFired = true
//     killEnemyHighlight()
//   }
// }

// function enemyTargetCheck(highlightSprite) {
//   game.physics.arcade.overlap(highlightSprite, playerSquad, this.enemySpriteTint, null, this)
//   game.time.events.add(Phaser.Timer.SECOND * .2, enemyResolveTargetNotFound, this)
// }

// function enemySpriteTint(highlightSprite) {
//   enemyTargetFound = true
//   highlightSprite.tint = 0xff2100
//   highlightSprite.alpha = .3
//   for(var i = 0, length1 = playerSquad.children.length; i < length1; i++){
//     let targetCandidate = playerSquad.children[i]
//     if(game.physics.arcade.overlap(targetCandidate, highlightSprite/*, this.enemyCombat, null, this*/)) {
//       enemyCombat(targetCandidate)
//     }
//   }
// }

// EnemyHighlight = function(game,x,y) {
//   Phaser.Sprite.call(this, game, x, y, 'highlight');
//   this.anchor.setTo(0.5, 0.5);
//   this.visible = true
//   this.alpha = .3
//   enemyHighlightGroup.add(this);
// };
// EnemyHighlight.prototype = Object.create(Phaser.Sprite.prototype);
// EnemyHighlight.prototype.constructor = EnemyHighlight;
