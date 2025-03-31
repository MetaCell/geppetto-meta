# CHANGELOG

## 3.0.0
### Breaking change

* There is now two versions of the dicom viewer:
  1. the base dicom viewer, that provides the basic behavior for the dicom viewer, without any special features, like screenshot, presented as button,
  2. the preconf dicom viewer, which is a preconfigured version of the dicom viewer that is embedded with some specific behaviors and buttons.
  If you had in your code:
  ```js
  import DicomViewer from '@metacell/geppetto-meta-ui/dicom-viewer/DicomViewer';
  ```
  and you wanted to have the preconfigured version, here is how you need to modify your code now:
  ```js
  import DicomViewer from '@metacell/geppetto-meta-ui/dicom-viewer/preconf/DicomViewer';
  ```
* The style for the flex-layout have been moved from `geppetto-ui` to `geppetto-client`
  Before:
  ```js
  import '@metacell/geppetto-meta-ui/flex-layout/style/dark.scss'
  ```
  Now:
  ```js
  import '@metacell/geppetto-meta-client/common/layout/styles/dark.css'
  ```
* The removal of material-ui, and specifically the way of creating HOC with `useStyle` implies that the technique that was used before by a main app to instanciate the `LayoutComponent` changed.
  Before, `useState` with `useEffect` was used:
  ```js
  const store = useStore();
  const [LayoutComponent, setLayoutComponent] = useState<any | undefined>(undefined);

  useEffect(() => {
    if (LayoutComponent === undefined) {
      const myManager = getLayoutManagerInstance();
      if (myManager) {
        setLayoutComponent(myManager.getComponent() as React.ComponentType<any>);
      }
    }
  }, [store, LayoutComponent])
  ```
  Now, `useMemo` has to be used instead
  ```js
  const store = useStore();
  const LayoutComponent = useMemo(() => {
    return getLayoutManagerInstance()?.getComponent()
  }, [store])
  ```
* `ami.js` relies on an old version of `three.js`, as now `fiber` and `drei` are used for the 3D canvas, and uses more modern revision of `three`, there is now a different way of importing `three` in your `package.json` if `ami.js` and `fiber/drei` are required in the same app:
  ```json
  {
    "dependencies": {
      "three-legacy": "npm:three@^0.118.0",
      "three": "^0.173.0",
      "@react-three/fiber": "YOUR_VERSION",
      "@react-three/drei": "YOUR_VERSION",
    }
  }
  ```
  The dependencies configuration needs to follow those names, and the version for `three-legacy` needs to be `npm:three@^0.118.0`. This specific version uses aliases from NPM/Yarn to be able to host two different versions of `three`. In this example `three` is the version that will be loaded and used by `fiber/drei` while `three-legacy` will only be used by the dicom viewer from `geppetto-ui`.


### New features
* The flex-layout introduces now a new `redraw()` method that can be called by accessing the `layout` of the `LayerManager`:
  ```typescript
  const manager = ... // gets the LayoutManager one way or the other
  manager.layout.current.redraw();
  ```


### Bug fixes

* Each layout for the FlexLayout are now stored in a serialized-compatible way in the redux store, making redux-store, or global context that would embbed a store for the FlexLayout, fully serializable.