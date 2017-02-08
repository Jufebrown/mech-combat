/****************************************************
This is a turn-based strategy game that uses a hex grid
map. The map uses odd-q offset coodinates
****************************************************/



// Initialize Firebase
const config = {
  apiKey: "AIzaSyDnjSA0d_UhYUHmmLft9EV8pWtf14Dqgd8",
  authDomain: "mech-combat.firebaseapp.com",
  databaseURL: "https://mech-combat.firebaseio.com",
  storageBucket: "mech-combat.appspot.com",
  messagingSenderId: "898287259769"
};

firebase.initializeApp(config);




window.onload = function() {

  //starts new canvas
  const game = new Phaser.Game(640, 480, Phaser.CANVAS, "", {preload: onPreload, create: onCreate,});


  //sets up hex width and height. height should be sqrt(3)/2 of width but need to tweek to get spacing right
  const hexagonHeight = 32;
  const hexagonWidth = 34;
  //number of hexes x and y
  const gridSizeX = 24;
  const gridSizeY = 29;

  //for mouse position tracking
  const columns = [Math.ceil(gridSizeY/2),Math.floor(gridSizeY/2)];
  var moveIndex;
  var sectorWidth = hexagonWidth/4*3;
  var sectorHeight = hexagonHeight;
  var gradient = (hexagonWidth/4)/(hexagonHeight/2);

  // var marker;
  var hexagonGroup;
  var playerSquad
  var player
  var enemy
  var playerStartX = 10
  var playerStartY = 13
  var enemyStartX = 10
  var enemyStartY = 0
  var tween;

  //preloads images
  function onPreload() {
    game.load.image("hexagon", "images/hexagon.png");
    // game.load.image("marker", "images/marker.png");
    game.load.image("player", "images/player_ph.png")
    game.load.image("enemy", "images/enemy_ph.png")
  }

  function onCreate() {
    // adds hexagonGroup
    hexagonGroup = game.add.group();
    playerSquad = game.add.group()

    //background color for whole canvas element
    game.stage.backgroundColor = "#ddd"
    game.physics.startSystem(Phaser.Physics.ARCADE);


    // loops through and adds rows and columns of hexes to hexagonGroup
    for(var i = 0; i < gridSizeX/2; i ++) {
      for(var j = 0; j < gridSizeY; j ++) {
        if(gridSizeX%2==0 || i+1<gridSizeX/2 || j%2==0){
          //x position for hex group
          var hexagonX = hexagonWidth*i*1.5+(hexagonWidth/4*3)*(j%2);
          //y position for hex group
          var hexagonY = hexagonHeight*j/2;
          var hexagon = game.add.sprite(hexagonX,hexagonY,"hexagon");
          hexagonGroup.add(hexagon);
        }
      }
    }

    // positions hexagonGroup
    hexagonGroup.y = (game.height-hexagonHeight*Math.ceil(gridSizeY/2))/2;
    if(gridSizeY%2==0){
      hexagonGroup.y-=hexagonHeight/4;
    }
    hexagonGroup.x = (game.width-Math.ceil(gridSizeX/2)*hexagonWidth-Math.floor(gridSizeX/2)*hexagonWidth/2)/2;
    if(gridSizeX%2==0){
      hexagonGroup.x-=hexagonWidth/8;
    }

    //adds player
    // player = game.add.sprite(0,0,"player");
    // player.anchor.setTo(0.5375, .5);
    // player.visible = true;
    // player.x = hexToPixelX(playerStartX)
    // player.y = hexToPixelY(playerStartX,playerStartY)
    // hexagonGroup.add(player);
    addPlayerSquad()
    playerSquad.x = hexagonGroup.x
    playerSquad.y = hexagonGroup.y
    game.input.onDown.add(checkHex, this); //listens for mouse clicks

    //adds enemy
     //adds player
    enemy = game.add.sprite(0,0,"enemy");
    enemy.anchor.setTo(0.5375, .5);
    enemy.visible = true;
    enemy.x = hexToPixelX(enemyStartX)
    enemy.y = hexToPixelY(enemyStartX,enemyStartY)
    hexagonGroup.add(enemy);

    //adds marker and hides it
    // marker = game.add.sprite(0,0,"marker");
    // marker.anchor.setTo(0.5);
    // marker.visible=false;
    // hexagonGroup.add(marker); //adds marker to hexagonGroup
    // moveIndex = game.input.addMoveCallback(checkHex, this); //listener for mouse move
  }

  function addPlayerSquad() {
    let playerSquadArray = [
      {positionX: 10, positionY: 13},
      {positionX: 4, positionY: 13},
      {positionX: 18, positionY: 13}
      ]

    for(var i = 0, length1 = playerSquadArray.length; i < length1; i++){
      let squaddie = game.add.sprite(0,0,"player");
      squaddie.anchor.setTo(0.5375, .5);
      squaddie.visible = true;
      squaddie.x = hexToPixelX(playerSquadArray[i].positionX)
      squaddie.y = hexToPixelY(playerSquadArray[i].positionX,playerSquadArray[i].positionY)
      playerSquad.add(squaddie);
    }
  }

  //checks to see what hex the mouse pointer is over
  function checkHex(){
    var candidateX = Math.floor((game.input.worldX-hexagonGroup.x)/sectorWidth);
    var candidateY = Math.floor((game.input.worldY-hexagonGroup.y)/sectorHeight);
    var deltaX = (game.input.worldX-hexagonGroup.x)%sectorWidth;
    var deltaY = (game.input.worldY-hexagonGroup.y)%sectorHeight;
    if(candidateX%2==0){
      if(deltaX<((hexagonWidth/4)-deltaY*gradient)){
        candidateX--;
        candidateY--;
        // console.log('candidateY', candidateY)
      }
      if(deltaX<((-hexagonWidth/4)+deltaY*gradient)){
        candidateX--;
      }
    } else {
      if(deltaY>=hexagonHeight/2) {
        if(deltaX<(hexagonWidth/2-deltaY*gradient)){
          candidateX--;
        }
      } else {
        if(deltaX<deltaY*gradient){
          candidateX--;
        } else {
          candidateY--;
        }
      }
    }
    // placeMarker(candidateX,candidateY);
    moveSprite (candidateX,candidateY)
  }


  function hexToPixelX(posX) {
    let pixelX = hexagonWidth/4*3*posX+hexagonWidth/2;
    return pixelX
  }

  function hexToPixelY(posX, posY) {
    let pixelY = hexagonHeight*posY;
    if(posX%2==0){
      pixelY += hexagonHeight/2;
    }
    else{
      pixelY += hexagonHeight;
    }
    return pixelY
  }


  //moves sprite to specified hex
  function moveSprite (posX,posY) {
    // if (tween && tween.isRunning) {
    //   tween.stop();
    // }

    let endX = hexToPixelX(posX)
    let endY = hexToPixelY(posX,posY)

    // player.rotation = game.physics.arcade.angleToPointer(player, pointer);

    //  300 = 300 pixels per second = the speed the sprite will move at, regardless of the distance it has to travel
    var duration = 1000 //(game.physics.arcade.distanceToPointer(player, pointer) / 300) * 1000;
    tween = game.add.tween(player).to({ x: endX, y: endY }, duration, Phaser.Easing.Linear.None, true);
  }

  // function placeMarker(posX,posY,pointer){
  //   if(posX<0 || posY<0 || posX>=gridSizeX || posY>columns[posX%2]-1){
  //     marker.visible=false;
  //   }
  //   else{
  //     marker.visible=true;
  //     marker.x = hexagonWidth/4*3*posX+hexagonWidth/2;
  //     marker.y = hexagonHeight*posY;
  //     if(posX%2==0){
  //       marker.y += hexagonHeight/2;
  //     }
  //     else{
  //       marker.y += hexagonHeight;
  //     }
  //   }
  // }
}
