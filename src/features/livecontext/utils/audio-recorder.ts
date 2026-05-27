export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private onDataAvailable: (base64Data: string) => void;
  private onAmplitude?: (amplitude: number) => void;

  constructor(
    onDataAvailable: (base64Data: string) => void,
    onAmplitude?: (amplitude: number) => void
  ) {
    this.onDataAvailable = onDataAvailable;
    this.onAmplitude = onAmplitude;
  }

  async start() {
    console.log('🎤 [AudioRecorder] Requesting microphone access...');
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);

      if (this.onAmplitude) {
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        this.onAmplitude(rms);
      }

      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      const bytes = new Uint8Array(pcmData.buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      this.onDataAvailable(base64);
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    console.log('🎤 [AudioRecorder] ✅ Recording started (16kHz PCM)');
  }

  stop() {
    console.log('🎤 [AudioRecorder] Stopping...');
    if (this.processor && this.source) {
      this.processor.disconnect();
      this.source.disconnect();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.stream = null;
    this.audioContext = null;
    this.source = null;
    this.processor = null;
    console.log('🎤 [AudioRecorder] ✅ Stopped');
  }
}
