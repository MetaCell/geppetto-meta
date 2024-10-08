import { FC } from "react";
import { BufferGeometry, DoubleSide, NormalBlending } from "three";

interface Props {
  stl: BufferGeometry;
  id: string;
  color: string;
  opacity: number;
  renderOrder: number;
  isWireframe: boolean;
}

const STLMesh: FC<Props> = ({ id, color, opacity, renderOrder, isWireframe, stl }) => {
  
  return (
    <mesh userData={{ id }} frustumCulled={false} renderOrder={renderOrder}>
      <primitive attach="geometry" object={stl} />
      <meshStandardMaterial color={color}
                            opacity={opacity}
                            side={DoubleSide}
                            depthWrite={false}
                            depthTest={false}
                            blending={NormalBlending}
                            wireframe={isWireframe}
                            transparent
      />
    </mesh>
  );
};


export default STLMesh;