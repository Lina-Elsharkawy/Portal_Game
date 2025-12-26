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

  // --- NEW: Truth Check Function ---
  isMusicLoopActive() {
    // 1. Is the engine actually running?
    if (this.ctx.state !== 'running') return false;
    
    // 2. Do we think we are playing?
    if (!this.isMusicPlaying) return false;

    // 3. Do the nodes actually exist? (Prevents "Ghost" state)
    if (this.musicNodes.length === 0) return false;

    return true;
  }
  // --------------------------------

  async init() {
    // Force Resume (Wait for it!)
    if (this.ctx.state === 'suspended') {
        try {
            await this.ctx.resume();
        } catch (e) {
            console.warn("Audio Resume failed:", e);
        }
    }

    this.enabled = true;

    // Use our new check to decide if we need to start music
    if (!this.isMusicLoopActive()) {
        this.startAmbientMusic();
    }
  }

  startAmbientMusic() {
    // Safety: Stop any potential duplicates first
    this.stopMusic();

    console.log("🎵 Starting Music Loop...");

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // 50Hz Settings
    osc1.frequency.value = 130; 
    osc2.frequency.value = 50; 
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    gain.gain.value = 0.2; 

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    osc1.start(now + 0.2);
    osc2.start(now + 0.2);

    this.musicNodes = [osc1, osc2, gain];
    this.isMusicPlaying = true;
  }

  stopMusic() {
    this.musicNodes.forEach(node => {
      try { node.stop(); node.disconnect(); } catch(e){}
    });
    this.musicNodes = [];
    this.isMusicPlaying = false;
  }
  
  playJump() {
    if (!this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
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
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
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
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
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
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }
}

export const audioManager = new AudioManager();