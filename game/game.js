(() => {
  "use strict";

  const WIDTH = 960;
  const HEIGHT = 540;

  // Plot
  const PLOT_SIZE = 380;
  const PLOT_Y_OFFSET = 20;

  // Grid alinhado ao visual do plot
  const GRID_COLS = 20;
  const GRID_ROWS = 20;
  const CELL_WIDTH = PLOT_SIZE / GRID_COLS;
  const CELL_HEIGHT = PLOT_SIZE / GRID_ROWS;

  const FONT_FAMILY = '"Pixelify Sans", sans-serif';

  const state = {
    gold: 100,
    xp: 0,
    level: 1,
    inventory: [],
  };

  class SeedhavenScene extends Phaser.Scene {
    constructor() {
      super("SeedhavenScene");

      this.gridCells = [];
      this.gridDebug = false;
      this.basketPanel = null;
    }

    preload() {
      this.load.image(
        "plot-base",
        "../public/assets/plots/plot-base.png"
      );

      this.load.image(
        "game-bg",
        "../public/assets/backgrounds/game-bg.png"
      );

      this.load.image(
        "logo",
        "../public/assets/ui/logo.png"
      );

      this.load.image(
        "backpack-level",
        "../public/assets/ui/backpack-level.png"
      );
    }

    create() {
      this.drawWorld();
      this.createGrid();
      this.createHud();
      this.createBasket();

      // Debug do grid: aperte G para mostrar/esconder
      this.input.keyboard.on("keydown-G", () => {
        this.gridDebug = !this.gridDebug;
        this.refreshGridDebug();
      });
    }

    drawWorld() {
      // Background geral
      this.add
        .image(WIDTH / 2, HEIGHT / 2, "game-bg")
        .setOrigin(0.5)
        .setDisplaySize(WIDTH, HEIGHT)
        .setDepth(-10);

      // Base fixa do plot
      this.plotBase = this.add
        .image(
          WIDTH / 2,
          HEIGHT / 2 + PLOT_Y_OFFSET,
          "plot-base"
        )
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
          const x =
            startX +
            col * CELL_WIDTH +
            CELL_WIDTH / 2;

          const y =
            startY +
            row * CELL_HEIGHT +
            CELL_HEIGHT / 2;

          const cell = this.add
            .rectangle(
              x,
              y,
              CELL_WIDTH,
              CELL_HEIGHT,
              0xffffff,
              0
            )
            .setStrokeStyle(1, 0xffffff, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(5);

          cell.gridCol = col;
          cell.gridRow = row;
          cell.occupied = false;
          cell.object = null;

          cell.on("pointerover", () => {
            if (!this.gridDebug) return;
            cell.setFillStyle(0xffffff, 0.16);
          });

          cell.on("pointerout", () => {
            if (!this.gridDebug) return;
            cell.setFillStyle(0xffffff, 0.05);
          });

          cell.on("pointerdown", () => {
            console.log(
              `Grid cell clicked -> col: ${col}, row: ${row}`
            );
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
      // Barra superior
      this.add
        .rectangle(
          WIDTH / 2,
          42,
          920,
          68,
          0xffffff,
          0.92
        )
        .setStrokeStyle(1, 0xdce5d4)
        .setOrigin(0.5)
        .setDepth(20);

      // Mochila / botão do Basket
      const backpack = this.add
        .image(72, 53, "backpack-level")
        .setOrigin(0.5)
        .setDisplaySize(82, 82)
        .setDepth(30)
        .setInteractive({ useHandCursor: true });

      // Número do level sobre a plaquinha do asset
      this.levelText = this.add
        .text(93, 64, `${state.level}`, {
          fontFamily: FONT_FAMILY,
          fontSize: "12px",
          fontStyle: "bold",
          color: "#3b2417",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(31);

      backpack.on("pointerdown", () => {
        this.toggleBasket();
      });

      // Logo do projeto
      this.add
        .image(210, 42, "logo")
        .setOrigin(0.5)
        .setDisplaySize(135, 49)
        .setDepth(30);

      // Gold
      this.goldText = this.add
        .text(470, 42, `🪙 ${state.gold} Gold`, {
          fontFamily: FONT_FAMILY,
          fontSize: "18px",
          fontStyle: "600",
          color: "#3b4938",
        })
        .setOrigin(0.5)
        .setDepth(30);

      // XP
      this.xpText = this.add
        .text(875, 42, `${state.xp} XP`, {
          fontFamily: FONT_FAMILY,
          fontSize: "17px",
          fontStyle: "600",
          color: "#3b4938",
        })
        .setOrigin(1, 0.5)
        .setDepth(30);
    }

    createBasket() {
      this.basketPanel = this.add
        .container(WIDTH / 2, HEIGHT / 2)
        .setDepth(200)
        .setVisible(false);

      // Fundo escuro clicável
      const overlay = this.add
        .rectangle(
          0,
          0,
          WIDTH,
          HEIGHT,
          0x102014,
          0.45
        )
        .setInteractive();

      // Painel principal
      const panel = this.add
        .rectangle(
          0,
          0,
          620,
          390,
          0xe7a66e,
          1
        )
        .setStrokeStyle(5, 0x5c3527, 1);

      // Barra de título
      const titleBar = this.add
        .rectangle(
          0,
          -165,
          600,
          48,
          0xc98467,
          1
        )
        .setStrokeStyle(2, 0x5c3527, 1);

      const title = this.add
        .text(-270, -165, "Basket", {
          fontFamily: FONT_FAMILY,
          fontSize: "24px",
          fontStyle: "bold",
          color: "#3a241d",
        })
        .setOrigin(0, 0.5);

      const close = this.add
        .text(270, -165, "X", {
          fontFamily: FONT_FAMILY,
          fontSize: "28px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      // Área dos slots
      const inventoryArea = this.add
        .rectangle(
          -42,
          33,
          500,
          300,
          0xf2bf8d,
          1
        )
        .setStrokeStyle(3, 0x6b4130, 1);

      this.basketPanel.add([
        overlay,
        panel,
        titleBar,
        title,
        close,
        inventoryArea,
      ]);

      this.createBasketSlots();

      close.on("pointerdown", () => {
        this.toggleBasket(false);
      });

      overlay.on("pointerdown", () => {
        this.toggleBasket(false);
      });
    }

    createBasketSlots() {
      const cols = 6;
      const rows = 4;
      const slotSize = 58;
      const gap = 12;

      const totalWidth =
        cols * slotSize + (cols - 1) * gap;

      const totalHeight =
        rows * slotSize + (rows - 1) * gap;

      const startX = -42 - totalWidth / 2 + slotSize / 2;
      const startY = 33 - totalHeight / 2 + slotSize / 2;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = startX + col * (slotSize + gap);
          const y = startY + row * (slotSize + gap);

          const slot = this.add
            .rectangle(
              x,
              y,
              slotSize,
              slotSize,
              0xf8d6ab,
              1
            )
            .setStrokeStyle(3, 0x684333, 1);

          this.basketPanel.add(slot);
        }
      }
    }

    toggleBasket(forceState) {
      if (!this.basketPanel) return;

      const shouldShow =
        typeof forceState === "boolean"
          ? forceState
          : !this.basketPanel.visible;

      this.basketPanel.setVisible(shouldShow);
    }
  }

  const config = {
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
  };

  // Espera a Pixelify Sans carregar antes de iniciar o Phaser.
  const startGame = () => {
    new Phaser.Game(config);
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(startGame);
  } else {
    startGame();
  }
})();
