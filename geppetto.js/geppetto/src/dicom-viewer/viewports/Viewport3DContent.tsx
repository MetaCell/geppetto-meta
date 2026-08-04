import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useViewport3D } from "./useViewport3D";
import { useViewportEvents } from "../hooks/useViewportEvents";
import { useDicomViewerContext } from "../DicomViewerContext";
import { ClickAction, HoverAction } from "../types";
import { useFirstFrameFlag } from "./useFirstFrameFlag";

interface Viewport3DContentProps {
  stack: any | null;
  domRef: React.RefObject<HTMLElement>;
  animationSkipRate: number;
  onReady?: (scene: any, camera: any) => void;
  // Fires once the first real WebGL frame for this viewport has been painted
  onFirstFrame?: () => void;
  onClick?: ClickAction;
  onCtrlClick?: ClickAction;
  onShiftClick?: ClickAction;
  onDoubleClick?: ClickAction;
  onRightClick?: ClickAction;
  onHover?: HoverAction;
}

export const Viewport3DContent: React.FC<Viewport3DContentProps> = ({
  stack,
  domRef,
  animationSkipRate,
  onReady,
  onFirstFrame,
  onClick,
  onCtrlClick,
  onShiftClick,
  onDoubleClick,
  onRightClick,
  onHover,
}) => {
  const { size, gl, invalidate } = useThree();
  const handle = useViewport3D(stack, domRef);
  const ctx = useDicomViewerContext();
  const markFirstFrame = useFirstFrameFlag(handle, onFirstFrame);

  useViewportEvents({
    domRef,
    planeOrientation: "3d",
    camera: handle?.camera ?? null,
    scene: handle?.scene ?? null,
    onClick,
    onCtrlClick,
    onShiftClick,
    onDoubleClick,
    onRightClick,
    onHover,
  });
  const frameCount = useRef(0);
  const readyFired = useRef(false);

  // Register the 3D scene in context and fire onReady once the handle is live.
  useEffect(() => {
    if (!handle) return;
    ctx.registerViewportScene("3d", handle.scene);
    if (!readyFired.current) {
      onReady?.(handle.scene, handle.camera);
      readyFired.current = true;
    }
    invalidate();
  }, [handle]);

  /*
   * Invalidate from DOM pointer/wheel events so dragging bootstraps the render
   * loop before controls.update() has a chance to run inside useFrame.
   * (AMI's TrackballControl fires 'change' from within update(), which is called
   * from useFrame — so listening to controls 'change' doesn't help; we must
   * trigger the first frame from the raw DOM events instead.)
   */
  useEffect(() => {
    const el = domRef.current;
    if (!el || !handle) return undefined;
    let pressed = false;
    const onDown = () => {
      pressed = true;
      invalidate();
    };
    const onMove = () => {
      if (pressed) invalidate();
    };
    const onUp = () => {
      pressed = false;
    };
    const onWheel = () => invalidate(); // zoom
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [handle, domRef.current, invalidate]);

  /*
   * Invalidate after React commits a threshold change so useFrame sees the
   * updated values.  StoreInvalidator fires before React re-renders (wrong
   * timing); useEffect fires after commit (correct timing).
   */
  useEffect(() => {
    invalidate();
  }, [ctx.threshold3D, ctx.threshold3DEnabled]);

  // Sync camera aspect on resize using the tracking div's actual bounds.
  useEffect(() => {
    if (!handle || !domRef.current) return;
    const rect = domRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      handle.camera.aspect = rect.width / rect.height;
      handle.camera.updateProjectionMatrix();
      handle.controls.handleResize?.();
      invalidate();
    }
  }, [size, handle]);

  useFrame(() => {
    if (!handle || !domRef.current) return;

    frameCount.current = (frameCount.current + 1) % animationSkipRate;
    if (frameCount.current !== 0) return;

    handle.controls.update();

    // Light follows camera for depth cues
    const light = handle.scene.children.find((c: any) => c.isDirectionalLight);
    if (light) light.position.copy(handle.camera.position);

    // --- Scissored render for the 3D viewport ---
    const rect = domRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const canvas = gl.domElement;
    const canvasRect = canvas.getBoundingClientRect();
    const dpr = gl.getPixelRatio();

    const x = Math.round((rect.left - canvasRect.left) * dpr);
    const y = Math.round((canvasRect.bottom - rect.bottom) * dpr);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);

    gl.setScissor(x, y, w, h);
    gl.setScissorTest(true);
    gl.setViewport(x, y, w, h);

    // --- 3D transparency threshold ---
    interface PatchedUniform {
      mat: THREE.ShaderMaterial;
      savedLower: number;
    }
    const patched: PatchedUniform[] = [];
    const threshold3D = ctx.threshold3D;
    if (ctx.threshold3DEnabled && threshold3D > 0) {
      const minVal: number = ctx.stack?._minMax?.[0] ?? ctx.stack?.minMax?.[0] ?? 0;
      const amiOffset = minVal < 0 ? -minVal : 0;
      const uniformThreshold = amiOffset + threshold3D;
      handle.scene.traverse((obj: any) => {
        if (!obj.isMesh) return;
        const mat: any = obj.material;
        if (!mat?.uniforms?.uLowerUpperThreshold) return;
        const savedLower: number = mat.uniforms.uLowerUpperThreshold.value[0];
        if (uniformThreshold > savedLower) {
          patched.push({ mat, savedLower });
          mat.uniforms.uLowerUpperThreshold.value[0] = uniformThreshold;
        }
      });
    }

    /*
     * The axial/sagittal/coronal scenes are nested inside this 3D scene so
     * their slice planes render here too, but that also drags in anything
     * DicomOverlay portaled into those 2D scenes, even overlays whose
     * `viewports` prop excludes "3d". Hide those nested copies for this
     * render only: an overlay that DOES want 3D inclusion already has its
     * own dedicated portal directly into this scene (untouched here, since
     * it isn't nested inside one of the three 2D scenes below).
     */
    const hiddenOverlayRoots: THREE.Object3D[] = [];
    [ctx.viewportScenes.axial, ctx.viewportScenes.sagittal, ctx.viewportScenes.coronal].forEach(
      scene2d => {
        scene2d?.children.forEach(child => {
          if (child.userData.isDicomOverlayPortal && child.visible) {
            child.visible = false;
            hiddenOverlayRoots.push(child);
          }
        });
      },
    );

    gl.render(handle.scene, handle.camera);

    hiddenOverlayRoots.forEach(obj => {
      obj.visible = true;
    });

    patched.forEach(({ mat, savedLower }) => {
      mat.uniforms.uLowerUpperThreshold.value[0] = savedLower;
    });

    gl.setScissorTest(false);
    gl.setViewport(0, 0, Math.round(canvasRect.width * dpr), Math.round(canvasRect.height * dpr));

    markFirstFrame();
  }, 1);

  return null;
};
