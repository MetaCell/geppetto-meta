import * as THREE from "three";
import { PlaneOrientation } from "./types";

/*
 * Extracts the IJK component that corresponds to a given ami.js
 * camera.stackOrientation. Per ami.js conventions:
 *   stackOrientation 0 -> directions[2] (zCosine, K axis -> ijk.z)
 *   stackOrientation 1 -> directions[0] (xCosine, I axis -> ijk.x)
 *   stackOrientation 2 -> directions[1] (yCosine, J axis -> ijk.y)
 */
function ijkComponentForStackOrientation(ijk: THREE.Vector3, stackOrientation: number): number {
  if (stackOrientation === 0) return ijk.z;
  if (stackOrientation === 1) return ijk.x;
  return ijk.y;
}

/*
 * Converts a world (LPS) point to IJK via the stack's lps2IJK matrix and sets
 * all 3 plane slice indices to center on it.
 *
 * planeStackOrientations carries each plane's actual camera.stackOrientation
 * (see Viewport2DContent.tsx), since which IJK axis maps to which plane
 * depends on the volume's acquisition orientation, not a fixed assignment —
 * assuming axial/sagittal/coronal always map to z/x/y is only correct for
 * axially-acquired volumes.
 */
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

/*
 * Maps an ami.js camera.stackOrientation to the ijk2LPS column index for that
 * plane's normal — the same stackOrientation -> axis convention as
 * ijkComponentForStackOrientation above, applied to matrix columns instead of
 * vector components: stackOrientation 0 -> K axis (col 2), 1 -> I axis (col 0),
 * 2 -> J axis (col 1).
 */
export function soToCol(stackOrientation: number): 0 | 1 | 2 {
  if (stackOrientation === 0) return 2;
  if (stackOrientation === 1) return 0;
  return 1;
}

export type PlaneFilter = ((lpsX: number, lpsY: number, lpsZ: number) => boolean) | null;

/*
 * Returns a predicate testing whether an LPS point lies within `tolerance` of the
 * slice plane defined by ijk2LPS column `col` at index `sliceIdx`. Generic spatial
 * filter for any overlay that needs "show this marker only on the currently
 * displayed slice" — pass a tolerance matching the rendered marker's radius so the
 * visual clipping lines up with the spatial filter.
 */
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
