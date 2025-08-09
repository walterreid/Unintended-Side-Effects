import Phaser from 'phaser';

export default class StoryScene extends Phaser.Scene {
  constructor() {
    super('StoryScene');
  }

  preload() {
    this.load.audio('pa_crackle', 'assets/audio/pa_crackle.mp3');
  }

  create(data) {
    const seed = data?.seed || 'default-seed';
    const text = this.add.text(400, 300, "You're awake.", { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
    const sub = this.add.text(400, 360, 'The ward is not what it seems…', { fontSize: '16px', color: '#aaa' }).setOrigin(0.5);

    const s = this.sound.add('pa_crackle', { volume: 0.4 });
    s.play();

    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
    });
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('WardScene', { seed });
    });
  }
}


