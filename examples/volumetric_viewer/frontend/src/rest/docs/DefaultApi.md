# VolumetricViewer.DefaultApi

All URIs are relative to *http://volumetric_viewer.swagger.io/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**generateVolume**](DefaultApi.md#generateVolume) | **POST** /data | send nrrd and nifti
[**getVolume**](DefaultApi.md#getVolume) | **GET** /data | Get the obj file



## generateVolume

> InlineResponse2001 generateVolume(opts)

send nrrd and nifti

### Example

```javascript
import VolumetricViewer from 'volumetric_viewer';

let apiInstance = new VolumetricViewer.DefaultApi();
let opts = {
  'file': "/path/to/file" // File | 
};
apiInstance.generateVolume(opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **file** | **File**|  | [optional] 

### Return type

[**InlineResponse2001**](InlineResponse2001.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: multipart/form-data
- **Accept**: application/json


## getVolume

> InlineResponse200 getVolume(volumeName)

Get the obj file

### Example

```javascript
import VolumetricViewer from 'volumetric_viewer';

let apiInstance = new VolumetricViewer.DefaultApi();
let volumeName = "volumeName_example"; // String | get a volume
apiInstance.getVolume(volumeName, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **volumeName** | **String**| get a volume | 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

