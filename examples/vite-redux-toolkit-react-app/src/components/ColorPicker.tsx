import { Box } from "@mui/material";
import ChromePicker from "react-color";

const ColorPicker = ({ selectedColor, onChange }) => {
  return (
    <Box
      sx={{
        "& > div": {
          width: "100% !important",
          boxShadow: "none !important",
          background: "transparent !important",
          fontFamily: "'IBM Plex Sans',sans-serif !important",

          "& > div:last-of-type": {
            "& > div:first-of-type": {
              "& > div:first-of-type": {
                "& > div": {
                  // border: `0.0625rem solid ${headerBorderLeftColor}`,
                },
              },
            },
          },

          "& svg": {
            "&:hover": {
              // background: `${headerBorderLeftColor} !important`,
            },
          },

          "& input": {
            // backgroundColor: `${headerBorderLeftColor} !important`,
            boxShadow: "none !important",
            // color: `${headingColor} !important`,
            "&:focus": {
              boxShadow: "none !important",
              outline: "none !important",
            },
          },
        },
      }}
    >
      <ChromePicker color={selectedColor} onChange={onChange} />
    </Box>
  );
};

export default ColorPicker;
