import Phaser from 'phaser';

export default class StoryScene extends Phaser.Scene {
  constructor() {
    super('StoryScene');
  }

  preload() {}

  create(data) {
    const seed = data?.seed || 'default-seed';
    this.cameras.main.setBackgroundColor('#1c1f24');
    const floor = this.add.rectangle(400, 300, 800, 600, 0x1c1f24);
    const walls = this.add.graphics();
    walls.fillStyle(0x000000, 1); walls.fillRect(0, 0, 800, 10); walls.fillRect(0, 590, 800, 10); walls.fillRect(0, 0, 10, 600); walls.fillRect(790, 0, 10, 600);

    this.add.text(400, 60, "Opening Patient Room", { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
    this.add.text(400, 90, 'WASD to move · E to interact · Q swaps layers later', { fontSize: '14px', color: '#aaa' }).setOrigin(0.5);

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

    // Interactables
    this.player = this.physics.add.sprite(400, 420, 'player').setScale(0.5).setTint(0xd36ff0);
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      E: Phaser.Input.Keyboard.KeyCodes.E
    });

    const mk = (x, y, w, h, color, label, onInteract) => {
      const r = this.add.rectangle(x, y, w, h, color);
      this.physics.add.existing(r, true);
      this.add.text(x, y - h / 2 - 12, label, { fontSize: '12px', color: '#fff' }).setOrigin(0.5);
      return { r, onInteract };
    };

    this.bed = mk(200, 300, 120, 50, 0x3498db, 'Bed (E)', () => this.promptLieDown(seed));
    this.desk = mk(400, 250, 140, 40, 0x8e5a2a, 'Desk (E)', () => this.overlay("There’s a note: ‘This isn’t your chart.’"));
    this.tv = mk(600, 260, 80, 50, 0x7f8c8d, 'TV (E)', () => this.overlay('You’re awake… Code blue…'));
    this.lockedDoor = mk(760, 300, 30, 120, 0xe74c3c, 'Locked Door', () => this.overlay('The door is locked during orientation.'));

    this.physics.add.collider(this.player, [this.bed.r, this.desk.r, this.tv.r, this.lockedDoor.r]);

    this.input.keyboard.on('keydown-E', () => {
      for (const it of [this.bed, this.desk, this.tv, this.lockedDoor]) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), it.r.getBounds())) {
          it.onInteract();
          break;
        }
      }
    });
  }

  overlay(text) {
    const t = this.add.text(400, 520, text, { fontSize: '14px', color: '#fff', wordWrap: { width: 760 } }).setOrigin(0.5);
    this.time.delayedCall(1600, () => t.destroy());
  }

  promptLieDown(seed) {
    const t = this.add.text(400, 520, 'Lie down? (E to confirm)', { fontSize: '14px', color: '#fff' }).setOrigin(0.5);
    const onE = () => {
      this.input.keyboard.off('keydown-E', onE);
      t.destroy();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('WardScene', { seed, phase1: true });
      });
    };
    this.input.keyboard.once('keydown-E', onE);
  }
}


