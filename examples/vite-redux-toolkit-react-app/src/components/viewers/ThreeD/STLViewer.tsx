import { FC } from "react";
import { Center } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { BufferGeometry } from 'three';
import { Instance } from "./ThreeDViewer.tsx";
import STLMesh from "./STLMesh.tsx";

interface Props {
  instances: Instance[];
  isWireframe: boolean;
}

const STLViewer: FC<Props> = ({ instances, isWireframe }) => {
  // TODO: Check if useLoader caches or do we need to do it ourselves
  // @ts-expect-error Argument type STLLoader is not assignable to parameter type LoaderProto<T>
  const stlObjects = useLoader<STLLoader, BufferGeometry[]>(STLLoader, instances.map(i => i.url));
  
  return (
    <Center>
      <group frustumCulled={false}>
        {stlObjects.map((stl, idx) => (
          <STLMesh
            key={instances[idx].id}
            id={instances[idx].id}
            // @ts-expect-error Type 'ConditionalType<LoaderReturnType<T, L>, GLTFLike, LoaderReturnType<T, L> & ObjectMap, LoaderReturnType<T, L>>' is not assignable to type 'BufferGeometry<NormalBufferAttributes>'.
            stl={stl}
            opacity={instances[idx].opacity}
            color={instances[idx].color}
            renderOrder={idx}
            isWireframe={isWireframe}
          />
        ))}
      </group>
    </Center>
  );
};

export default STLViewer;