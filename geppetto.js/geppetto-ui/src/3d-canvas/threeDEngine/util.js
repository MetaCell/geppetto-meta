export function hasVisualType (instance){
  return instance.getVisualType() !== undefined || instance.getChildren().some(i => hasVisualType(i))
}

export function hasVisualValue (instance) {
  try {
    return instance.hasVisualValue()
  } catch (e) {
    return false
  }
}

export function hexToRGBNormalized (hex){
  const rgb = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
    ,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16) / 255)
  return { r: rgb[0], g: rgb[1], b: rgb[2], a: 1 }
}