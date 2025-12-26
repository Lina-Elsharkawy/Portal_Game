export class AudioManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3; 
    this.masterGain.connect(this.ctx.destination);
    
    this.enabled = false;
    this.isMusicPlaying = false;
    this.musicNodes = []; 
  }

  isMusicLoopActive() {
    if (this.ctx.state !== 'running') return false;
    if (!this.isMusicPlaying) return false;
    if (this.musicNodes.length === 0) return false;
    return true;
  }

  async init() {
    if (this.ctx.state === 'suspended') {
        try { await this.ctx.resume(); } catch (e) {}
    }
    this.enabled = true;

    if (!this.isMusicLoopActive()) {
        this.startAmbientMusic();
    }
  }

  startAmbientMusic() {
    this.stopMusic();

    console.log("🎵 Starting Brown Noise Atmosphere...");

    // 1. Create a buffer for 5 seconds of noise
    const bufferSize = this.ctx.sampleRate * 5; 
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    
    // 2. Generate Brown Noise (Soft, deep rumble)
    // Brown noise is random, but each step is small relative to the last.
    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            // This math smoothes out the harshness of standard "white" noise
            const white = Math.random() * 2 - 1;
            lastOut = (lastOut + (0.02 * white)) / 1.02;
            data[i] = lastOut * 3.5; // Multiply to compensate for gain loss
        }
    }

    // 3. Create Source
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // 4. Low Pass Filter (The "Inside a Helmet" effect)
    // Cuts off everything above 150Hz. No hissing, just rumble.
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150; 

    // 5. Volume
    const gain = this.ctx.createGain();
    gain.gain.value = 0.4; // Can be higher because noise is naturally quiet

    // Connect
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start();

    // Store nodes
    this.musicNodes = [noiseSource, filter, gain];
    this.isMusicPlaying = true;
  }

  stopMusic() {
    this.musicNodes.forEach(node => {
      try { 
        if(node.stop) node.stop(); 
        node.disconnect(); 
      } catch(e){}
    });
    this.musicNodes = [];
    this.isMusicPlaying = false;
  }

  // --- SFX ---

  playJump() {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime); // Lowered volume
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playPortalShoot(type) {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.type = 'sawtooth';
    const startFreq = type === 'blue' ? 880 : 600; 
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playStep() {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime); // Very quiet
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playDeath() {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }
}

export const audioManager = new AudioManager();