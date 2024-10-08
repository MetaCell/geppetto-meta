import createTheme from "@mui/material/styles/createTheme";
import { vars } from "./variables.ts";
const {
  primaryFont,
  primary500,
  primaryPurple600,
  gray800,
  white,
  brand600,
  success50,
  success200,
  success700,
  primaryPurple700,
  gray600,
  gray700,
  gray400,
  gray100,
  gray25,
  gray200,
  primaryPurple50,
  gray700A,
  gray200S,
  buttonShadow,
  gray50,
  gray500,
  gray300,
  primaryPurple500,
  primaryPurple200,
  primaryPurple25,
  primaryPurple100,
  gray950,
  primaryBlue700,
  primaryBlue50,
  primaryBlue200,
  gray400B,
  brand500,
  brand300,
  brand200,
  gray900,
} = vars;

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: primaryFont,
      letterSpacing: "normal",
      textWrap: "wrap",
    },
    h2: {
      fontSize: "1.125rem",
      fontWeight: 600,
      color: gray800,
      lineHeight: "1.75rem",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: "150%",
      color: gray800,
    },
    body1: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: "1.25rem",
      color: gray700,
    },
    body2: {
      color: gray500,
      fontSize: "0.875rem",
    },
    h4: {
      fontSize: "1rem",
      fontWeight: 500,
      color: gray600,
    },
    h5: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: "1.5rem",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 400,
      color: gray600,
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      color: gray700A,
    },
    subtitle1: {
      fontSize: "0.875rem",
      fontWeight: 500,
      color: gray700A,
    },
    button: {
      fontSize: "0.875rem",
      color: primaryPurple600,
      fontWeight: 600,
      textTransform: "none",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: `
      ::-webkit-scrollbar {
        width: 0.8125rem;
        height: 0.5rem;
      }
      ::-webkit-scrollbar-thumb {
        height: 0.5rem;
        border: 0.25rem solid rgba(0, 0, 0, 0);
        background-clip: padding-box;
        border-radius: 0.5rem;
        background-color: ${gray200S};
      }
      ::-webkit-scrollbar-button {
        width: 0;
        height: 0;
        display: none;
      }
      ::-webkit-scrollbar-corner {
        background-color: transparent;
      }
      * {
          box-sizing: border-box !important;
          margin: 0;
          font-family: ${primaryFont};
          padding: 0;
        }
      body {
          background: ${gray50};
          scrollbar-width: thin;
          scrollbar-color: ${gray200S} transparent;
      }
      .MuiContainer-center {
        margin: auto;
      }
      .MuiFooterImage {
        img {
          display: block;
          font-size: 0;
        }
      }
      .MuiBox-container {
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - 3.125rem);
        padding: 3.5rem 1.5rem 1.5rem;
        .MuiBox-title {
          margin-top: 3rem
        }
      }
      `,
    },

    MuiChip: {
      styleOverrides: {
        root: {
          width: "fit-content",
          fontSize: "0.75rem",
          fontWeight: 500,
          lineHeight: "1.125rem",
          height: "1.375rem",
          borderRadius: "1rem",
          padding: "0 0.5rem",
          fontFamily: primaryFont,

          "&:active": {
            boxShadow: "none",
          },
        },
        label: {
          padding: 0,
        },
        outlinedPrimary: {
          background: primaryPurple50,
          borderColor: primaryPurple200,
          color: primaryPurple700,
        },
        outlinedSecondary: {
          color: primaryBlue700,
          backgroundColor: primaryBlue50,
          borderColor: primaryBlue200,
        },
        outlined: {
          color: primaryPurple700,
          backgroundColor: primaryPurple50,
          borderColor: primaryPurple200,

          "&.link": {
            backgroundColor: primaryPurple25,
            borderColor: primaryPurple100,
            padding: "0.125rem 0.625rem",
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: primary500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem",
          border: `0.0625rem solid ${gray100}`,
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          height: "100%",
          "& .MuiCardContent-root": {
            height: "100%",
            background: gray25,
            overflow: "hidden",
            padding: "1.5rem",
            "&:hover": {
              background: gray100,
            },
          },
          "& .MuiBox-root": {
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
            alignItems: "flex-start",
            "& .MuiTypography-caption": {
              border: "0.0625rem solid black",
              borderRadius: "2.5rem",
              padding: "0.1rem 0.5rem",
              fontWeight: "500",
              "&.success": {
                background: success50,
                borderColor: success200,
                color: success700,
              },
              "&.info": {
                background: primaryBlue50,
                borderColor: primaryBlue200,
                color: primaryBlue700,
              },
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: white,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        arrow: {
          color: gray950,
        },
        popper: {
          '&[data-popper-placement*="right"]': {
            "& .MuiTooltip-tooltip": {
              marginLeft: "0 !important",
            },
          },
        },
        tooltip: {
          background: gray950,
          borderRadius: "0.5rem",
          fontFamily: primaryFont,
          padding: "0.5rem 0.75rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          lineHeight: "150%",
          boxShadow: "0rem 0.25rem 0.375rem -0.125rem rgba(16, 24, 40, 0.03), 0rem 0.75rem 1rem -0.25rem rgba(16, 24, 40, 0.08)",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          alignItems: "center",
          justifyContent: "space-between",
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
          "& .MuiTouchRipple-root": {
            display: "none",
          },
          "&.MuiButton-summary": {
            background: gray100,
            color: brand600,
            marginTop: "1.5rem",
            borderRadius: "0.5rem",
          },
          "&:focus": {
            outline: 0,
          },
          "&.Mui-disabled": {
            background: gray100,
            color: gray400,
            borderColor: gray200,
          },
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: "0.5625rem 0.5rem",
          gap: "0.5rem",
          fontWeight: 500,
          color: gray600,

          // '& svg': {
          //   visibility: 'hidden'
          // },

          "&.selected": {
            color: gray700,

            "& > p": {
              color: gray700,
              "& > span": {},
            },

            "& svg": {
              visibility: "visible",
            },
          },

          "& > p": {
            fontSize: "0.875rem",
            fontWeight: 500,
            lineHeight: "142.857%",
            color: gray600,
            "& > span": {
              marginLeft: "0.5rem",
              color: gray500,
            },
          },

          "& h4": {
            color: gray400B,
            fontSize: "0.875rem",
            fontWeight: 500,
            lineHeight: "142.857%",
          },

          "&.Mui-disabled": {
            opacity: 1,
            // display: 'none',
            padding: "0.25rem 0.5rem",
          },
        },
      },
    },

    MuiList: {
      styleOverrides: {
        root: {
          maxHeight: "100%",
          "& > div + div": {
            marginTop: "0.25rem",
            paddingTop: "0.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            borderTop: `0.0625rem solid ${gray100}`,
          },

          "& .MuiMenuItem-root": {
            "&.Mui-disabled": {
              background: "transparent",
            },
          },
        },
      },
    },

    MuiListSubheader: {
      styleOverrides: {
        root: {
          top: "-0.5rem",
          fontFamily: primaryFont,
          fontSize: "0.875rem",
          padding: "0.5625rem 0.5rem",
          fontWeight: 500,
          lineHeight: "142.857%",
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: "0.5rem",
          border: `0.0625rem solid ${gray100}`,
          background: white,
          width: "18.75rem",
          boxShadow: "0rem 0.25rem 0.5rem -0.125rem rgba(16, 24, 40, 0.10), 0rem 0.125rem 0.25rem -0.125rem rgba(16, 24, 40, 0.06)",
        },

        list: {
          // padding: '0'
          padding: "0.5rem",
        },
      },
    },

    MuiBackdrop: {
      styleOverrides: {
        root: {
          background: "transparent",
        },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: gray700,
          fontSize: "0.875rem",
          fontWeight: 500,
          lineHeight: "142.857%",

          "& + .MuiFormControl-root, + .MuiAutocomplete-root": {
            marginTop: "0.375rem",
          },
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        input: {
          height: "auto",
        },
        inputRoot: {
          gap: "0.5rem",
        },
        tag: {
          margin: 0,
          padding: "0.125rem 0.25rem 0.125rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: 500,
          lineHeight: "142.857%",
          color: gray700,
          background: gray50,
          border: `0.0625rem solid ${gray200}`,
          gap: "0.125rem",

          "& svg": {
            width: "0.75rem",
            height: "0.75rem",
            margin: 0,
          },
        },
        groupLabel: {
          top: "-0.25rem",
          padding: "0.5rem 0.25rem",
        },
        groupUl: {
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        },
        option: {
          padding: "0.5rem !important",
          borderRadius: "0.375rem",
          gap: "0.5rem",

          "&:not(:first-of-type)": {
            marginTop: "0.25rem",
          },

          "& > svg": {
            visibility: "hidden",
          },
          '&[aria-selected="true"]': {
            background: `${gray50} !important`,
            "& > svg": {
              visibility: "visible",
            },
            "&.Mui-focused": {
              background: `${gray50} !important`,
            },
          },
          "& > p": {
            fontSize: "0.875rem",
            fontWeight: 500,
            lineHeight: "142.857%",
            color: gray600,
          },

          "& > span": {
            fontSize: "0.875rem",
            lineHeight: "142.857%",
            fontWeight: 400,
            color: gray500,
          },
        },
        popupIndicator: {
          padding: "0 !important",
          margin: "0 !important",

          "& .MuiSvgIcon-root": {
            margin: 0,
          },
        },
        listbox: {
          padding: "0.5rem",
          "& > li": {
            // padding: '0 0.5rem',
            "&.grouped-list": {
              margin: "-0.25rem -0.5rem 0",
              padding: "0 0.5rem",
              "& + li": {
                marginTop: "0.25rem",
                paddingTop: "0.25rem",
                borderTop: `0.0625rem solid ${gray100}`,
              },
            },
          },
        },
        paper: {
          borderRadius: "0.5rem",
          border: `0.0625rem solid ${gray100}`,
          boxShadow: "0rem 0.25rem 0.5rem -0.125rem rgba(16, 24, 40, 0.10), 0rem 0.125rem 0.25rem -0.125rem rgba(16, 24, 40, 0.06)",
        },
        root: {
          "&.secondary": {
            "& .MuiAutocomplete-tag svg path": {
              fill: primaryBlue700,
            },
            "& .MuiChip-root": {
              borderColor: brand200,
              background: primaryBlue50,
              color: primaryBlue700,
            },
          },
          "& .MuiOutlinedInput-root": {
            padding: "0.5rem 0.875rem",
            "& .MuiAutocomplete-input": {
              padding: 0,
            },
          },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        root: {},
        paperWidthLg: {
          maxWidth: "43.75rem",
        },
        paper: {
          borderRadius: "0.5rem",
          maxWidth: "34.375rem",
          "& h3": {
            fontSize: "0.875rem",
            color: gray800,
            fontWeight: 500,
            lineHeight: "142.857%",
          },
          "& p": {
            fontSize: "0.875rem",
            color: gray500,
            fontWeight: 400,
            lineHeight: "142.857%",
          },
          "& .MuiIconButton-root": {
            color: gray400,
            // borderRadius: 0,
            padding: "0.5rem",
            "&:hover": {},
          },
          "& .MuiSvgIcon-root": {
            width: "0.85em",
            height: "0.85em",
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          fontWeight: 500,
          color: gray800,
          background: gray25,
          padding: "0.813rem 1.5rem",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          borderColor: gray100,
          borderBottom: 0,
          "& .MuiBox-root": {
            margin: "0.4rem 0 1rem",
            "&.MuiBoxMetacell-footer": {
              display: "flex",
              margin: 0,
              borderTop: `0.0625rem solid ${gray100}`,
              padding: "1.5rem 0 0.5rem",
              "& p": {
                fontSize: "0.75rem",
                marginRight: "1rem",
              },
            },
            "& p": {
              color: gray600,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          fontWeight: 600,
          height: "2.25rem",
          padding: "0 0.75rem",
        },
        outlinedSecondary: {
          borderColor: gray200,
          color: gray700,
          "&:hover": {
            background: "none",
            borderColor: gray200,
          },
          "&:focus": {
            background: "none",
            borderColor: gray300,
            outline: "0.25rem solid rgba(0, 0, 0, 0.07)",
          },
        },
        contained: {
          boxShadow: "none",
          background: primaryPurple500,
          color: white,
          border: `0.0625rem solid ${primaryPurple500}`,
          "&:hover": {
            boxShadow: "none",
            border: `0.0625rem solid ${primaryPurple600}`,
            background: primaryPurple600,
          },
        },
        outlined: {
          border: `0.0625rem solid ${gray100}`,
          background: white,
          color: gray600,
          "& .MuiSvgIcon-root": {
            fontSize: "1.25rem",
          },
          "&:hover": {
            border: `0.0625rem solid ${gray100}`,
            background: gray50,
          },
        },
        text: {
          boxShadow: "none",
          color: gray500,
        },
        textPrimary: {
          "&:hover": {
            background: gray50,
          },

          "&:focus": {
            background: gray100,
          },
        },
        containedPrimary: {
          background: primaryPurple500,
          color: white,
        },

        containedInfo: {
          background: brand500,
          borderColor: brand500,
          color: white,
          borderRadius: "0.5rem",
          height: "2.25rem",
          padding: "0 0.75rem",

          "&:hover": {
            background: brand600,
            borderColor: brand600,
          },

          "&:focus": {
            boxShadow: "0rem 0.0625rem 0.125rem 0rem rgba(16, 24, 40, 0.05), 0rem 0rem 0rem 0.25rem rgba(33, 85, 186, 0.24)",
          },
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          border: `0.0625rem solid ${gray100}`,
          borderRadius: "0.5rem",
          padding: "0.25rem",
          height: "2.5rem",
          gap: "0.125rem",
          boxShadow: "none",
          "& .MuiButtonBase-root": {
            border: "none",
            height: "100%",
            background: white,
            fontSize: "0.875rem",
            borderRadius: "0.5rem",
            fontWeight: 600,
            color: gray600,
            padding: "0 0.75rem",

            "&:hover": {
              border: "none",
            },

            "&.active": {
              background: gray100,
              color: gray700,
            },

            "& .MuiSvgIcon-root": {
              fontSize: "1.25rem",
            },
          },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          fontWeight: 500,
        },
        li: {
          "& a": {
            color: gray500,
            cursor: "pointer",
            fontSize: "0.875rem",
          },
          "&:last-child": {
            "& p": {
              color: primaryPurple600,
              fontWeight: 500,
              fontSize: "0.875rem",
            },
          },
        },
        separator: {
          color: gray300,
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: gray500,
        },
        fontSizeSmall: {
          fontSize: "1rem",
          width: "1rem",
          height: "1rem",
        },
        fontSizeMedium: {
          fontSize: "1.25rem",
          width: "1.25rem",
          height: "1.25rem",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:before": {
            display: "none",
          },
          "& .MuiAccordionSummary-root": {
            paddingLeft: 0,
            gap: ".5rem",
            flexDirection: "row-reverse",
            "& .MuiTypography-root": {
              fontSize: "0.875rem",
              color: gray700A,
              fontWeight: 500,
            },
            "& .MuiAccordionSummary-expandIconWrapper": {
              color: gray700A,
              fontSize: "1rem",
              "&.Mui-expanded": {
                transform: "rotate(90deg)",
              },
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {},
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: "0.25rem",
          border: `0.0625rem solid ${gray200}`,

          "& .MuiTableCell-root": {
            borderBottom: `0.0625rem solid ${gray100}`,
            color: gray600,
            fontWeight: 400,
            padding: "0.625rem .75rem 0.625rem .75rem",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: gray500,
          fontSize: "0.875rem",
          fontWeight: 600,
          lineHeight: "1.25rem",
          padding: "0.5rem 0.75rem",
          minHeight: "unset",

          "&.Mui-selected": {
            borderRadius: "0.25rem",
            color: primaryPurple600,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: "unset",
          "& .MuiTabs-indicator": {
            backgroundColor: primaryPurple500,
            height: "0.0625rem",
          },
          "&.custom-tabs": {
            "& .MuiTabs-indicator": {
              display: "none",
            },
            "& .MuiTab-root": {
              padding: "0.5rem 0.75rem",
              "&.Mui-selected": {
                background: gray50,
                color: gray700,
                borderRadius: "0.25rem",
                boxShadow: buttonShadow,
              },
            },
          },
        },
        flexContainer: {
          justifyContent: "center",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: gray100,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          height: "2.25rem",
          paddingTop: 0,
          paddingBottom: 0,

          "&::placeholder": {
            color: gray400B,
            fontSize: "0.875rem",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "142.857%",
            opacity: 1,
          },
        },
        root: {
          borderRadius: "0.5rem",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: gray100,
            borderWidth: "0.0625rem",
          },
          "&:hover": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: "0.0625rem",
              borderColor: gray100,
            },
          },
          "&.Mui-focused": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: "0.0625rem",
              borderColor: brand300,
              boxShadow: "0rem 0.0625rem 0.125rem 0rem rgba(16, 24, 40, 0.05), 0rem 0rem 0rem 0.25rem rgba(33, 85, 186, 0.24)",
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: gray600,
          fontWeight: 600,
          "&.Mui-focused": {
            color: primaryPurple600,
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiSvgIcon-root": {
            marginRight: "0.5rem",
            marginLeft: "0.875rem",
            color: gray600,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: "0.375rem",
          borderRadius: "0.25rem",

          "&.active": {
            backgroundColor: primaryBlue50,
            "&:hover": {
              backgroundColor: primaryBlue50,
            },
            "& svg path": {
              fill: brand600,
            },
          },

          "&:hover": {
            backgroundColor: gray50,

            "& .MuiSvgIcon-root": {
              color: gray500,
            },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
          borderRadius: ".5rem",

          "& .MuiToggleButtonGroup-firstButton": {
            borderTopLeftRadius: ".5rem",
            borderBottomLeftRadius: ".5rem",
          },
          "& .MuiToggleButtonGroup-lastButton": {
            borderTopRightRadius: ".5rem",
            borderBottomRightRadius: ".5rem",
          },
          button: {
            fontSize: "0.875rem",
            color: gray700,
            fontWeight: 600,
            borderColor: gray200,
            "&:hover": {
              backgroundColor: "transparent",
            },
            "&.Mui-selected": {
              backgroundColor: gray50,
              color: gray800,

              "&:not(.MuiToggleButtonGroup-firstButton)": {
                borderLeft: `1px solid ${gray200}`,
              },

              "&:hover": {
                backgroundColor: gray50,
              },
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRight: 0,
          borderLeft: 0,
          borderRadius: 0,
          padding: "0.5rem 0.875rem",
          borderColor: gray100,
          "&.Mui-focused": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: 0,
              background: `transparent !important`,
              boxShadow: "none !important",
              borderColor: `${gray100} !important`,
            },
          },

          "& .MuiInputBase-input": {
            padding: "0",
            height: "1.25rem",
          },

          "& .MuiSvgIcon-root": {
            color: `${gray400B}`,
          },

          "&:has( .Mui-disabled)": {
            backgroundColor: gray100,

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: `${gray100} !important`,
            },
          },
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          "&.MuiPaper-root": {
            height: "fit-content !important",
            backgroundColor: gray900,
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "0.5rem 0.75rem",
          },
        },
        action: {
          "& .MuiButtonBase-root": {
            "& .MuiSvgIcon-root": {
              color: "white",
              fontWeight: 600,
            },
          },
        },
      },
    },
  },
});

export default theme;
