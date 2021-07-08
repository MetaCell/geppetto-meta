
const SELECTION_COLOR = { r: 0.8, g: 0.8, b: 0, a: 1 };


export function dataMapping (data){
  return data.map(item => (
    {
      color: item.selected ? SELECTION_COLOR : item.color,
      instancePath: item.instancePath
    }
  ))
}

export function onSelection (selectedInstances) {
  const { data } = this.state
  const newData = []
  let newInstance = true
  for (const si of selectedInstances){
    for (const i of data){
      if (si === i.instancePath){
        newData.push({
          ...i,
          selected: !i.selected
        })
        newInstance = false
      } else {
        newData.push({ ...i, })
      }
    }
    if (newInstance){
      newData.push({
        instancePath: si,
        color: undefined, // todo: inherit from parent?
        selected: true
      })
    }
  }
  this.setState({ data: newData })
}