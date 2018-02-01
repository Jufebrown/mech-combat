'use strict';

module.exports = function() {
  function cubeToOffset(x,z) {
    let offsetCoordinates = {}
    offsetCoordinates.col = x
    offsetCoordinates.row = z + (x - (x&1)) / 2
    return offsetCoordinates
  }
  
  function offsetToCube (col, row) {
    let cubeCoordinates = {}
    cubeCoordinates.x = col
    cubeCoordinates.z = row - (col - (col&1)) / 2
    cubeCoordinates.y = -cubeCoordinates.x-cubeCoordinates.z
    return cubeCoordinates
  }
}
