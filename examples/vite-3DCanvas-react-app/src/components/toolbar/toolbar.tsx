import React from 'react';
import { Box, SxProps, Theme, Divider } from '@mui/material';

const baseStyles: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f0f0f0"
}


const baseButtonStyles: React.CSSProperties = {
    padding: "0.75rem",
    fontSize: "1.25rem",
    color: "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
}

const Toolbar3D = ({ children, sx, canvasId }: {
    children: React.ReactNode,
    sx?: SxProps<Theme>,
    canvasId?: string
}) => {
    return (
        <Box sx={{ ...baseStyles, ...sx }} data-canvas-id={canvasId}>
            {children}
        </Box>
    );
}


const Toolbar3DButton = ({ icon, tooltip, onClick, style }: { 
    icon: React.ReactNode, 
    tooltip: string, 
    onClick: (context: { camera?: any, [key: string]: any }) => void, 
    style?: React.CSSProperties
}) => {
    const handleClick = () => {
        // Here we can gather context data that might be useful
        // For now, let's provide a basic camera context
        const context = {
            camera: "default-camera", // This could be retrieved from React context, props, or refs
            // You can add more context data here as needed
        };
        onClick(context);
    };

    return (
        <button style={{ ...baseButtonStyles, ...style }} title={tooltip} onClick={handleClick}>
            {icon}
        </button>
    );
}

const Toolbar3DSeparator = () => {
    return (
        <Divider
            orientation="horizontal"
            sx={{
                width: '100%',
                my: 0.5
            }}
        />
    )
}

export { Toolbar3D, Toolbar3DButton, Toolbar3DSeparator };
export default Toolbar3D;