import JSZip from 'jszip';
import FileSaver from 'file-saver';

export function extractMethodsFromObject (object, original, nonCommands = []) {
  var proto = object.__proto__;
  var methods = [];
  if (original) {
    proto = object;
  }
  // find all functions of object Simulation
  for (var prop in proto) {
    if (typeof proto[prop] === 'function') {
      var f = proto[prop].toString();
      // get the argument for this function
      var parameter = f
        .match(/\(.*?\)/)[0]
        .replace(/[()]/gi, '')
        .replace(/\s/gi, '')
        .split(',');

      var functionName = prop + '(' + parameter + ')';
      if (nonCommands.indexOf(functionName) <= -1) {
        methods.push(functionName);
      }
    }
  }

  return methods;
}

export function formatSelection (tree, formattedOutput, indentation) {
  for (var e in tree) {
    var entity = tree[e];
    if (entity.selected == true) {
      formattedOutput = formattedOutput + indentation + entity.id + '\n';
      indentation = '      ↪';
    }
  }

  if (formattedOutput.lastIndexOf('\n') > 0) {
    formattedOutput = formattedOutput.substring(
      0,
      formattedOutput.lastIndexOf('\n')
    );
  }

  return formattedOutput.replace(/"/g, '');
}

export function componentToHex (c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

export function rgbToHex (r, g, b) {
  return '0X' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function getContrast50 (hexcolor) {
  return parseInt(hexcolor, 16) > 0xffffff / 2 ? 'black' : 'white';
}

export function getQueryStringParameter (name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
    results = regex.exec(location.search);
  return results == null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export function getPathStringParameters () {
  var paths = [];
  var locationPaths = location.pathname.split('/');
  for (var pathIndex in locationPaths) {
    var locationPath = locationPaths[pathIndex];
    if (
      locationPath != 'geppetto'
      && locationPath != 'org.geppetto.frontend'
      && locationPath != ''
    ) {
      paths.push(locationPath);
    }
  }
  return paths;
}

export function extend (destObj, sourceObj) {
  for (let v in sourceObj) {
    destObj[v] = sourceObj[v];
  }
}

export function newObjectCreated (obj, createTagsCallback) {
  createTagsCallback(
    obj.getInstancePath ? obj.getInstancePath() : obj.getPath(),
    extractMethodsFromObject(obj, true)
  );
}

export function createZipFromRemoteFiles (files, zipName) {
  if (!(files instanceof Array)) {
    files = [files];
  }

  // Convert url to promise, returning uint8 array
  function urlToPromise (url) {
    return new Promise(function (resolve, reject) {
      const oReq = new XMLHttpRequest();
      oReq.open('GET', url, true);
      oReq.responseType = 'arraybuffer';

      oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response;
        resolve(new Uint8Array(arrayBuffer));
      };

      oReq.send();
    });
  }

  // Add an entry to zip per file
  const zip = new JSZip();
  files.forEach(function (filePath, i) {
    zip.file(filePath.split('/').pop(), urlToPromise(filePath), { binary: true, });
  });

  // Send File
  zip.generateAsync({ type: 'blob' }).then(function (blob) {
    FileSaver.saveAs(blob, zipName);
  });
}
