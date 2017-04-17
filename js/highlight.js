/**************************************
                Player
**************************************/
// highlights hexes in range of unit
function highlightRange(cubeRange, nextAction) {
  // adds highlight group
  highlightGroup = game.add.group()
  // sets offset
  highlightGroup.x = hexagonGroup.x
  highlightGroup.y = hexagonGroup.y
  // sets layer above map layer
  highlightGroup.z = 1
  // sets targetFound variable to default at false
  targetFound = false
  // loops through hexes in range
  for(var i = 0, length1 = cubeRange.length; i < length1; i++){
    // sets up position to place highlighted hex
    let currentHex = cubeToOffset(cubeRange[i].x, cubeRange[i].z)
    let startX = hexToPixelX(currentHex.col)
    let startY = hexToPixelY(currentHex.col,currentHex.row)
    // instantiates highlight sprite
    new Highlight(game, startX, startY)
    // allows highlight hex to accept input
    highlightGroup.children[i].inputEnabled = true
    // enables physics to work on new hex, this allows a check to see if there is overlap with another physics body
    game.physics.enable(highlightGroup.children[i], Phaser.Physics.ARCADE)
    highlightGroup.children[i].body.setSize(32, 32, 0, 0)
    // checks to see if next action being taken is movement or firing
    if (nextAction === 'move') {
      highlightGroup.children[i].events.onInputDown.add(checkHex, highlightGroup.children[i])
    } else if (nextAction === 'fire') {
      targetCheck(highlightGroup.children[i])
    }
  }
}

// turns off highlight hexes
function killHighlight() {
  for(let i = 0, length1 = highlightGroup.children.length; i < length1; i++){
    highlightGroup.children[i].visible = false
  }
  highlightGroup.children = []
}

// tints highlight hexes red
function spriteTint(highlightSprite) {
  targetFound = true
  highlightSprite.tint = 0xff2100
  highlightSprite.alpha = .3
  // loops over enemy squad and checks to see if they are within highlighted hexes
  for(let i = 0, length1 = enemySquad.children.length; i < length1; i++){
    let targetCandidate = enemySquad.children[i]
    // phaser method checks if 2 physics bodies overlap
    game.physics.arcade.overlap(targetCandidate, highlightSprite, this.targetEnable, null, this)
  }
}

// checks to see if enemy units are within highlight hexes
function targetCheck(highlightSprite) {
  game.physics.arcade.overlap(highlightSprite, enemySquad, this.spriteTint, null, this)
  // waits .5 seconds to hide highlights (mostly for UX, seems weird when highlight hexes disappear immediately)
  game.time.events.add(Phaser.Timer.SECOND * .5, resolveTargetNotFound, this)
}

// sets up highlight prototype
Highlight = function(game,x,y) {
  Phaser.Sprite.call(this, game, x, y, 'highlight');
  this.anchor.setTo(0.5, 0.5);
  this.visible = true
  this.alpha = .3
  highlightGroup.add(this);
};
Highlight.prototype = Object.create(Phaser.Sprite.prototype);
Highlight.prototype.constructor = Highlight;

// if no target found
function resolveTargetNotFound() {
  if (targetFound === false) {
    // sets hasFired property of sprite to true
    currentSprite.hasFired = true
    // turns off highlight hexes
    killHighlight()
    // turns click listener on player units back on
    enablePlayerMoves()
    // checks to see if player turn is over
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
