import React from "react";
import { Divider } from "@mui/material";

const Toolbar3DSeparator = ({ style, variant = "horizontal" }: { style?: React.CSSProperties, variant?: "horizontal" | "vertical" }) => {
    return (
        <Divider style={{ ...style }} orientation={variant === "horizontal" ? "horizontal" : "vertical"} />
    );
}

export default Toolbar3DSeparator;