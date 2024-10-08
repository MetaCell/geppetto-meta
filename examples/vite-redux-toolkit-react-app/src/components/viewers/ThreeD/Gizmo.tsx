import {GizmoHelper, GizmoViewport} from "@react-three/drei";

function Gizmo() {
  return <GizmoHelper
    alignment="bottom-right"
    margin={[80, 80]}
  >
    <GizmoViewport axisColors={["red", "green", "blue"]} hideNegativeAxes hideAxisHeads/>
  </GizmoHelper>;
}

export default Gizmo;