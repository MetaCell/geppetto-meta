export class Recorder {
  constructor (canvas) {
    this.stream = canvas.captureStream();
    this.setupMediaRecorder()
    this.recordedBlobs = []
  }

  handleDataAvailable (event) {
    if (event.data && event.data.size > 0) {
      this.recordedBlobs.push(event.data);
    }
  }

  setupMediaRecorder (){
    let options = { mimeType: 'video/webm' };
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
          options = 'video/vp8'; // Chrome 47
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
    this.mediaRecorder = mediaRecorder
    this.options = options
  }

  startRecording (){
    this.recordedBlobs = []
    this.mediaRecorder.start();
  }

  stopRecording (){
    this.mediaRecorder.stop();
  }

  download (filename){
    if (!filename){
      filename = `${Math.random().toString(36).slice(2)}.webm`
    }
    const blob = new Blob(this.recordedBlobs, this.options);
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
    return filename
  }

  getRecordedBlobs(){
    return this.recordedBlobs
  }

  getOptions(){
    return this.options
  }

}