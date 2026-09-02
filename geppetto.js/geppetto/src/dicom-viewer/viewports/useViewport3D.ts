import { useEffect, useState } from "react";
import * as THREE from "three";
import { TrackballControl } from "@metacell/ami";

interface Viewport3DHandle {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: any; // AMI TrackballControl
  dispose: () => void;
}

export function useViewport3D(
  stack: any | null,
  domElementRef: React.RefObject<HTMLElement>,
): Viewport3DHandle | null {
  // useState so that Viewport3DContent re-renders when the handle is ready.
  const [handle, setHandle] = useState<Viewport3DHandle | null>(null);

  useEffect(() => {
    if (!stack || !domElementRef.current) return undefined;

    const domEl = domElementRef.current;

    const scene = new THREE.Scene();

    const aspect =
      domEl.clientWidth > 0 && domEl.clientHeight > 0 ? domEl.clientWidth / domEl.clientHeight : 1;

    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100000);

    const worldbb = stack.worldBoundingBox(); // [xmin,xmax,ymin,ymax,zmin,zmax]
    const center = stack.worldCenter();
    const diagonal = Math.sqrt(
      Math.pow(worldbb[1] - worldbb[0], 2) +
        Math.pow(worldbb[3] - worldbb[2], 2) +
        Math.pow(worldbb[5] - worldbb[4], 2),
    );
    const offset = diagonal === 0 ? 250 : diagonal;
    camera.position.set(center.x + offset * 0.7, center.y + offset * 0.7, center.z + offset * 0.7);

    const controls = new TrackballControl(camera, domEl);
    controls.rotateSpeed = 5.5;
    controls.zoomSpeed = 0.6;
    controls.panSpeed = 0.8;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.copy(camera.position);
    scene.add(light);

    // Ambient light so wireframe is visible even without directional light
    scene.add(new THREE.AmbientLight(0x404040, 2));

    const bbCenterX = (worldbb[0] + worldbb[1]) / 2;
    const bbCenterY = (worldbb[2] + worldbb[3]) / 2;
    const bbCenterZ = (worldbb[4] + worldbb[5]) / 2;
    const bbSizeX = Math.max(worldbb[1] - worldbb[0], 0.001);
    const bbSizeY = Math.max(worldbb[3] - worldbb[2], 0.001);
    const bbSizeZ = Math.max(worldbb[5] - worldbb[4], 0.001);

    const boxGeo = new THREE.BoxGeometry(bbSizeX, bbSizeY, bbSizeZ);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const bbox = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: 0xffffff }));
    bbox.position.set(bbCenterX, bbCenterY, bbCenterZ);
    scene.add(bbox);

    camera.lookAt(center.x, center.y, center.z);
    camera.updateProjectionMatrix();
    controls.target.set(center.x, center.y, center.z);

    const dispose = () => {
      controls.dispose?.();
      boxGeo.dispose();
      edgesGeo.dispose();
    };

    setHandle({ scene, camera, controls, dispose });

    return () => {
      dispose();
      setHandle(null);
    };
  }, [stack, domElementRef.current]);

  return handle;
}
