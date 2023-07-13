export default {
  global: {
    sideBorders: 8,
    tabSetHeaderHeight: 28,
    tabSetTabStripHeight: 28,
    enableEdgeDock: false,
    borderBarSize: 0,
    tabEnableDrag: true

  },
  layout: {
    id: "root",
    children: [
      {
        type: "row",
        children: [
          {
            type: "row",
            enableDeleteWhenEmpty: false,
            weight:0,
            children:[
              { type: "tabset",
                id: "panel1",
                enableDeleteWhenEmpty: false,
                children: [] },
            ]
          },
          {
            type: "row",
            enableDeleteWhenEmpty: false,
            weight:0,
            children:[
              { type: "tabset",
                weight: 100,
                id: "panel2",
                enableDeleteWhenEmpty: false,
                children: [] }
            ],
          }
        ]
      }
    ]
  }
};