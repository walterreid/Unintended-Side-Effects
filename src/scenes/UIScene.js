import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  init(data) {
    this.seed = data?.seed;
  }

  create() {
    this.healthText = this.add.text(10, 8, 'HP: 100', { fontSize: '14px', color: '#fff' }).setScrollFactor(0);
    this.insightText = this.add.text(120, 8, 'Insight: 0', { fontSize: '14px', color: '#fff' }).setScrollFactor(0);
    this.auditText = this.add.text(260, 8, 'Audit: --:--', { fontSize: '14px', color: '#ff7777' }).setScrollFactor(0);
    this.inventoryText = this.add.text(10, 28, 'Loadout: -', { fontSize: '14px', color: '#aaa' }).setScrollFactor(0);

    this.events.on('updateHUD', (hud) => {
      if (hud.health != null) this.healthText.setText(`HP: ${hud.health}`);
      if (hud.insight != null) this.insightText.setText(`Insight: ${hud.insight}`);
      if (hud.audit != null) this.auditText.setText(`Audit: ${hud.audit}`);
      if (hud.loadout != null) this.inventoryText.setText(`Loadout: ${hud.loadout}`);
    });

    this.events.on('discharge', (summary) => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        const { seed, durationSec, traits, result } = summary;
        this.scene.stop('WardScene');
        this.scene.stop('DreamScene');
        this.scene.stop('BossScene');
        this.scene.launch('StoryScene'); // reuse as summary host or make a new DischargeScene later
        this.add.text(400, 300, `Discharge Summary\nSeed: ${seed}\nTime: ${durationSec}s\nTraits: ${traits.join(', ')}\nResult: ${result}`, { fontSize: '16px', color: '#fff', align: 'center' }).setOrigin(0.5);
      });
    });
  }
}


