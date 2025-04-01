import { Popover } from "@mui/material";
import ColorPicker from "./ColorPicker";

const PickerWrapper = ({ open, anchorEl, onClose, handleColorChange, selectedColor }) => {
  return (
    <Popover
      id={"id"}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      sx={{
        "& .MuiPopover-paper": {
          width: "15.375rem",
          borderRadius: "0.5rem",
          height: "16rem",
          boxShadow: "0rem 0.5rem 0.5rem -0.25rem rgba(16, 24, 40, 0.03), 0rem 1.25rem 1.5rem -0.25rem rgba(16, 24, 40, 0.08)",
          
          "&:after": {
            display: "none",
          },
        },
      }}
    >
      <ColorPicker selectedColor={selectedColor} onChange={handleColorChange} />
    </Popover>
  );
};

export default PickerWrapper;
