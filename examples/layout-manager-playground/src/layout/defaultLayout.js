
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
    children: []
  }
};