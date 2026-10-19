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

/*
 * A non-canonical (e.g. soloMode) pane that mirrors another pane's crosshairs instead of computing
 * its own — keyed by pane id, since more than one such pane can share an orientation.
 */
interface MirrorTarget extends PlaneLocalizerRef {
  mirrorFrom?: string;
}
type MirrorTargetsMap = Record<string, MirrorTarget>;

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

// Copies a source pane's fully-computed localizer state onto a target sharing the same slice.
export function mirrorLocalizer(source: PlaneLocalizerRef, target: PlaneLocalizerRef): void {
  if (!target.localizerHelper || !source.localizerHelper) return;
  target.localizerHelper.referencePlane = source.localizerHelper.referencePlane;
  target.localizerHelper.plane1 = source.localizerHelper.plane1;
  target.localizerHelper.plane2 = source.localizerHelper.plane2;
  target.localizerHelper.color1 = source.localizerHelper.color1;
  target.localizerHelper.color2 = source.localizerHelper.color2;
}

export function useLocalizerSync(
  viewportsRef: MutableRefObject<UseLocalizerSyncArgs | null>,
  mirrorTargetsRef?: MutableRefObject<MirrorTargetsMap>,
) {
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

    // 2. Re-wire cross-plane equations — same host/first/second triangle as initLocalizerCrossRefs.
    const links: Array<[PlaneLocalizerRef, PlaneLocalizerRef, PlaneLocalizerRef]> = [
      [axial, sagittal, coronal],
      [sagittal, axial, coronal],
      [coronal, axial, sagittal],
    ];
    links.forEach(([host, first, second]) => {
      if (!host.localizerHelper) return;
      if (first.stackHelper) {
        host.localizerHelper.plane1 = first.stackHelper.slice.cartesianEquation();
      }
      if (second.stackHelper) {
        host.localizerHelper.plane2 = second.stackHelper.slice.cartesianEquation();
      }
    });

    // 3. Mirror the finished triangle onto any registered non-canonical targets (soloMode panes).
    const targets = mirrorTargetsRef?.current;
    if (targets) {
      Object.values(targets).forEach(target => {
        const source = target.mirrorFrom
          ? vp[target.mirrorFrom as keyof UseLocalizerSyncArgs]
          : undefined;
        if (source) mirrorLocalizer(source, target);
      });
    }
  }, [viewportsRef, mirrorTargetsRef]);

  return { syncAll };
}
