import { formatDate } from "./utils";

export class Recorder {
  constructor (canvas, recorderOptions) {
    this.stream = canvas.captureStream();
    const { mediaRecorderOptions, blobOptions } = recorderOptions
    this.setupMediaRecorder(mediaRecorderOptions)
    this.recordedBlobs = []
    this.blobOptions = blobOptions
    this.ctx = canvas.getContext('webgl')
    this.animationLoop = this.animationLoop.bind(this)
  }

  handleDataAvailable (event) {
    if (event.data && event.data.size > 0) {
      this.recordedBlobs.push(event.data);
    }
  }

  setupMediaRecorder (options){
    if (options == null){
      options = { mimeType: 'video/webm' };
    }
    let mediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (e0) {
      console.log('Unable to create MediaRecorder with options Object: ', e0);
      try {
        options = { mimeType: 'video/webm,codecs=vp9' };
        mediaRecorder = new MediaRecorder(this.stream, options);
      } catch (e1) {
        console.log('Unable to create MediaRecorder with options Object: ', e1);
        try {
          options = { mimeType: 'video/webm,codecs=vp8' }; // Chrome 47
          mediaRecorder = new MediaRecorder(this.stream, options);
        } catch (e2) {
          alert('MediaRecorder is not supported by this browser.\n\n'
              + 'Try Firefox 29 or later, or Chrome 47 or later, '
              + 'with Enable experimental Web Platform features enabled from chrome://flags.');
          console.error('Exception while creating MediaRecorder:', e2);
          return;
        }
      }
    }
    mediaRecorder.ondataavailable = evt => this.handleDataAvailable(evt);
    mediaRecorder.onstart = () => this.animationLoop();

    this.mediaRecorder = mediaRecorder
    this.options = options
    if (!this.blobOptions){
      const { mimeType } = options
      this.blobOptions = { type: mimeType }
    }
  }

  startRecording (){
    this.recordedBlobs = []
    this.mediaRecorder.start(100);
  }

  stopRecording (options){
    this.mediaRecorder.stop();
    return this.getRecordingBlob(options)
  }

  download (filename, options){
    if (!filename){
      filename = `CanvasRecording_${formatDate(new Date())}.webm`
    }
    const blob = this.getRecordingBlob(options)
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
    return blob
  }

  getRecordingBlob (options){
    if (!options){
      options = this.blobOptions
    }
    return new Blob(this.recordedBlobs, options);
  }

  animationLoop () {
    // draw nothing, but still draw
    this.ctx.drawArrays(this.ctx.POINTS, 0, 0)
    if (this.mediaRecorder.state !== "inactive") {
      requestAnimationFrame(this.animationLoop);
    }
  }
}