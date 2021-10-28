import * as htmlToImage from "html-to-image";

function getOptions(htmlElement, targetResolution, quality, pixelRatio, filter) {
  const resolution = getResolutionFixedRatio(htmlElement, targetResolution)
  const options = {
    quality: quality,
    canvasWidth: resolution.width,
    canvasHeight: resolution.height,
    pixelRatio: pixelRatio,
    filter: filter
  }
  return options;
}

export function downloadScreenshot (htmlElement, quality = 0.95, targetResolution = { width: 3840, height: 2160 },
  pixelRatio = 1, filter = () => true, filename = `Canvas_${formatDate(new Date())}.png`) {
  const options = getOptions(htmlElement, targetResolution, quality, pixelRatio, filter);

  htmlToImage.toPng(htmlElement, options)
    .then(function (dataUrl) {
      const link = window.document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    });
}

function getResolutionFixedRatio (htmlElement, target) {
  const current = {
    height: htmlElement.clientHeight,
    width: htmlElement.clientWidth
  }
  // if height is closer
  if (Math.abs(target.width - current.width) * 9 / 16 > Math.abs(target.height - current.height)) {
    return {
      height: target.height,
      width: Math.round(current.width * target.height / current.height)
    }
  }
  return {
    height: Math.round(current.height * target.width / current.width),
    width: target.width
  }
}

function formatDate (d) {
  return `${d.getFullYear()}${(d.getMonth() + 1)}${d.getDate()}-${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}${pad(d.getSeconds(), 2)}`;
}

function pad (num, size) {
  let s = num + "";
  while (s.length < size) {
    s = "0" + s;
  }
  return s;
}