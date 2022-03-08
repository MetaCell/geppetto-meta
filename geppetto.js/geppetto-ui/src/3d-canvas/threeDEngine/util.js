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

function componentToHex (c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

export function rgbToHex (r, g, b) {
  return '0X' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function sortInstances (proxyInstances) {
  let sortedInstances = [];
  sortedInstances = proxyInstances.sort((a, b) => {
    if (a.instancePath < b.instancePath) {
      return -1;
    }
    if (a.instancePath > b.instancePath) {
      return 1;
    }
    return 0;
  });
  return sortedInstances;
}

export function hasDifferentProxyInstances (data, prevData){
  data = sortInstances(data)
  prevData = sortInstances(prevData)
  // FIXME: attribute order matters in the comparation below but it provably shouldn't:
  return JSON.stringify(data) !== JSON.stringify(prevData)
}

export function hasDifferentThreeDObjects (threeDObjects, prevThreeDObjects){
  const threeDObjectsUUIDs = new Set(threeDObjects.map(obj => obj.uuid))
  const prevThreeDObjectsUUIDs = new Set(prevThreeDObjects.map(obj => obj.uuid))
  return !eqSet(threeDObjectsUUIDs, prevThreeDObjectsUUIDs)
}


function eqSet (as, bs) {
  if (as.size !== bs.size) {
    return false;
  }
  for (const a of as) {
    if (!bs.has(a)) {
      return false;
    }
  }
  return true;
}