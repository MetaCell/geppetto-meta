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