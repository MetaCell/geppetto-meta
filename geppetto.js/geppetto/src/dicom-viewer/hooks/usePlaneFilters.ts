import { useMemo } from "react";
import type { PlaneOrientation } from "../types";
import { makePlaneFilter, type PlaneFilter, soToCol } from "../utils";

const DEFAULT_STACK_ORIENTATIONS: Record<PlaneOrientation, number> = {
  axial: 0,
  sagittal: 1,
  coronal: 2,
};

export function usePlaneFilters(
  stack: any,
  sliceIndices: Record<PlaneOrientation, number>,
  planeStackOrientations: Partial<Record<PlaneOrientation, number>>,
  tolerance: number,
): Record<PlaneOrientation, PlaneFilter> {
  const axialSO = planeStackOrientations.axial ?? DEFAULT_STACK_ORIENTATIONS.axial;
  const sagittalSO = planeStackOrientations.sagittal ?? DEFAULT_STACK_ORIENTATIONS.sagittal;
  const coronalSO = planeStackOrientations.coronal ?? DEFAULT_STACK_ORIENTATIONS.coronal;

  return useMemo(
    () => ({
      axial: makePlaneFilter(stack, sliceIndices.axial, soToCol(axialSO), tolerance),
      sagittal: makePlaneFilter(stack, sliceIndices.sagittal, soToCol(sagittalSO), tolerance),
      coronal: makePlaneFilter(stack, sliceIndices.coronal, soToCol(coronalSO), tolerance),
    }),

    [
      stack,
      sliceIndices.axial,
      sliceIndices.sagittal,
      sliceIndices.coronal,
      axialSO,
      sagittalSO,
      coronalSO,
      tolerance,
    ],
  );
}
