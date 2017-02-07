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
  var game = new Phaser.Game(640, 480, Phaser.CANVAS, "", {preload: onPreload, create: onCreate});

  //sets up hex width and height. height is sqrt(3)/2 of width
  var hexagonHeight = 32;
  var hexagonWidth = ((2/Math.sqrt(3)) * hexagonHeight);
  var gridSizeX = 22;
  var gridSizeY = 28;
  var columns = [Math.ceil(gridSizeY/2),Math.floor(gridSizeY/2)];
  var moveIndex;
  var sectorWidth = hexagonWidth/4*3;
  var sectorHeight = hexagonHeight;
  var gradient = (hexagonWidth/4)/(hexagonHeight/2);
  var marker;
  var hexagonGroup;

  //preloads images
  function onPreload() {
    game.load.image("hexagon", "images/hexagon.png");
    game.load.image("marker", "images/marker.png");
  }


  function onCreate() {
    hexagonGroup = game.add.group();
    game.stage.backgroundColor = "#ddd"
    for(var i = 0; i < gridSizeX/2; i ++){
      for(var j = 0; j < gridSizeY; j ++){
        if(gridSizeX%2==0 || i+1<gridSizeX/2 || j%2==0){
          var hexagonX = hexagonWidth*i*1.5+(hexagonWidth/4*3)*(j%2);
          var hexagonY = hexagonHeight*j/2;
          var hexagon = game.add.sprite(hexagonX,hexagonY,"hexagon");
          hexagonGroup.add(hexagon);
        }
      }
    }
    hexagonGroup.y = (game.height-hexagonHeight*Math.ceil(gridSizeY/2))/2;
      if(gridSizeY%2==0){
        hexagonGroup.y-=hexagonHeight/4;
      }
    hexagonGroup.x = (game.width-Math.ceil(gridSizeX/2)*hexagonWidth-Math.floor(gridSizeX/2)*hexagonWidth/2)/2;
    if(gridSizeX%2==0){
      hexagonGroup.x-=hexagonWidth/8;
    }
    marker = game.add.sprite(0,0,"marker");
    marker.anchor.setTo(0.5);
    marker.visible=false;
    hexagonGroup.add(marker);
    moveIndex = game.input.addMoveCallback(checkHex, this);
  }

  function checkHex(){
    var candidateX = Math.floor((game.input.worldX-hexagonGroup.x)/sectorWidth);
    var candidateY = Math.floor((game.input.worldY-hexagonGroup.y)/sectorHeight);
    var deltaX = (game.input.worldX-hexagonGroup.x)%sectorWidth;
    var deltaY = (game.input.worldY-hexagonGroup.y)%sectorHeight;
    if(candidateX%2==0){
      if(deltaX<((hexagonWidth/4)-deltaY*gradient)){
        candidateX--;
        candidateY--;
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
    placeMarker(candidateX,candidateY);
  }

  function placeMarker(posX,posY){
    if(posX<0 || posY<0 || posX>=gridSizeX || posY>columns[posX%2]-1){
      marker.visible=false;
    }
    else{
      marker.visible=true;
      marker.x = hexagonWidth/4*3*posX+hexagonWidth/2;
      marker.y = hexagonHeight*posY;
      if(posX%2==0){
        marker.y += hexagonHeight/2;
      }
      else{
        marker.y += hexagonHeight;
      }
    }
  }
}
