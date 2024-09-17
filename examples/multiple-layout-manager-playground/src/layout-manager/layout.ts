export default {
    global: {
      sideBorders: 8,
      tabSetHeaderHeight: 28,
      tabSetTabStripHeight: 28,
      enableEdgeDock: false,
      borderBarSize: 1,
      borderEnableDrop: false,
    },
    borders: [
      {
        type: "border",
        location: "bottom",
        size: 1,
        barSize: 1,
        enableDrop: false,
        config: {
          isMinimizedPanel: true,
        },
      },
    ],
    layout: {
      type: "row",
      id: "root",
      children: [
        {
          type: "row",
          weight: 60,
          children: [
            {
              type: "tabset",
              id: "leftPanel",
              weight: 100,
              enableDeleteWhenEmpty: false,
              children: [],
            },
          ],
        },
        {
          type: "row",
          weight: 40,
          children: [
            {
              type: "tabset",
              weight: 100,
              id: "rightPanel",
              enableDeleteWhenEmpty: false,
              children: [],
            },
            {
              type: "tabset",
              weight: 100,
              id: "bottomPanel",
              enableDeleteWhenEmpty: false,
              children: [],
            },
          ],
        },
      ],
    },
  };
  