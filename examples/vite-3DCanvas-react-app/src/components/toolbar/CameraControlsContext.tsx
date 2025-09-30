import React, { createContext, useContext } from 'react';
import { CameraControls } from '@react-three/drei';

type CameraControlsContextType = {
  cameraControls: React.RefObject<CameraControls> | null;
};

const CameraControlsContext = createContext<CameraControlsContextType>({
  cameraControls: null,
});

export const CameraControlsProvider: React.FC<{
  children: React.ReactNode;
  cameraControlsRef: React.RefObject<CameraControls>;
}> = ({ children, cameraControlsRef }) => {
  return (
    <CameraControlsContext.Provider value={{ cameraControls: cameraControlsRef }}>
      {children}
    </CameraControlsContext.Provider>
  );
};

export const useCameraControls = () => {
  const context = useContext(CameraControlsContext);
  return context.cameraControls;
};