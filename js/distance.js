// gets distance between 2 hexes using cubic coordinates
function cubeDistance(a, b) {
  // console.log('a', a)
  // console.log('b', b)
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z))
}

// gets distance between 2 hexes using offset coordinates
function offset_distance(a, b){
  let ac = offsetToCube(a)
  let bc = offsetToCube(b)
  return cubeDistance(ac, bc)
}
