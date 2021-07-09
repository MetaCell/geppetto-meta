import { hexToRGBNormalized } from "../../threeDEngine/util";

const SELECTION_COLOR = { r: 0.8, g: 0.8, b: 0, a: 1 };


export function mapToCanvasData (data){
  return data.map(item => (
    {
      color: item.selected ? SELECTION_COLOR : item.color ? item.color : hexToRGBNormalized(GEPPETTO.Resources.COLORS.DEFAULT),
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
  const newDataInstancePaths = newData.map(entry => entry.instancePath)
  for (const si of selectedInstances) {
    if (!newDataInstancePaths.includes(si)){
      newData.push({
        instancePath: si,
        color: undefined, // todo: inherit from parent?
        selected: true
      })
    }
  }
  return newData
}