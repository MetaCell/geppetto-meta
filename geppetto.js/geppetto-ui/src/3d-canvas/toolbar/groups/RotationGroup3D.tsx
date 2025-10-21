import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas3DRootState } from "../../Canvas3D";
import { Toolbar3DButton } from "../Toolbar3D";

interface RotationOptions {
  rotationSpeed?: number;
  manualStep?: number;
  cameraStep?: number;
}

interface RotationControls {
  horizontal: (fiber: Canvas3DRootState, direction: 1 | -1) => void;
  vertical: (fiber: Canvas3DRootState, direction: 1 | -1) => void;
}

const Animation3DControls: React.FC<{ rotationOptions?: RotationOptions }> = ({ rotationOptions = {
  rotationSpeed: 0.5,
  manualStep: 0.2,
  cameraStep: 0.1
} }) => {
  const { rotationSpeed, manualStep, cameraStep } = rotationOptions;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startAngleRef = useRef<number>(0);
  const currentFiberRef = useRef<Canvas3DRootState | null>(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handlePlay = (fiber: Canvas3DRootState) => {
    if (!fiber?.controls) {
      console.log("No camera controls available for animation");
      return;
    }

    currentFiberRef.current = fiber;
    setIsPlaying(true);
    setIsPaused(false);

    if (!isPaused) {
      startAngleRef.current = fiber.controls.azimuthAngle;
    }

    const animate = () => {
      if (currentFiberRef.current?.controls) {
        const currentTime = Date.now() * 0.001;
        const newAngle = startAngleRef.current + currentTime * rotationSpeed;

        currentFiberRef.current.controls.rotateTo(
          newAngle,
          currentFiberRef.current.controls.polarAngle,
          false
        );

        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const handlePause = (_fiber: Canvas3DRootState) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = (fiber: Canvas3DRootState) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setIsPlaying(false);
    setIsPaused(false);

    if (fiber?.controls) {
      fiber.controls.reset(true);
    }
  };

  const rotateHorizontalCamera = (camera: THREE.Camera, angle: number) => {
    const radius = camera.position.length();
    const currentAngle = Math.atan2(camera.position.x, camera.position.z);
    const newAngle = currentAngle + angle * cameraStep;

    camera.position.x = radius * Math.sin(newAngle);
    camera.position.z = radius * Math.cos(newAngle);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
  };

  const rotateVerticalCamera = (camera: THREE.Camera, direction: number) => {
    const right = new THREE.Vector3();
    camera
      .getWorldDirection(right)
      .cross(new THREE.Vector3(0, 1, 0))
      .normalize();

    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationAxis(right, direction * cameraStep);

    camera.position.applyMatrix4(rotationMatrix);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
  };

  const rotationControls: RotationControls = {
    horizontal: (fiber: Canvas3DRootState, direction: 1 | -1) => {
      if (fiber?.controls) {
        const currentAzimuth = fiber.controls.azimuthAngle;
        fiber.controls.rotateTo(
          currentAzimuth + direction * manualStep,
          fiber.controls.polarAngle,
          true
        );
      } else if (fiber?.camera) {
        rotateHorizontalCamera(fiber.camera, direction);
      }
    },
    vertical: (fiber: Canvas3DRootState, direction: 1 | -1) => {
      if (fiber?.controls) {
        fiber.controls.rotate(0, direction * manualStep, true);
      } else if (fiber?.camera) {
        rotateVerticalCamera(fiber.camera, direction);
      }
    },
  };

  const handleRotateLeft = (fiber: Canvas3DRootState) =>
    rotationControls.horizontal(fiber, 1);
  const handleRotateRight = (fiber: Canvas3DRootState) =>
    rotationControls.horizontal(fiber, -1);
  const handleRotateUp = (fiber: Canvas3DRootState) =>
    rotationControls.vertical(fiber, -1);
  const handleRotateDown = (fiber: Canvas3DRootState) =>
    rotationControls.vertical(fiber, 1);

  return (
    <>
      <Toolbar3DButton
        icon={<i className="fas fa-play" />}
        tooltip="Play Animation"
        onClick={handlePlay}
        active={isPlaying}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-pause" />}
        tooltip="Pause Animation"
        onClick={handlePause}
        active={isPaused}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-stop" />}
        tooltip="Stop Animation"
        onClick={handleStop}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-undo" />}
        tooltip="Rotate Left"
        onClick={handleRotateLeft}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-redo" />}
        tooltip="Rotate Right"
        onClick={handleRotateRight}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-redo fa-rotate-270" />}
        tooltip="Rotate Up"
        onClick={handleRotateUp}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-redo fa-rotate-90" />}
        tooltip="Rotate Down"
        onClick={handleRotateDown}
      />
    </>
  );
};

export default Animation3DControls;
