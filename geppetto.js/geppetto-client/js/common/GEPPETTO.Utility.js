/**
 * Utility class for helper functions
 * 
 * @depreacted
 */
define(function (require) {
  return function (GEPPETTO) {
    var $ = require('jquery');
    var JSZip = require("jszip");
    var FileSaver = require('file-saver');

    GEPPETTO.Utility = {

      extractMethodsFromObject: function (object, original) {
        var proto = object.__proto__;
        var methods = [];
        if (original) {
          proto = object;
        }
        // find all functions of object Simulation
        for (var prop in proto) {
          if (typeof proto[prop] === "function") {
            var f = proto[prop].toString();
            // get the argument for this function
            var parameter = f.match(/\(.*?\)/)[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',');

            var functionName = prop + "(" + parameter + ")";
            if (GEPPETTO.CommandController.getNonCommands().indexOf(functionName) <= -1) {
              methods.push(functionName);
            }
          }
        }

        return methods;
      },

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

      persistedAndWriteMessage: function (caller) {
        var message = GEPPETTO.Resources.OPERATION_NOT_SUPPORTED;
        if (!GEPPETTO.UserController.isLoggedIn()) {
          message = GEPPETTO.Resources.OPERATION_NOT_SUPPORTED + GEPPETTO.Resources.USER_NOT_LOGIN;
        } else {
          if (!window.Project.persisted && caller.writePermission) {
            message = GEPPETTO.Resources.OPERATION_NOT_SUPPORTED
                            + GEPPETTO.Resources.PROJECT_NOT_PERSISTED;
          } else if (window.Project.persisted && !caller.writePermission) {
            message = GEPPETTO.Resources.OPERATION_NOT_SUPPORTED
                            + GEPPETTO.Resources.WRITE_PRIVILEGES_NOT_SUPPORTED;
          } else if (!window.Project.persisted && !caller.writePermission) {
            message = GEPPETTO.Resources.OPERATION_NOT_SUPPORTED
                            + GEPPETTO.Resources.PROJECT_NOT_PERSISTED + " and "
                            + GEPPETTO.Resources.WRITE_PRIVILEGES_NOT_SUPPORTED;
          }
        }

        return message;
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
  };
});


