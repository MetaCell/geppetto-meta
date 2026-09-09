/*
 * Default FlexLayout model.
 * Two equal columns: leftPanel (DICOM viewer) and rightPanel (3D canvas / info).
 * The bottom border has isMinimizedPanel=true so MinimizeHelper routes
 * minimized tabs there when isMinimizeEnabled is set.
 */
export default {
  global: {
    sideBorders: 8,
    tabSetHeaderHeight: 26,
    tabSetTabStripHeight: 26,
    enableEdgeDock: false,
    borderBarSize: 0,
    tabEnableDrag: true,
  },
  borders: [
    {
      type: "border",
      location: "bottom",
      size: 1,
      barSize: 1,
      children: [],
      config: { isMinimizedPanel: true },
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
            id: "rightPanel",
            weight: 100,
            enableDeleteWhenEmpty: false,
            children: [],
          },
        ],
      },
    ],
  },
};
