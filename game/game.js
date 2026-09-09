(() => {
  "use strict";

  const WIDTH = 960;
  const HEIGHT = 540;

  const PLOT_SIZE = 380;
  const PLOT_Y_OFFSET = 20;

  const GRID_COLS = 20;
  const GRID_ROWS = 20;
  const CELL_WIDTH = PLOT_SIZE / GRID_COLS;
  const CELL_HEIGHT = PLOT_SIZE / GRID_ROWS;

  const state = {
    gold: 100,
    xp: 0,
    level: 1,
  };

  class SeedhavenScene extends Phaser.Scene {
    constructor() {
      super("SeedhavenScene");
      this.gridCells = [];
      this.gridDebug = false;
    }

    preload() {
      this.load.image("plot-base", "../public/assets/plots/plot-base.png");
      this.load.image("game-bg", "../public/assets/backgrounds/game-bg.png");
      this.load.image("logo", "../public/assets/ui/logo.png");
    }

    create() {
      this.drawWorld();
      this.createGrid();
      this.createHud();

      // Aperte G para mostrar/esconder o grid durante o desenvolvimento.
      this.input.keyboard.on("keydown-G", () => {
        this.gridDebug = !this.gridDebug;
        this.refreshGridDebug();
      });
    }

    drawWorld() {
      this.add
        .image(WIDTH / 2, HEIGHT / 2, "game-bg")
        .setOrigin(0.5)
        .setDisplaySize(WIDTH, HEIGHT)
        .setDepth(-10);

      this.plotBase = this.add
        .image(WIDTH / 2, HEIGHT / 2 + PLOT_Y_OFFSET, "plot-base")
        .setOrigin(0.5)
        .setDisplaySize(PLOT_SIZE, PLOT_SIZE)
        .setDepth(0);
    }

    createGrid() {
      const plotCenterX = WIDTH / 2;
      const plotCenterY = HEIGHT / 2 + PLOT_Y_OFFSET;

      const startX = plotCenterX - PLOT_SIZE / 2;
      const startY = plotCenterY - PLOT_SIZE / 2;

      for (let row = 0; row < GRID_ROWS; row += 1) {
        for (let col = 0; col < GRID_COLS; col += 1) {
          const x = startX + col * CELL_WIDTH + CELL_WIDTH / 2;
          const y = startY + row * CELL_HEIGHT + CELL_HEIGHT / 2;

          const cell = this.add
            .rectangle(x, y, CELL_WIDTH, CELL_HEIGHT, 0xffffff, 0)
            .setStrokeStyle(1, 0xffffff, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(5);

          cell.gridCol = col;
          cell.gridRow = row;

          cell.on("pointerover", () => {
            if (!this.gridDebug) return;
            cell.setFillStyle(0xffffff, 0.16);
          });

          cell.on("pointerout", () => {
            if (!this.gridDebug) return;
            cell.setFillStyle(0xffffff, 0.05);
          });

          cell.on("pointerdown", () => {
            console.log(`Grid cell clicked -> col: ${col}, row: ${row}`);
          });

          this.gridCells.push(cell);
        }
      }

      this.refreshGridDebug();
    }

    refreshGridDebug() {
      this.gridCells.forEach((cell) => {
        if (this.gridDebug) {
          cell.setFillStyle(0xffffff, 0.05);
          cell.setStrokeStyle(1, 0xffffff, 0.35);
        } else {
          cell.setFillStyle(0xffffff, 0);
          cell.setStrokeStyle(1, 0xffffff, 0);
        }
      });
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
