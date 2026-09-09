(() => {
  "use strict";

  const WIDTH = 960;
  const HEIGHT = 540;

  // =========================
  // PLOT
  // =========================
  const PLOT_SIZE = 380;
  const PLOT_Y_OFFSET = 20;

  // =========================
  // GRID
  // =========================
  const GRID_COLS = 20;
  const GRID_ROWS = 20;
  const CELL_WIDTH = PLOT_SIZE / GRID_COLS;
  const CELL_HEIGHT = PLOT_SIZE / GRID_ROWS;

  // Limite plantável dentro da área verde
  const PLANTABLE_MARGIN_LEFT = 20;
  const PLANTABLE_MARGIN_RIGHT = 20;
  const PLANTABLE_MARGIN_TOP = 22;
  const PLANTABLE_MARGIN_BOTTOM = 48;
  const PLANTABLE_CORNER_RADIUS = 38;

  // =========================
  // FONT
  // =========================
  const FONT_FAMILY = '"Pixelify Sans", sans-serif';

  // =========================
  // TEMPO DE TESTE DA CENOURA
  // stage 1 -> stage 2 -> stage 3
  // =========================
  const CARROT_STAGE_2_MS = 5_000;
  const CARROT_READY_MS = 10_000;

  // =========================
  // ESTADO DO JOGO
  // =========================
  const state = {
    gold: 100,
    xp: 0,
    level: 1,

    // Temporário para testarmos o plantio
    selectedCrop: "carrot",

    inventory: {
      carrot: 0,
    },
  };

  class SeedhavenScene extends Phaser.Scene {
    constructor() {
      super("SeedhavenScene");

      this.gridCells = [];
      this.gridDebug = false;
      this.basketPanel = null;
    }

    preload() {
      // Mundo
      this.load.image(
        "plot-base",
        "../public/assets/plots/plot-base.png"
      );

      this.load.image(
        "game-bg",
        "../public/assets/backgrounds/game-bg.png"
      );

      // UI
      this.load.image(
        "logo",
        "../public/assets/ui/logo.png"
      );

      this.load.image(
        "backpack-level",
        "../public/assets/ui/backpack-level.png"
      );

      // Cenoura - 3 estágios
      this.load.image(
        "carrot-stage-1",
        "../public/assets/crops/carrot/carrot-stage-1.png"
      );

      this.load.image(
        "carrot-stage-2",
        "../public/assets/crops/carrot/carrot-stage-2.png"
      );

      this.load.image(
        "carrot-stage-3",
        "../public/assets/crops/carrot/carrot-stage-3.png"
      );
    }

    create() {
      this.drawWorld();
      this.createGrid();
      this.createHud();
      this.createBasket();

      // G = mostrar/esconder grid de desenvolvimento
      this.input.keyboard.on("keydown-G", () => {
        this.gridDebug = !this.gridDebug;
        this.refreshGridDebug();
      });
    }

    // =========================
    // MUNDO
    // =========================
    drawWorld() {
      this.add
        .image(WIDTH / 2, HEIGHT / 2, "game-bg")
        .setOrigin(0.5)
        .setDisplaySize(WIDTH, HEIGHT)
        .setDepth(-10);

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

    // =========================
    // LIMITADOR PLANTÁVEL
    // =========================
    isPlantablePosition(x, y) {
      const plotCenterX = WIDTH / 2;
      const plotCenterY = HEIGHT / 2 + PLOT_Y_OFFSET;

      const plotLeft = plotCenterX - PLOT_SIZE / 2;
      const plotTop = plotCenterY - PLOT_SIZE / 2;

      const left = plotLeft + PLANTABLE_MARGIN_LEFT;
      const right =
        plotLeft + PLOT_SIZE - PLANTABLE_MARGIN_RIGHT;

      const top = plotTop + PLANTABLE_MARGIN_TOP;
      const bottom =
        plotTop + PLOT_SIZE - PLANTABLE_MARGIN_BOTTOM;

      if (
        x < left ||
        x > right ||
        y < top ||
        y > bottom
      ) {
        return false;
      }

      const radius = PLANTABLE_CORNER_RADIUS;

      // Área central horizontal
      if (
        x >= left + radius &&
        x <= right - radius
      ) {
        return true;
      }

      // Área central vertical
      if (
        y >= top + radius &&
        y <= bottom - radius
      ) {
        return true;
      }

      // Cantos arredondados
      const cornerX =
        x < left + radius
          ? left + radius
          : right - radius;

      const cornerY =
        y < top + radius
          ? top + radius
          : bottom - radius;

      const dx = x - cornerX;
      const dy = y - cornerY;

      return dx * dx + dy * dy <= radius * radius;
    }

    // =========================
    // GRID
    // =========================
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

          const plantable =
            this.isPlantablePosition(x, y);

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
            .setInteractive({ useHandCursor: plantable })
            .setDepth(5);

          cell.gridCol = col;
          cell.gridRow = row;
          cell.plantable = plantable;
          cell.occupied = false;
          cell.object = null;

          cell.on("pointerover", () => {
            if (!this.gridDebug) return;

            if (cell.plantable) {
              cell.setFillStyle(0xffffff, 0.15);
            } else {
              cell.setFillStyle(0x000000, 0.12);
            }
          });

          cell.on("pointerout", () => {
            if (!this.gridDebug) return;

            if (cell.plantable) {
              cell.setFillStyle(0xffffff, 0.04);
            } else {
              cell.setFillStyle(0x000000, 0.08);
            }
          });

          cell.on("pointerdown", () => {
            this.handleCellClick(cell);
          });

          this.gridCells.push(cell);
        }
      }

      this.refreshGridDebug();
    }

    refreshGridDebug() {
      this.gridCells.forEach((cell) => {
        if (!this.gridDebug) {
          cell.setFillStyle(0xffffff, 0);
          cell.setStrokeStyle(1, 0xffffff, 0);
          return;
        }

        if (cell.plantable) {
          cell.setFillStyle(0xffffff, 0.04);
          cell.setStrokeStyle(1, 0xffffff, 0.35);
        } else {
          cell.setFillStyle(0x000000, 0.08);
          cell.setStrokeStyle(1, 0xff6b6b, 0.35);
        }
      });
    }

    handleCellClick(cell) {
      if (!cell.plantable) {
        console.log(
          `Área bloqueada -> col: ${cell.gridCol}, row: ${cell.gridRow}`
        );
        return;
      }

      if (!cell.occupied) {
        if (state.selectedCrop === "carrot") {
          this.plantCarrot(cell);
        }

        return;
      }

      // Se a cenoura já estiver pronta, clicar colhe.
      if (
        cell.object &&
        cell.object.type === "crop" &&
        cell.object.crop === "carrot" &&
        cell.object.stage === 3
      ) {
        this.harvestCarrot(cell);
      }
    }

    // =========================
    // CENOURA
    // =========================
    plantCarrot(cell) {
      if (cell.occupied) return;

      cell.occupied = true;

      const cropSprite = this.add
        .image(cell.x, cell.y, "carrot-stage-1")
        .setOrigin(0.5)
        .setDisplaySize(
          CELL_WIDTH * 1.35,
          CELL_HEIGHT * 1.35
        )
        .setDepth(8);

      cell.object = {
        type: "crop",
        crop: "carrot",
        stage: 1,
        sprite: cropSprite,
        stageTwoTimer: null,
        readyTimer: null,
      };

      // Metade do tempo
      cell.object.stageTwoTimer =
        this.time.delayedCall(
          CARROT_STAGE_2_MS,
          () => {
            if (
              !cell.object ||
              cell.object.crop !== "carrot"
            ) {
              return;
            }

            cell.object.stage = 2;
            cell.object.sprite.setTexture(
              "carrot-stage-2"
            );
          }
        );

      // Pronta para colher
      cell.object.readyTimer =
        this.time.delayedCall(
          CARROT_READY_MS,
          () => {
            if (
              !cell.object ||
              cell.object.crop !== "carrot"
            ) {
              return;
            }

            cell.object.stage = 3;
            cell.object.sprite.setTexture(
              "carrot-stage-3"
            );
          }
        );

      console.log(
        `Carrot planted -> col: ${cell.gridCol}, row: ${cell.gridRow}`
      );
    }

    harvestCarrot(cell) {
      if (
        !cell.object ||
        cell.object.crop !== "carrot" ||
        cell.object.stage !== 3
      ) {
        return;
      }

      if (cell.object.sprite) {
        cell.object.sprite.destroy();
      }

      if (cell.object.stageTwoTimer) {
        cell.object.stageTwoTimer.remove(false);
      }

      if (cell.object.readyTimer) {
        cell.object.readyTimer.remove(false);
      }

      cell.object = null;
      cell.occupied = false;

      state.inventory.carrot += 1;

      this.updateBasketInfo();

      console.log(
        `Carrot harvested. Total: ${state.inventory.carrot}`
      );
    }

    // =========================
    // LEVEL BADGE
    // =========================
    getLevelBadgeConfig(level) {
      const digits = String(level).length;

      if (digits === 1) {
        return {
          x: 94,
          y: 63,
          fontSize: "10px",
        };
      }

      if (digits === 2) {
        return {
          x: 94,
          y: 63,
          fontSize: "8px",
        };
      }

      return {
        x: 94,
        y: 63,
        fontSize: "7px",
      };
    }

    // =========================
    // HUD
    // =========================
    createHud() {
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

      // Mochila / Basket
      const backpack = this.add
        .image(72, 53, "backpack-level")
        .setOrigin(0.5)
        .setDisplaySize(82, 82)
        .setDepth(30)
        .setInteractive({ useHandCursor: true });

      const levelConfig =
        this.getLevelBadgeConfig(state.level);

      this.levelText = this.add
        .text(
          levelConfig.x,
          levelConfig.y,
          `${state.level}`,
          {
            fontFamily: FONT_FAMILY,
            fontSize: levelConfig.fontSize,
            fontStyle: "bold",
            color: "#3b2417",
            align: "center",
          }
        )
        .setOrigin(0.5)
        .setDepth(31);

      backpack.on("pointerdown", () => {
        this.toggleBasket();
      });

      // Logo
      this.add
        .image(210, 42, "logo")
        .setOrigin(0.5)
        .setDisplaySize(135, 49)
        .setDepth(30);

      // Gold
      this.goldText = this.add
        .text(
          470,
          42,
          `🪙 ${state.gold} Gold`,
          {
            fontFamily: FONT_FAMILY,
            fontSize: "18px",
            fontStyle: "bold",
            color: "#3b4938",
          }
        )
        .setOrigin(0.5)
        .setDepth(30);

      // XP
      this.xpText = this.add
        .text(
          875,
          42,
          `${state.xp} XP`,
          {
            fontFamily: FONT_FAMILY,
            fontSize: "17px",
            fontStyle: "bold",
            color: "#3b4938",
          }
        )
        .setOrigin(1, 0.5)
        .setDepth(30);
    }

    // =========================
    // BASKET
    // =========================
    createBasket() {
      this.basketPanel = this.add
        .container(WIDTH / 2, HEIGHT / 2)
        .setDepth(200)
        .setVisible(false);

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
        .text(
          -270,
          -165,
          "Basket",
          {
            fontFamily: FONT_FAMILY,
            fontSize: "24px",
            fontStyle: "bold",
            color: "#3a241d",
          }
        )
        .setOrigin(0, 0.5);

      const close = this.add
        .text(
          270,
          -165,
          "X",
          {
            fontFamily: FONT_FAMILY,
            fontSize: "28px",
            fontStyle: "bold",
            color: "#ffffff",
          }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      const inventoryArea = this.add
        .rectangle(
          0,
          30,
          560,
          285,
          0xf2bf8d,
          1
        )
        .setStrokeStyle(3, 0x6b4130, 1);

      this.basketCarrotText = this.add
        .text(
          -245,
          -85,
          `Carrots: ${state.inventory.carrot}`,
          {
            fontFamily: FONT_FAMILY,
            fontSize: "18px",
            fontStyle: "bold",
            color: "#4a2d22",
          }
        )
        .setOrigin(0, 0.5);

      this.basketPanel.add([
        overlay,
        panel,
        titleBar,
        title,
        close,
        inventoryArea,
        this.basketCarrotText,
      ]);

      this.createBasketSlots();

      close.on("pointerdown", () => {
        this.toggleBasket(false);
      });
    }

    createBasketSlots() {
      const cols = 6;
      const rows = 3;
      const slotSize = 58;
      const gap = 12;

      const totalWidth =
        cols * slotSize + (cols - 1) * gap;

      const totalHeight =
        rows * slotSize + (rows - 1) * gap;

      const startX =
        -totalWidth / 2 + slotSize / 2;

      const startY =
        45 - totalHeight / 2 + slotSize / 2;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x =
            startX + col * (slotSize + gap);

          const y =
            startY + row * (slotSize + gap);

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

    updateBasketInfo() {
      if (!this.basketCarrotText) return;

      this.basketCarrotText.setText(
        `Carrots: ${state.inventory.carrot}`
      );
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

  const startGame = () => {
    new Phaser.Game(config);
  };

  // Espera a Pixelify Sans carregar
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(startGame);
  } else {
    startGame();
  }
})();
