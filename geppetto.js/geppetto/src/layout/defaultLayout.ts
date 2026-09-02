/*
 * Cast to `any` because flexlayout-react 0.8.x's IJsonModel types are
 * incomplete: they don't declare sideBorders, barSize, or the `active`
 * attribute on the root layout node, even though FlexLayout.Model.fromJson
 * accepts and applies all of them at runtime.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultLayout: any = {
  global: {
    sideBorders: 8,
    tabSetHeaderHeight: 26,
    tabSetTabStripHeight: 26,
    enableEdgeDock: false,
    borderBarSize: 1,
  },
  borders: [
    {
      type: "border",
      location: "bottom",
      size: 1,
      barSize: 1,
      children: [],
    },
  ],
  layout: {
    type: "tabset",
    weight: 100,
    id: "root",
    active: true,
    children: [],
  },
};

export default defaultLayout;
