function onCreate() {

  this.game.kineticScrolling.start();
  // adds hexagonGroup
  hexagonGroup = game.add.group()
  hexagonGroup.z = 0
  playerSquad = game.add.group()
  playerSquad.z = 3
  enemySquad = game.add.group()
  enemySquad.z = 3

  //background color for whole canvas element
  game.stage.backgroundColor = "#515863"
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;


  // loops through and adds rows and columns of hexes to hexagonGroup
  for(let i = 0; i < gridSizeX/2; i ++) {
    for(let j = 0; j < gridSizeY; j ++) {
      if(gridSizeX%2==0 || i+1<gridSizeX/2 || j%2==0){
        //x position for hex group
        let hexagonX = hexagonWidth*i*1.5+(hexagonWidth/4*3)*(j%2);
        //y position for hex group
        let hexagonY = hexagonHeight*j/2;
        let hexagon = game.add.sprite(hexagonX,hexagonY,"grassland");
        hexagonGroup.add(hexagon);
      }
    }
  }

  let music = game.add.audio('alertMusic');
  music.play();

  // positions hexagonGroup
  hexagonGroup.y = groupOffset.y
  hexagonGroup.x = groupOffset.x
  //gives same position to playerSquad and enemySquad groups
  playerSquad.x = groupOffset.x
  playerSquad.y = groupOffset.y
  enemySquad.x = groupOffset.x
  enemySquad.y = groupOffset.y

  highlightGroup = game.add.group()
  highlightGroup.x = groupOffset.x
  highlightGroup.y = groupOffset.y
  highlightGroup.z = 1

  // enemyHighlightGroup = game.add.group()
  // enemyHighlightGroup.x = groupOffset.x
  // enemyHighlightGroup.y = groupOffset.y
  // enemyHighlightGroup.z = 1

  let worldWidth = ((hexagonWidth * 1.5) * (gridSizeX/2)) + 50
  let worldHeight = (hexagonHeight * gridSizeY)/2 + 50
  this.game.world.setBounds(0, 0, worldWidth, worldHeight);

  addPlayerSquad()
  addEnemySquad()

  explosionSound = game.add.audio('mechExplosionSound');
  game.sound.setDecodedCallback(explosionSound, start, this);

  explosions = game.add.group();
  explosions.x = groupOffset.x
  explosions.y = groupOffset.y
  let numExplosions = enemySquad.children.length + playerSquad.children.length
  explosions.createMultiple(numExplosions, 'mechExplosion');
  explosions.forEach(setupExplosion, this);

  let playerTurnText = game.add.text(300, 200, "Player Turn Start");
  playerTurnText.anchor.set(0.5);
  playerTurnText.align = 'center';
  playerTurnText.font = 'Arial';
  playerTurnText.fontSize = 40;
  playerTurnText.fill = '#ffffff';
  playerTurnText.fixedToCamera = true
  game.time.events.add(Phaser.Timer.SECOND * 1, startPlayerTurn, this, playerTurnText);

  drawHUD()

  // game.input.onDown.add(gofull, this);
  this.camera.flash('#000000', 2000);
}
