import React, { useState, useRef, useEffect } from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import { useCameraControls } from "../CameraControlsContext";

const Animation3DControls: React.FC = () => {
  const cameraControlsRef = useCameraControls();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startAngleRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handlePlay = (_fiber: any) => {
    if (cameraControlsRef?.current) {
      setIsPlaying(true);
      setIsPaused(false);

      if (!isPaused) {
        startAngleRef.current = cameraControlsRef.current.azimuthAngle;
      }

      const animate = () => {
        if (cameraControlsRef.current) {
          const currentTime = Date.now() * 0.001;
          const rotationSpeed = 0.5;
          const newAngle = startAngleRef.current + currentTime * rotationSpeed;

          cameraControlsRef.current.rotateTo(
            newAngle,
            cameraControlsRef.current.polarAngle,
            false
          );

          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animate();
      console.log("Animation started using CameraControls");
    } else {
      console.log("No camera controls available for animation");
    }
  };

  const handlePause = (_fiber: any) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = (_fiber: any) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setIsPlaying(false);
    setIsPaused(false);

    if (cameraControlsRef?.current) {
      cameraControlsRef.current.reset(true);
    }
  };

  const handleRotateLeft = (fiber: any) => {
    if (cameraControlsRef?.current) {
      const currentAzimuth = cameraControlsRef.current.azimuthAngle;
      cameraControlsRef.current.rotateTo(currentAzimuth + 0.2, cameraControlsRef.current.polarAngle, true);
    } else if (fiber?.camera) {
      const camera = fiber.camera;
      const radius = camera.position.length();
      const angle = Math.atan2(camera.position.x, camera.position.z);
      const newAngle = angle + 0.1;

      camera.position.x = radius * Math.sin(newAngle);
      camera.position.z = radius * Math.cos(newAngle);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
    }
  };

  const handleRotateRight = (fiber: any) => {
    if (cameraControlsRef?.current) {
      const currentAzimuth = cameraControlsRef.current.azimuthAngle;
      cameraControlsRef.current.rotateTo(currentAzimuth - 0.2, cameraControlsRef.current.polarAngle, true);
    } else if (fiber?.camera) {
      const camera = fiber.camera;
      const radius = camera.position.length();
      const angle = Math.atan2(camera.position.x, camera.position.z);
      const newAngle = angle - 0.1;

      camera.position.x = radius * Math.sin(newAngle);
      camera.position.z = radius * Math.cos(newAngle);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
    }
  };

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
        icon={<i className="fas fa-rotate-left" />}
        tooltip="Rotate Left"
        onClick={handleRotateLeft}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-rotate-right" />}
        tooltip="Rotate Right"
        onClick={handleRotateRight}
      />
    </>
  );
};

export default Animation3DControls;
