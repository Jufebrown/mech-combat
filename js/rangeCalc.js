function rangeCalc(startCubePosition, nRange) {
  let rangeResults = []
  let xMin = startCubePosition.x-nRange
  let xMax = startCubePosition.x+nRange
  let yMin = startCubePosition.y-nRange
  let yMax = startCubePosition.y+nRange
  let zMin = startCubePosition.z-nRange
  let zMax = startCubePosition.z+nRange
  let i = 0
  for (let x = xMin; x <= xMax; x++) {
    for (let y = Math.max(yMin, -x-zMax); y <= Math.min(yMax, -x-zMin); y++) {
        var z = -x-y;
        rangeResults[i] = {x: x, y: y, z: z,};
        i++
    }
  }
  return rangeResults
}
