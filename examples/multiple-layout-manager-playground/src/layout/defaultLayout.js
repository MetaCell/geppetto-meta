export default {
  global: {
    sideBorders: 8,
    tabSetHeaderHeight: 28,
    tabSetTabStripHeight: 28,
    enableEdgeDock: false,
  },
  borders: [
    {
      type: 'border',
      location: 'top',
      children: [],
      config: {
        isMinimizedPanel: true
      }
    },
  ],
  layout: {
    type: "row",
    id: "root",
    weight: 100,
    children: [
      {
        type: "row",
        enableDeleteWhenEmpty: true,
        weight: 60,
        children: [
          {
            type: "row",
            id: "top",

            children: [{
              type: "tabset",
              id: "topLeft",
              enableDeleteWhenEmpty: false,
              children: [],
              weight: 30,
            }, {
              type: "tabset",
              id: "topRight",
              enableDeleteWhenEmpty: false,
              children: [],
              weight: 70,
            }],
            weight: 30,
          },
          {
            type: "tabset",
            id: "bottom",
            enableDeleteWhenEmpty: false,
            weight: 70,
            children: []
          }
        ]
      },

    ]
  }
};