import * as THREE from "three";
import { OrientationMode, PlaneOrientation } from "./types";

export const VP_ID_MAP: Record<OrientationMode, number> = {
  "3d": 0,
  axial: 1,
  sagittal: 2,
  coronal: 3,
};

function ijkComponentForStackOrientation(ijk: THREE.Vector3, stackOrientation: number): number {
  if (stackOrientation === 0) return ijk.z;
  if (stackOrientation === 1) return ijk.x;
  return ijk.y;
}

export function centerSlicesOnPoint(
  point: THREE.Vector3,
  stack: any,
  sliceMaxIndices: Record<PlaneOrientation, number>,
  planeStackOrientations: Record<PlaneOrientation, number>,
  setSliceIndex: (plane: PlaneOrientation, idx: number) => void,
): void {
  if (!stack) return;
  const ijk = point.clone().applyMatrix4(stack.lps2IJK);
  const planes: PlaneOrientation[] = ["axial", "sagittal", "coronal"];
  planes.forEach(plane => {
    const maxIdx = sliceMaxIndices[plane];
    const idx = Math.round(ijkComponentForStackOrientation(ijk, planeStackOrientations[plane]));
    const clamped = Math.max(0, Math.min(maxIdx, idx));
    setSliceIndex(plane, clamped);
  });
}

export function soToCol(stackOrientation: number): 0 | 1 | 2 {
  if (stackOrientation === 0) return 2;
  if (stackOrientation === 1) return 0;
  return 1;
}

export type PlaneFilter = ((lpsX: number, lpsY: number, lpsZ: number) => boolean) | null;

export function makePlaneFilter(
  stack: any,
  sliceIdx: number,
  col: 0 | 1 | 2,
  tolerance: number,
): PlaneFilter {
  if (!stack) return null;
  const m = stack.ijk2LPS.elements as number[];
  const nx = m[col * 4];
  const ny = m[col * 4 + 1];
  const nz = m[col * 4 + 2];
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len === 0) return null;
  const nnx = nx / len;
  const nny = ny / len;
  const nnz = nz / len;
  const origin = new THREE.Vector3(
    col === 0 ? sliceIdx : 0,
    col === 1 ? sliceIdx : 0,
    col === 2 ? sliceIdx : 0,
  ).applyMatrix4(stack.ijk2LPS);
  const d = -(nnx * origin.x + nny * origin.y + nnz * origin.z);
  return (lpsX, lpsY, lpsZ) => Math.abs(nnx * lpsX + nny * lpsY + nnz * lpsZ + d) <= tolerance;
}
