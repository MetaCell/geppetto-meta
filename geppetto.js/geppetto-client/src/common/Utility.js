/**
 * Utility class for helper functions
 * 
 * @depreacted
 */

const JSZip = require("jszip");
const FileSaver = require('file-saver');

const Utility = {

  extractMethodsFromObject: function (object, original) {},

  componentToHex: function (c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  },

  rgbToHex: function (r, g, b) {
    return "0X" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  },
      
  getQueryStringParameter: function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  },


  createZipFromRemoteFiles: function (files, zipName) {
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
  },

      
};


/**
 * Adding method to javascript string class to test if beginning of string matches another string being passed.
 */
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str) {
    return this.substring(0, str.length) === str;
  }
}

/**
 * Extend string prototype to enable posh string formatting
 */
if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

export default Utility;

