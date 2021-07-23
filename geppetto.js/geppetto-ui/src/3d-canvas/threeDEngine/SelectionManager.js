
export const selectionStrategies = Object.freeze(
  {
    "nearest": selectedMap => [Object.keys(selectedMap).reduce((selected, current) => selectedMap[current].distance < selectedMap[selected].distance ? current : selected)],
    "farthest": selectedMap => [Object.keys(selectedMap).reduce((selected, current) => selectedMap[current].distance > selectedMap[selected].distance ? current : selected)],
    "all": selectedMap => Object.keys(selectedMap)
  }
)

  