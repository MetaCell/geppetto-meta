import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import type React from "react";
import { forwardRef } from "react";
import { vars } from "../theme/variables.ts";

const { white, brand600, gray100 } = vars;

interface CustomSwitchProps {
  width?: number;
  height?: number;
  thumbDimension?: number;
  checkedPosition?: string;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  showTooltip?: boolean;
  disabled?: boolean;
}

const CustomSwitch = forwardRef<HTMLButtonElement, CustomSwitchProps>(
  ({ width, height, thumbDimension, checkedPosition, checked, onChange, showTooltip, disabled }, ref) => {
    return (
      <Tooltip title={showTooltip ? (checked ? "Hide" : "Show") : ""}>
        <Switch
          focusVisibleClassName=".Mui-focusVisible"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          ref={ref}
          sx={(theme) => ({
            marginRight: ".5rem",
            width: width ?? 23,
            height: height ?? 13,
            padding: 0,
            "& .MuiSwitch-switchBase": {
              padding: 0,
              margin: "0.0938rem",
              transitionDuration: "300ms",
              "&.Mui-checked": {
                transform: checkedPosition ?? "translateX(0.5775rem)",
                color: white,
                "& + .MuiSwitch-track": {
                  backgroundColor: brand600,
                  opacity: 1,
                  border: 0,
                },
                "&.Mui-disabled + .MuiSwitch-track": {
                  opacity: 0.5,
                },
              },
              "&.Mui-disabled .MuiSwitch-thumb": {
                color: gray100,
              },
            },
            "& .MuiSwitch-thumb": {
              boxSizing: "border-box",
              width: thumbDimension ?? 10.24,
              height: thumbDimension ?? 10.24,
              boxShadow: "none",
            },
            "& .MuiSwitch-track": {
              borderRadius: 26 / 2,
              backgroundColor: gray100,
              opacity: 1,
              transition: theme.transitions.create(["background-color"], {
                duration: 500,
              }),
            },
          })}
        />
      </Tooltip>
    );
  },
);

export default CustomSwitch;
