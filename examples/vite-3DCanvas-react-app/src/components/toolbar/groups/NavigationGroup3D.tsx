import React from "react";
import PanLeft3D from "./PanLeft3D";
import PanRight3D from "./PanRight3D";
import Forward3D from "./Forward3D";
import Backward3D from "./Backward3D";

const Navigation3D: React.FC = () => {
    return (
        <>
            <PanLeft3D />
            <PanRight3D />
            <Forward3D />
            <Backward3D />
        </>
    );
};

export default Navigation3D;