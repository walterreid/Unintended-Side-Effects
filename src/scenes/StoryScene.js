import Phaser from 'phaser';

export default class StoryScene extends Phaser.Scene {
  constructor() {
    super('StoryScene');
  }

  preload() {}

  create(data) {
    const seed = data?.seed || 'default-seed';
    const text = this.add.text(400, 300, "You're awake.", { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
    const sub = this.add.text(400, 360, 'The ward is not what it seems…', { fontSize: '16px', color: '#aaa' }).setOrigin(0.5);

    const playCrackle = () => {
      try {
        const ctx = this.sound.context;
        const duration = 0.25;
        const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const fadeIn = Math.min(1, i / 800);
          const fadeOut = 1 - i / data.length;
          data[i] = (Math.random() * 2 - 1) * 0.7 * fadeIn * fadeOut;
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = 0.3;
        src.connect(gain).connect(ctx.destination);
        src.start();
      } catch (_) {}
    };

    if (this.sound.locked) {
      this.sound.once('unlocked', playCrackle);
    } else {
      playCrackle();
    }

    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
    });
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('WardScene', { seed });
    });
  }
}


