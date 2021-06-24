/**
 * The default layout of the application.
 * 
 * Will be loaded by FlexLayout.
 */
export const layout = {
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
    },
  ],
  "layout": {
    "type": "tabset",
    "weight": 100,
    "id": "root",
    "children": [
      {
        "type": "row",
        "weight": 31,
        "children": [
          {
            "type": "tabset",
            "weight": 100,
            "id": "leftPanel",
            "enableDeleteWhenEmpty": false,
            "children": []
          }
        ]
      },
      {
        "type": "row",
        "weight": 69,
        "children": [
          {
            "type": "tabset",
            "weight": 100,
            "id": "rightPanel",
            "enableDeleteWhenEmpty": false,
            "children": []
          }
        ]
      }
    ]
  }
};