import { hexToRGBNormalized } from "./util";

export const selectionStrategies = Object.freeze(
  {
    "nearest": selectedMap => [Object.keys(selectedMap).reduce((selected, current) => selectedMap[current].distance < selectedMap[selected].distance ? current : selected)],
    "farthest": selectedMap => [Object.keys(selectedMap).reduce((selected, current) => selectedMap[current].distance > selectedMap[selected].distance ? current : selected)],
    "all": selectedMap => Object.keys(selectedMap)
  }
)

export class SelectionManager {
  constructor (config) {
    const { selectionStrategy, selectionColor } = config
    this.selectionStrategy = selectionStrategy
    this.selectionColor = selectionColor
    this.currentlySelected = {}
    this.previouslySelected = {}
  }

  handle (selectedMap, proxyInstances) {
    this.previouslySelected = {}
    const selectedMeshes = this.getSelectedMesh(selectedMap)
    for (const mesh of selectedMeshes){
      if (Object.keys(this.currentlySelected).includes(mesh)){
        this.previouslySelected[mesh] = {
          instancePath: mesh,
          color: this.currentlySelected[mesh].originalColor
        }
        delete this.currentlySelected[mesh]
      } else {
        let instanceColor = this._getOriginalColor(mesh, proxyInstances)
        const color = instanceColor !== undefined ? instanceColor : hexToRGBNormalized(GEPPETTO.Resources.COLORS.DEFAULT)
        this.currentlySelected[mesh] = {
          instancePath: mesh,
          color: this.selectionColor,
          originalColor: color
        }
      }
    }
  }
  
  _getOriginalColor (instancePath, proxyInstances){
    for (const pi of proxyInstances){
      if (pi.instancePath === instancePath){
        return pi.color
      }
    }
    return undefined
  }

  
  getSelectedMesh (selectedMap){
    return this.selectionStrategy(selectedMap)
  }
  
  getCurrentlySelectedMeshes (){
    return this.currentlySelected
  }

  getPreviouslySelectedMeshes (){
    return this.previouslySelected
  }
  
}

export function getNextProxyInstances (data, currentlySelected, previouslySelected){
  const selectedMeshes = Object.keys(currentlySelected)
  const meshesToAdd = Object.assign({}, currentlySelected)
  const previouslySelectedMeshes = Object.keys(previouslySelected)
  const newData = []
  for (const mesh of data){
    if (selectedMeshes.includes(mesh.instancePath)){
      newData.push(
        {
          instancePath: mesh.instancePath,
          color: currentlySelected[mesh.instancePath].color
        }
      )
      delete meshesToAdd[mesh]
    } else if (previouslySelectedMeshes.includes(mesh.instancePath)){
      newData.push(
        {
          instancePath: mesh.instancePath,
          color: previouslySelected[mesh.instancePath].color
        }
      )
    } else {
      newData.push(mesh)
    }
  }
  for (const meshToAdd in meshesToAdd){
    newData.push(
      {
        instancePath: meshToAdd,
        color: meshesToAdd[meshToAdd].color
      }
    )
  }
  return newData
}
