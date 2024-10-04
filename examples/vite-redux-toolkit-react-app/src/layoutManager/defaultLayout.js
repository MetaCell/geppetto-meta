export default {
  global: {
    tabEnableClose: true,
    tabSetHeaderHeight: 26,
    tabSetTabStripHeight: 26,
    enableEdgeDock: false,
  },
  borders: [
    {
      type: 'border',
      location: 'bottom',
      size: 100,
      children: [],
      barSize: 35,
      config: {
        isMinimizedPanel: true
      }
    },
  ],
  layout: {
    type: "tabset",
    id: "root",
    weight: 100,
    children: [
      {
        type: "row",
        enableDeleteWhenEmpty: true,
        weight:31,
        children:[
          { type: "row",
            id: "top",
            
            children: [{ type: "tabset",
              id: "topLeft",
              enableDeleteWhenEmpty: false,
              children: [] ,
              weight: 30,
            },{ type: "tabset",
              id: "topRight",
              enableDeleteWhenEmpty: false,
              children: [] ,
              weight: 70,
            }] ,
            weight: 30,
          },
          { type: "tabset",
            id: "bottom",
            enableDeleteWhenEmpty: false,
            weight: 70,
            children: [] }
        ]
      },
    
    ]
  }
};