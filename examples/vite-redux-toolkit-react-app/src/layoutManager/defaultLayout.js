export default {
  global: {
    sideBorders: 8,
    tabSetHeaderHeight: 26,
    tabSetTabStripHeight: 26,
    enableEdgeDock: false,
    borderBarSize: 0,
    tabEnableDrag: true
  },
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
            children: []
          }
        ]
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
            children: []
          }
        ]
      }
    ]
  }
};