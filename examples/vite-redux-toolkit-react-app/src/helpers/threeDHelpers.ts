export function getFurthestIntersectedObject(event) {
  if (!event.intersections || event.intersections.length === 0) {
    return null;
  }
  
  // TODO: Replace the following with the concept of raycasting layers
  const validIntersections = event.intersections.filter(intersection => intersection.object.userData.id !== undefined);
  
  const sortedIntersections = validIntersections.sort((a, b) => b.distance - a.distance);
  
  return sortedIntersections[0].object;
}