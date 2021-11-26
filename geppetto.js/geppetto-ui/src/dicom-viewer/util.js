
import JSZip from "jszip";
import FileSaver from "file-saver";


export function createZipFromRemoteFiles(files, zipName) {
    if (!(files instanceof Array)){
      files = [files];
    }

    // Convert url to promise, returning uint8 array
    function urlToPromise (url) {
      return new Promise(function (resolve, reject) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
          var arrayBuffer = oReq.response;
          resolve(new Uint8Array(arrayBuffer));
        };

        oReq.send();
      });
    }

    // Add an entry to zip per file
    var zip = new JSZip();
    $.each(files, function (i, filePath) {
      zip.file(filePath.split('/').pop(), urlToPromise(filePath), { binary: true });
    });

    // Send File
    zip.generateAsync({ type: "blob" })
      .then(function (blob) {
        FileSaver.saveAs(blob, zipName);
      });
  }