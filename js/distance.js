function cubeDistance(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z))
}

function offset_distance(a, b){
  let ac = offsetToCube(a)
  let bc = offsetToCube(b)
  return cubeDistance(ac, bc)
}
