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
  game.stage.backgroundColor = "#b3c2d8"
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
        let hexagon = game.add.sprite(hexagonX,hexagonY,"hexagon");
        hexagonGroup.add(hexagon);
      }
    }
  }


  // positions hexagonGroup
  hexagonGroup.y = groupOffset.y
  hexagonGroup.x = groupOffset.x
  //gives same position to playerSquad and enemySquad groups
  playerSquad.x = groupOffset.x
  playerSquad.y = groupOffset.y
  enemySquad.x = groupOffset.x
  enemySquad.y = groupOffset.y


  let worldWidth = hexagonWidth * gridSizeX - 100
  let worldHeight = (hexagonHeight * gridSizeY)/1.75
  this.game.world.setBounds(0, 0, worldWidth, worldHeight);


  addPlayerSquad()
  addEnemySquad()

  explosionSound = game.add.audio('mechExplosionSound');
  game.sound.setDecodedCallback(explosionSound, start, this);


  explosions = game.add.group();
  explosions.createMultiple(enemySquad.children.length, 'mechExplosion');
  explosions.forEach(setupExplosion, this);

  startPlayerTurn()

  drawHUD()

  // game.input.onDown.add(gofull, this);
  this.camera.flash('#000000', 2000);
}
