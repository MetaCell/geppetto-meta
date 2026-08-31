import { useEffect, useRef, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PlaneOrientation, ClickAction, HoverAction } from "../types";
import { useDicomViewerContext } from "../DicomViewerContext";

interface UseViewportEventsArgs {
  domRef: React.RefObject<HTMLElement>;
  planeOrientation: PlaneOrientation | "3d";
  camera: THREE.Camera | null;
  scene: THREE.Scene | null;
  onClick?: ClickAction;
  onCtrlClick?: ClickAction;
  onShiftClick?: ClickAction;
  onDoubleClick?: ClickAction;
  onRightClick?: ClickAction;
  onHover?: HoverAction;
}

// Drag threshold in pixels — pointer motion beyond this suppresses click events
const DRAG_THRESHOLD = 4;

function pickPoint(
  event: MouseEvent,
  domEl: HTMLElement,
  camera: THREE.Camera,
  scene: THREE.Scene,
): THREE.Vector3 | null {
  const rect = domEl.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  return hits.length > 0 ? hits[0].point : null;
}

export function useViewportEvents({
  domRef,
  planeOrientation,
  camera,
  scene,
  onClick,
  onCtrlClick,
  onShiftClick,
  onDoubleClick,
  onRightClick,
  onHover,
}: UseViewportEventsArgs) {
  const ctx = useDicomViewerContext();
  const { invalidate } = useThree();
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  const goToPoint = useCallback(
    (point: THREE.Vector3) => {
      ctx.centerOnPoint(point);
      // Also switch to the clicked plane in single_view mode
      if (ctx.viewMode === "single_view" && planeOrientation !== "3d") {
        ctx.setOrientation(planeOrientation);
      }
    },
    [ctx, planeOrientation],
  );

  const expandView = useCallback(() => {
    if (ctx.viewMode === "quad_view") {
      ctx.setOrientation(planeOrientation as any);
      ctx.setViewMode("single_view");
    } else {
      ctx.setViewMode("quad_view");
    }
  }, [ctx, planeOrientation]);

  const dispatch = useCallback(
    (action: ClickAction, event: MouseEvent) => {
      if (!camera || !scene || !domRef.current) return;
      const point = pickPoint(event, domRef.current, camera, scene);
      if (typeof action === "string") {
        if (action === "goToPoint" && point) goToPoint(point);
        else if (action === "expandView") expandView();
      } else if (point) {
        action(ctx, point, event, planeOrientation);
      }
      invalidate();
    },
    [camera, scene, domRef, ctx, goToPoint, expandView, invalidate, planeOrientation],
  );

  useEffect(() => {
    const el = domRef.current;
    if (!el) return undefined;

    let hoverRaf: number | null = null;
    let latestHoverEvent: MouseEvent | null = null;

    const onMouseDown = (e: MouseEvent) => {
      mouseDownPos.current = { x: e.clientX, y: e.clientY };
      isDragging.current = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (mouseDownPos.current) {
        const dx = e.clientX - mouseDownPos.current.x;
        const dy = e.clientY - mouseDownPos.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
          isDragging.current = true;
        }
      }

      if (!onHover || !camera || !scene) return;
      latestHoverEvent = e;
      if (hoverRaf !== null) return;
      hoverRaf = requestAnimationFrame(() => {
        hoverRaf = null;
        const point = pickPoint(latestHoverEvent as MouseEvent, el, camera, scene);
        onHover(ctx, point, planeOrientation);
        invalidate();
      });
    };

    const onMouseUp = () => {
      mouseDownPos.current = null;
    };

    const onMouseLeave = () => {
      onHover?.(ctx, null, planeOrientation);
      invalidate();
    };

    const onClickHandler = (e: MouseEvent) => {
      if (isDragging.current) return;
      if (e.ctrlKey || e.metaKey) {
        if (onCtrlClick) dispatch(onCtrlClick, e);
      } else if (e.shiftKey) {
        if (onShiftClick) dispatch(onShiftClick, e);
      } else {
        if (onClick) dispatch(onClick, e);
      }
    };

    const onDblClick = (e: MouseEvent) => {
      if (onDoubleClick) dispatch(onDoubleClick, e);
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (onRightClick) dispatch(onRightClick, e);
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("click", onClickHandler);
    el.addEventListener("dblclick", onDblClick);
    el.addEventListener("contextmenu", onContextMenu);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("click", onClickHandler);
      el.removeEventListener("dblclick", onDblClick);
      el.removeEventListener("contextmenu", onContextMenu);
      if (hoverRaf !== null) cancelAnimationFrame(hoverRaf);
    };
  }, [
    domRef.current,
    dispatch,
    onClick,
    onCtrlClick,
    onShiftClick,
    onDoubleClick,
    onRightClick,
    onHover,
    camera,
    scene,
    ctx,
    planeOrientation,
    invalidate,
  ]);
}
