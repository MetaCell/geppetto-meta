import { useCallback } from "react";
import type { MutableRefObject } from "react";

interface PlaneLocalizerRef {
  stackHelper: any | null; // AMI StackHelper
  localizerHelper: any | null; // AMI LocalizerHelper
}

interface UseLocalizerSyncArgs {
  axial: PlaneLocalizerRef;
  sagittal: PlaneLocalizerRef;
  coronal: PlaneLocalizerRef;
}

export function initLocalizerCrossRefs(
  axial: PlaneLocalizerRef,
  sagittal: PlaneLocalizerRef,
  coronal: PlaneLocalizerRef,
): void {
  const links: Array<[PlaneLocalizerRef, PlaneLocalizerRef, PlaneLocalizerRef]> = [
    [axial, sagittal, coronal],
    [sagittal, axial, coronal],
    [coronal, axial, sagittal],
  ];

  links.forEach(([host, first, second]) => {
    if (!host.localizerHelper) return;
    if (first.stackHelper) {
      host.localizerHelper.plane1 = first.stackHelper.slice.cartesianEquation();
      host.localizerHelper.color1 = first.stackHelper.borderColor;
    }
    if (second.stackHelper) {
      host.localizerHelper.plane2 = second.stackHelper.slice.cartesianEquation();
      host.localizerHelper.color2 = second.stackHelper.borderColor;
    }
  });
}

export function useLocalizerSync(viewportsRef: MutableRefObject<UseLocalizerSyncArgs | null>) {
  const syncAll = useCallback(() => {
    const vp = viewportsRef.current;
    if (!vp) return;

    const { axial, sagittal, coronal } = vp;

    // 1. Update each plane's own reference equation
    [axial, sagittal, coronal].forEach(plane => {
      if (plane.stackHelper && plane.localizerHelper) {
        plane.localizerHelper.referencePlane = plane.stackHelper.slice.cartesianEquation();
      }
    });

    // 2. Re-wire cross-plane equations (axial → plane1=sagittal, plane2=coronal)
    if (axial.localizerHelper) {
      if (sagittal.stackHelper)
        axial.localizerHelper.plane1 = sagittal.stackHelper.slice.cartesianEquation();
      if (coronal.stackHelper)
        axial.localizerHelper.plane2 = coronal.stackHelper.slice.cartesianEquation();
    }
    // sagittal → plane1=axial, plane2=coronal
    if (sagittal.localizerHelper) {
      if (axial.stackHelper)
        sagittal.localizerHelper.plane1 = axial.stackHelper.slice.cartesianEquation();
      if (coronal.stackHelper)
        sagittal.localizerHelper.plane2 = coronal.stackHelper.slice.cartesianEquation();
    }
    // coronal → plane1=axial, plane2=sagittal
    if (coronal.localizerHelper) {
      if (axial.stackHelper)
        coronal.localizerHelper.plane1 = axial.stackHelper.slice.cartesianEquation();
      if (sagittal.stackHelper)
        coronal.localizerHelper.plane2 = sagittal.stackHelper.slice.cartesianEquation();
    }
  }, [viewportsRef]);

  return { syncAll };
}
