export const selectionStrategies = Object.freeze({
  "nearest": selectedMap => [Object.keys(selectedMap)
    .reduce((selected, current) => {
      if (!selected) {
        return current
      } else {
        return selectedMap[current].distance < selectedMap[selected].distance ? current : selected
      }
    }, null)].filter(s => s), "farthest": selectedMap => [Object.keys(selectedMap)
    .reduce((selected, current) => {
      if (!selected) {
        return current
      } else {
        return selectedMap[current].distance > selectedMap[selected].distance ? current : selected
      }
    }, null)].filter(s => s), "all": selectedMap => Object.keys(selectedMap)
})

  