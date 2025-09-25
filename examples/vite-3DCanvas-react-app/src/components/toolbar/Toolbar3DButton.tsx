import React from "react";

const baseStyles: React.CSSProperties = {
    padding: "0.75rem",
    fontSize: "1.25rem",
    color: "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
}

const Toolbar3DButton = ({ icon, tooltip, onClick, style }: { icon: React.ReactNode, tooltip: string, onClick: () => void, style?: React.CSSProperties }) => {
    return (
        <div style={{ ...baseStyles, ...style }} title={tooltip} onClick={onClick}>
            {icon}
        </div>
    );
}

export default Toolbar3DButton;