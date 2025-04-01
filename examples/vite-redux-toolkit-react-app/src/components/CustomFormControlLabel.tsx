import {Box, FormControlLabel, Stack, Typography} from "@mui/material";
import { vars } from "../theme/variables.ts";
import PickerWrapper from "./PickerWrapper.tsx";
import { useState } from "react";

const { gray600, gray50 } = vars;

const CustomFormControlLabel = ({ label, color, handleColorChange }) => {
  const [selectedColor, setSelectedColor] = useState(color);
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  
  const handleChange = (color) => {
    setSelectedColor(color.hex);
    handleColorChange(color.hex);
  };
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };
  
  return (
    <>
      <FormControlLabel
        control={
          <Box
            sx={{
              width: "1rem",
              height: ".8rem",
              backgroundColor: selectedColor,
              borderRadius: "0.2rem",
              cursor: "pointer",
              marginRight: '.5rem'
            }}
            onClick={handleClick}
          />
        }
        sx={{
          width: "100%",
          p: ".5rem .5rem .5rem .5rem",
          margin: 0,
          alignItems: "center",
          "&:hover": {
            background: gray50,
            borderRadius: ".5rem",
          },
          "& .MuiFormControlLabel-label": {
            width: "100%",
          },
          "& .MuiIconButton-root": {
            borderRadius: ".25rem",
          },
        }}
        label={
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              width={1}
              spacing=".5rem"
              justifyContent="space-between"
            >
              <Typography color={gray600} variant="subtitle1">
                {label}
              </Typography>
            </Stack>
          </Box>
        }
      />
      <PickerWrapper handleColorChange={handleChange} selectedColor={selectedColor} onClose={handleClose} open={open} anchorEl={anchorEl} />
    </>
  );
};

export default CustomFormControlLabel;
