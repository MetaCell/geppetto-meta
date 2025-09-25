import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

const baseStyles: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f0f0f0"
}

const Toolbar3D = ({ children, sx }: { children: React.ReactNode, sx?: SxProps<Theme> }) => {
    return (
        <Box sx={{ ...baseStyles, ...sx }}>
            {children}
        </Box>
    )
}

export default Toolbar3D;