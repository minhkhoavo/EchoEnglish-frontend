export class AudioStreamer {
  private audioContext: AudioContext | null = null;
  private scheduledTime: number = 0;
  private chunkCount: number = 0;

  constructor() {
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    console.log('🔊 [AudioStreamer] Initialized (24kHz output)');
  }

  async addPCM16(base64Data: string) {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 24000 });
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    const audioBuffer = this.audioContext.createBuffer(
      1,
      float32.length,
      24000
    );
    audioBuffer.getChannelData(0).set(float32);

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    const currentTime = this.audioContext.currentTime;
    if (this.scheduledTime < currentTime) {
      this.scheduledTime = currentTime;
    }

    source.start(this.scheduledTime);
    this.scheduledTime += audioBuffer.duration;
    this.chunkCount++;

    if (this.chunkCount % 20 === 0) {
      console.log(`🔊 [AudioStreamer] Played ${this.chunkCount} audio chunks`);
    }
  }

  async stop() {
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
      this.scheduledTime = 0;
      this.chunkCount = 0;
      console.log('🔊 [AudioStreamer] Stopped');
    }
  }
}
