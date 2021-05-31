export function hasVisualType (instance){
  return instance.getVisualType() !== undefined || instance.getChildren().some(i => hasVisualType(i))
}