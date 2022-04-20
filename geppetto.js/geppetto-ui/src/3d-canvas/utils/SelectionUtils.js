import { hexToRGBNormalized } from "@metacell/geppetto-meta-ui/3d-canvas/threeDEngine/util";

const SELECTION_COLOR = { r: 0.8, g: 0.8, b: 0, a: 1 };


export function mapToCanvasData (data){
  return data.map(item => (
    {
      color: item.selected ? SELECTION_COLOR : item.color,
      instancePath: item.instancePath
    }
  ))
}

export function applySelection (data, selectedInstances) {
  const smap = new Map(selectedInstances.map(i => [i, true]))
  const newData = data.map(item => {
    if (smap.get(item.instancePath)){
      return {
        ...item,
        selected: !item.selected
      }
    }
    return { ...item }
  })
  const dmap = new Map(newData.map(i => [i.instancePath, true]))

  smap.forEach((value, key) => {
    if (!dmap.get(key)){
      newData.push({
        instancePath: key,
        color: undefined,
        selected: true
      })
    }
  })
  return newData
}