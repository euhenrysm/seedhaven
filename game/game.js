(() => {
  "use strict";

  const WIDTH = 960;
  const HEIGHT = 540;

  const state = {
    gold: 100,
    xp: 0,
    level: 1,
  };

  class SeedhavenScene extends Phaser.Scene {
    constructor() {
      super("SeedhavenScene");
    }

    preload() {
      this.load.image("plot-base", "../public/assets/plots/plot-base.png");
      this.load.image("game-bg", "../public/assets/backgrounds/game-bg.png");
      this.load.image("logo", "../public/assets/ui/logo.png");
    }

    create() {
      this.drawWorld();
      this.createHud();
    }

    drawWorld() {
      this.add
        .image(WIDTH / 2, HEIGHT / 2, "game-bg")
        .setOrigin(0.5)
        .setDisplaySize(WIDTH, HEIGHT)
        .setDepth(-10);

      this.plotBase = this.add
        .image(WIDTH / 2, HEIGHT / 2, "plot-base")
        .setOrigin(0.5)
        .setDisplaySize(540, 540)
        .setDepth(0);
    }

    createHud() {
      this.add
        .rectangle(480, 35, 920, 56, 0xffffff, 0.94)
        .setStrokeStyle(1, 0xdce5d4)
        .setOrigin(0.5)
        .setDepth(10);

      this.add
        .image(115, 35, "logo")
        .setOrigin(0.5)
        .setDisplaySize(150, 54)
        .setDepth(20);

      const hudStyle = {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#42513e",
      };

      this.add
        .text(355, 27, `🪙 ${state.gold} Gold`, hudStyle)
        .setDepth(20);

      this.add
        .text(830, 27, `Level ${state.level}  •  ${state.xp} XP`, hudStyle)
        .setOrigin(1, 0)
        .setDepth(20);
    }
  }

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "#8bcf68",
    scene: SeedhavenScene,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: false,
      pixelArt: true,
    },
  });
})();
