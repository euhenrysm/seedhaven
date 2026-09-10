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

  const PLANTABLE_MARGIN_LEFT = 20;
  const PLANTABLE_MARGIN_RIGHT = 20;
  const PLANTABLE_MARGIN_TOP = 22;
  const PLANTABLE_MARGIN_BOTTOM = 48;
  const PLANTABLE_CORNER_RADIUS = 38;

  // =========================
  // VISUAL
  // =========================
  const FONT_FAMILY = '"Pixelify Sans", sans-serif';
  const CROP_RENDER_SIZE = 27;

  // Inventário
  const INVENTORY_WIDTH = 760;
  const INVENTORY_HEIGHT = INVENTORY_WIDTH * (653 / 1159);

  const INVENTORY_COLS = 10;
  const INVENTORY_ROWS = 3;
  const INVENTORY_SLOT_START_X = -307;
  const INVENTORY_SLOT_START_Y = -80;
  const INVENTORY_SLOT_GAP_X = 68.5;
  const INVENTORY_SLOT_GAP_Y = 74.5;
  const INVENTORY_SLOT_SIZE = 55;

  const INVENTORY_SEED_ICON_SIZE = 31;
  const INVENTORY_CROP_ICON_SIZE = 33;
  const INVENTORY_TOOL_ICON_SIZE = 35;

  // =========================
  // QUICKBAR VERTICAL
  // =========================
  const QUICKBAR_SLOTS = 5;
  const QUICKBAR_X = 905;
  const QUICKBAR_START_Y = 165;
  const QUICKBAR_SLOT_SIZE = 42;
  const QUICKBAR_GAP = 8;
  const QUICKBAR_ICON_SIZE = 25;

  // =========================
  // MENU DE ACESSO RÁPIDO (clique direito num item do Basket)
  // =========================
  const QUICK_ACCESS_MENU_OFFSET_X = 102;
  const QUICK_ACCESS_MENU_OFFSET_Y = 22;
  const QUICK_ACCESS_PANEL_WIDTH = 170;
  const QUICK_ACCESS_PANEL_HEIGHT = 95;
  const QUICK_ACCESS_LABEL_Y = -28;
  const QUICK_ACCESS_BUTTON_SIZE = 24;
  const QUICK_ACCESS_BUTTON_GAP = 29;
  const QUICK_ACCESS_BUTTON_START_X = -58;
  const QUICK_ACCESS_BUTTON_Y = 18;

  // =========================
  // GOTA D'ÁGUA (indica planta que precisa ser regada)
  // =========================
  const WATER_DROP_SIZE = 11;
  const WATER_DROP_OFFSET_X = 11;
  const WATER_DROP_OFFSET_Y = -14;

  // =========================
  // PAINEL DE INFORMAÇÃO DA PLANTA (clique direito na plantação)
  // =========================
  const CROP_INFO_WIDTH = 168;
  const CROP_INFO_HEIGHT = 88;
  const CROP_INFO_OFFSET_X = 70;
  const CROP_INFO_OFFSET_Y = -40;
  const CROP_INFO_UPDATE_MS = 200;

  // =========================
  // CROPS
  // =========================
  const CROPS = {
    carrot: {
      name: "Carrot",
      seedIcon: "carrot-seed-icon",
      cropIcon: "carrot-icon",
      stages: ["carrot-stage-1", "carrot-stage-2", "carrot-stage-3"],
      stage2Ms: 5_000,
      readyMs: 10_000,
    },

    wheat: {
      name: "Wheat",
      seedIcon: "wheat-seed-icon",
      cropIcon: "wheat-icon",
      stages: ["wheat-stage-1", "wheat-stage-2", "wheat-stage-3"],
      stage2Ms: 7_000,
      readyMs: 14_000,
    },

    sunflower: {
      name: "Sunflower",
      seedIcon: "sunflower-seed-icon",
      cropIcon: "sunflower-icon",
      stages: ["sunflower-stage-1", "sunflower-stage-2", "sunflower-stage-3"],
      stage2Ms: 9_000,
      readyMs: 18_000,
    },
  };

  // =========================
  // ESTADO
  // =========================
  const state = {
    gold: 100,
    xp: 0,
    level: 1,

    selectedItem: { type: "seed", crop: "carrot" },

    quickSlots: [null, null, null, null, null],

    inventory: { seeds: { carrot: 5, wheat: 5, sunflower: 5 }, crops: { carrot: 0, wheat: 0, sunflower: 0 } },
  };

  class SeedhavenScene extends Phaser.Scene {
    constructor() {
      super("SeedhavenScene");

      this.gridCells = [];
      this.gridDebug = false;

      this.basketPanel = null;
      this.inventorySlots = [];
      this.inventoryItemViews = {};

      this.cropInfoPanel = null;
      this.cropInfoTimer = null;

      this.quickbarViews = [];
      this.quickAccessMenu = null;
    }

    preload() {
      // Mundo
      this.load.image("plot-base", "../public/assets/plots/plot-base.png");

      this.load.image("game-bg", "../public/assets/backgrounds/game-bg.png");

      // HUD
      this.load.image("logo", "../public/assets/ui/logo.png");

      this.load.image("backpack-level", "../public/assets/ui/backpack-level.png");

      // Inventário
      this.load.image("inventory-bg", "../public/assets/ui/inventory/inventory-bg.png");

      this.load.image("inventory-slot", "../public/assets/ui/inventory/inventory-slot.png");

      // Sementes
      this.load.image("carrot-seed-icon", "../public/assets/items/seeds/carrot-seed-icon.png");

      this.load.image("wheat-seed-icon", "../public/assets/items/seeds/wheat-seed-icon.png");

      this.load.image("sunflower-seed-icon", "../public/assets/items/seeds/sunflower-seed-icon.png");

      // Colheitas
      this.load.image("carrot-icon", "../public/assets/items/crops/carrot-icon.png");

      this.load.image("wheat-icon", "../public/assets/items/crops/wheat-icon.png");

      this.load.image("sunflower-icon", "../public/assets/items/crops/sunflower-icon.png");

      // Ferramentas
      this.load.image("watering-can-icon", "../public/assets/items/tools/watering-can.png");

      // Carrot
      this.load.image("carrot-stage-1", "../public/assets/crops/carrot/carrot-stage-1.png");

      this.load.image("carrot-stage-2", "../public/assets/crops/carrot/carrot-stage-2.png");

      this.load.image("carrot-stage-3", "../public/assets/crops/carrot/carrot-stage-3.png");

      // Wheat
      this.load.image("wheat-stage-1", "../public/assets/crops/wheat/wheat-stage-1.png");

      this.load.image("wheat-stage-2", "../public/assets/crops/wheat/wheat-stage-2.png");

      this.load.image("wheat-stage-3", "../public/assets/crops/wheat/wheat-stage-3.png");

      // Sunflower
      this.load.image("sunflower-stage-1", "../public/assets/crops/sunflower/sunflower-stage-1.png");

      this.load.image("sunflower-stage-2", "../public/assets/crops/sunflower/sunflower-stage-2.png");

      this.load.image("sunflower-stage-3", "../public/assets/crops/sunflower/sunflower-stage-3.png");
    }

    create() {
      this.drawWorld();
      this.createGrid();
      this.createHud();
      this.createBasket();

      if (this.input.mouse) {
        this.input.mouse.disableContextMenu();
      }

      this.input.keyboard.on("keydown-G", () => {
        this.gridDebug = !this.gridDebug;
        this.refreshGridDebug();
      });

      for (let i = 0; i < QUICKBAR_SLOTS; i += 1) {
        this.input.keyboard.on(`keydown-${i + 1}`, () => {
          this.selectQuickSlot(i);
        });
      }

      this.refreshInventoryUI();
      this.refreshQuickbar();

      // Cancela timers de crescimento pendentes se a cena for
      // encerrada/reiniciada, evitando callbacks em sprites destruídos.
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupCropTimers());
    }

    cleanupCropTimers() {
      this.gridCells.forEach((cell) => {
        if (!cell.object || cell.object.type !== "crop") return;

        if (cell.object.stageTwoTimer) {
          cell.object.stageTwoTimer.remove(false);
        }

        if (cell.object.readyTimer) {
          cell.object.readyTimer.remove(false);
        }
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
        .image(WIDTH / 2, HEIGHT / 2 + PLOT_Y_OFFSET, "plot-base")
        .setOrigin(0.5)
        .setDisplaySize(PLOT_SIZE, PLOT_SIZE)
        .setDepth(0);
    }

    // =========================
    // ÁREA PLANTÁVEL
    // =========================
    isPlantablePosition(x, y) {
      const plotCenterX = WIDTH / 2;
      const plotCenterY = HEIGHT / 2 + PLOT_Y_OFFSET;

      const plotLeft = plotCenterX - PLOT_SIZE / 2;
      const plotTop = plotCenterY - PLOT_SIZE / 2;

      const left = plotLeft + PLANTABLE_MARGIN_LEFT;
      const right = plotLeft + PLOT_SIZE - PLANTABLE_MARGIN_RIGHT;
      const top = plotTop + PLANTABLE_MARGIN_TOP;
      const bottom = plotTop + PLOT_SIZE - PLANTABLE_MARGIN_BOTTOM;

      if (x < left || x > right || y < top || y > bottom) {
        return false;
      }

      const radius = PLANTABLE_CORNER_RADIUS;

      if (x >= left + radius && x <= right - radius) {
        return true;
      }

      if (y >= top + radius && y <= bottom - radius) {
        return true;
      }

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

          const plantable = this.isPlantablePosition(x, y);

          const cell = this.add
            .rectangle(x, y, CELL_WIDTH, CELL_HEIGHT, 0xffffff, 0)
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

          cell.on("pointerdown", (pointer) => {
            const isRightClick =
              pointer.rightButtonDown && pointer.rightButtonDown();

            if (isRightClick && cell.occupied && cell.object && cell.object.type === "crop") {
              this.showCropInfoPanel(cell);
              return;
            }

            this.hideCropInfoPanel();
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

    // =========================
    // INTERAÇÃO
    // =========================
    handleCellClick(cell) {
      if (!cell.plantable) return;

      if (cell.occupied && cell.object && cell.object.type === "crop" && cell.object.stage === 3) {
        this.harvestCrop(cell);
        return;
      }

      if (state.selectedItem.type === "seed" && !cell.occupied) {
        this.plantCrop(cell, state.selectedItem.crop);
        return;
      }

      if (state.selectedItem.type === "tool" && state.selectedItem.tool === "watering-can") {
        this.waterCrop(cell);
      }
    }

    plantCrop(cell, cropId) {
      if (cell.occupied) return;

      const cropConfig = CROPS[cropId];
      if (!cropConfig) return;

      if (state.inventory.seeds[cropId] <= 0) {
        return;
      }

      state.inventory.seeds[cropId] -= 1;

      const sprite = this.add
        .image(cell.x, cell.y, cropConfig.stages[0])
        .setOrigin(0.5)
        .setDisplaySize(CROP_RENDER_SIZE, CROP_RENDER_SIZE)
        .setDepth(8);

      const waterDrop = this.createWaterDropIcon(
        cell.x + WATER_DROP_OFFSET_X,
        cell.y + WATER_DROP_OFFSET_Y
      );

      cell.occupied = true;

      cell.object = {
        type: "crop",
        crop: cropId,
        stage: 1,
        watered: false,
        sprite,
        waterDrop,
        plantedAt: this.time.now,
        wateredAt: null,
        stageTwoTimer: null,
        readyTimer: null,
      };

      this.refreshInventoryUI();
      this.refreshQuickbar();
    }

    // Desenha um pequeno ícone de gota d'água (sem depender de asset externo).
    createWaterDropIcon(x, y) {
      const r = WATER_DROP_SIZE / 2;

      const gfx = this.add.graphics({ x, y }).setDepth(9);
      gfx.fillStyle(0x4fc3f7, 1);
      gfx.lineStyle(1, 0x0d5c8a, 1);
      gfx.beginPath();
      gfx.moveTo(0, -r * 1.3);
      gfx.lineTo(r, r * 0.3);
      gfx.arc(0, r * 0.3, r, 0, Math.PI, false);
      gfx.lineTo(-r, r * 0.3);
      gfx.closePath();
      gfx.fillPath();
      gfx.strokePath();

      return gfx;
    }

    waterCrop(cell) {
      if (!cell.occupied || !cell.object || cell.object.type !== "crop") {
        return;
      }

      const cropObject = cell.object;

      if (cropObject.stage === 3 || cropObject.watered) {
        return;
      }

      cropObject.watered = true;
      cropObject.wateredAt = this.time.now;

      if (cropObject.waterDrop) {
        cropObject.waterDrop.destroy();
        cropObject.waterDrop = null;
      }

      const cropConfig = CROPS[cropObject.crop];

      cropObject.stageTwoTimer =
        this.time.delayedCall(
          cropConfig.stage2Ms,
          () => {
            if (!cell.object || cell.object !== cropObject) {
              return;
            }

            cropObject.stage = 2;

            cropObject.sprite
              .setTexture(cropConfig.stages[1])
              .setDisplaySize(CROP_RENDER_SIZE, CROP_RENDER_SIZE);
          }
        );

      cropObject.readyTimer =
        this.time.delayedCall(
          cropConfig.readyMs,
          () => {
            if (!cell.object || cell.object !== cropObject) {
              return;
            }

            cropObject.stage = 3;

            cropObject.sprite
              .setTexture(cropConfig.stages[2])
              .setDisplaySize(CROP_RENDER_SIZE, CROP_RENDER_SIZE);
          }
        );
    }

    harvestCrop(cell) {
      if (!cell.object || cell.object.type !== "crop" || cell.object.stage !== 3) {
        return;
      }

      const cropObject = cell.object;
      const cropId = cropObject.crop;

      if (cropObject.stageTwoTimer) {
        cropObject.stageTwoTimer.remove(false);
      }

      if (cropObject.readyTimer) {
        cropObject.readyTimer.remove(false);
      }

      if (cropObject.sprite) {
        cropObject.sprite.destroy();
      }

      if (cropObject.waterDrop) {
        cropObject.waterDrop.destroy();
      }

      this.hideCropInfoPanel();

      cell.object = null;
      cell.occupied = false;

      state.inventory.crops[cropId] += 1;

      this.refreshInventoryUI();
      this.refreshQuickbar();
    }

    // =========================
    // PAINEL DE INFO DA PLANTAÇÃO (clique direito)
    // =========================
    showCropInfoPanel(cell) {
      this.hideCropInfoPanel();

      const cropObject = cell.object;
      const cropConfig = CROPS[cropObject.crop];

      const flipLeft = cell.x + CROP_INFO_OFFSET_X + CROP_INFO_WIDTH / 2 > WIDTH - 10;
      const panelX = cell.x + (flipLeft ? -CROP_INFO_OFFSET_X : CROP_INFO_OFFSET_X);

      const panel = this.add
        .container(panelX, cell.y + CROP_INFO_OFFSET_Y)
        .setDepth(270);

      const bg = this.add
        .rectangle(0, 0, CROP_INFO_WIDTH, CROP_INFO_HEIGHT, 0xfff4dd, 0.97)
        .setStrokeStyle(2, 0x75462f, 1)
        .setInteractive();

      bg.on("pointerdown", () => this.hideCropInfoPanel());

      const nameText = this.add
        .text(0, -CROP_INFO_HEIGHT / 2 + 16, cropConfig.name, {
          fontFamily: FONT_FAMILY,
          fontSize: "15px",
          fontStyle: "bold",
          color: "#3a241d",
        })
        .setOrigin(0.5)
        .setResolution(3);

      const statusText = this.add
        .text(0, 6, "", {
          fontFamily: FONT_FAMILY,
          fontSize: "12px",
          color: "#3a241d",
          align: "center",
          lineSpacing: 6,
        })
        .setOrigin(0.5)
        .setResolution(3);

      panel.add([bg, nameText, statusText]);

      const updateText = () => {
        if (!cell.object || cell.object !== cropObject) {
          this.hideCropInfoPanel();
          return;
        }

        statusText.setText(this.buildCropInfoLines(cropObject, cropConfig));
      };

      updateText();

      this.cropInfoPanel = panel;
      this.cropInfoTimer = this.time.addEvent({
        delay: CROP_INFO_UPDATE_MS,
        loop: true,
        callback: updateText,
      });
    }

    buildCropInfoLines(cropObject, cropConfig) {
      const lines = [`Estágio: ${cropObject.stage}/3`];

      if (cropObject.stage === 3) {
        lines.push("Pronta para colher!");
        return lines.join("\n");
      }

      if (!cropObject.watered) {
        lines.push("Regada: Não");
        lines.push("Regue para começar a crescer");
        return lines.join("\n");
      }

      const remainingMs = Math.max(
        0,
        cropObject.wateredAt + cropConfig.readyMs - this.time.now
      );
      const remainingSec = Math.ceil(remainingMs / 1000);

      lines.push("Regada: Sim");
      lines.push(`Pronta em: ${remainingSec}s`);
      return lines.join("\n");
    }

    hideCropInfoPanel() {
      if (this.cropInfoTimer) {
        this.cropInfoTimer.remove(false);
        this.cropInfoTimer = null;
      }

      if (this.cropInfoPanel) {
        this.cropInfoPanel.destroy();
        this.cropInfoPanel = null;
      }
    }
    // MANTER ESTES VALORES
    // =========================
    getLevelBadgeConfig(level) {
      const digits = String(level).length;

      if (digits === 1) {
        return { x: 94, y: 63, fontSize: "10px" };
      }

      if (digits === 2) {
        return { x: 94, y: 63, fontSize: "8px" };
      }

      return { x: 94, y: 63, fontSize: "7px" };
    }

    // =========================
    // HUD
    // =========================
    createHud() {
      // Mochila no canto superior esquerdo.
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
            color: "#2b1710",
            align: "center",
          }
        )
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(31);

      backpack.on("pointerdown", () => {
        this.toggleBasket();
      });

      // Logo centralizada na tela.
      this.add
        .image(WIDTH / 2, 48, "logo")
        .setOrigin(0.5)
        .setDisplaySize(150, 54)
        .setDepth(30);

      // Gold e XP abaixo da mochila.
      this.goldText = this.add
        .text(
          72,
          104,
          `${state.gold} Gold`,
          {
            fontFamily: FONT_FAMILY,
            fontSize: "18px",
            fontStyle: "bold",
            color: "#ffffff",
            stroke: "#172417",
            strokeThickness: 4,
          }
        )
        .setOrigin(0.5)
        .setResolution(4)
        .setDepth(30);

      this.xpText = this.add
        .text(
          72,
          128,
          `${state.xp} XP`,
          {
            fontFamily: FONT_FAMILY,
            fontSize: "17px",
            fontStyle: "bold",
            color: "#ffffff",
            stroke: "#172417",
            strokeThickness: 4,
          }
        )
        .setOrigin(0.5)
        .setResolution(4)
        .setDepth(30);

      this.createQuickbar();
    }

    // =========================
    // QUICK ACCESS VERTICAL 1-5
    // =========================
    createQuickbar() {
      this.quickbarViews = [];

      for (let i = 0; i < QUICKBAR_SLOTS; i += 1) {
        const y =
          QUICKBAR_START_Y +
          i * (QUICKBAR_SLOT_SIZE + QUICKBAR_GAP);

        const slotBg = this.add
          .image(QUICKBAR_X, y, "inventory-slot")
          .setOrigin(0.5)
          .setDisplaySize(QUICKBAR_SLOT_SIZE, QUICKBAR_SLOT_SIZE)
          .setDepth(31)
          .setInteractive({ useHandCursor: true });

        const numberText = this.add
          .text(
            QUICKBAR_X - 13,
            y - 14,
            `${i + 1}`,
            {
              fontFamily: FONT_FAMILY,
              fontSize: "14px",
              fontStyle: "bold",
              color: "#2f1d16",
              stroke: "#fff0cf",
              strokeThickness: 3,
            }
          )
          .setOrigin(0.5)
          .setResolution(4)
          .setDepth(34);

        const selection = this.add
          .rectangle(QUICKBAR_X, y, QUICKBAR_SLOT_SIZE + 2, QUICKBAR_SLOT_SIZE + 2, 0xffffff, 0)
          .setStrokeStyle(3, 0xffd85a, 0)
          .setDepth(33);

        const icon = this.add
          .image(QUICKBAR_X, y, "inventory-slot")
          .setOrigin(0.5)
          .setDisplaySize(1, 1)
          .setVisible(false)
          .setDepth(32);

        const quantityText = this.add
          .text(
            QUICKBAR_X + 12,
            y + 12,
            "",
            {
              fontFamily: FONT_FAMILY,
              fontSize: "14px",
              fontStyle: "bold",
              color: "#2f1d16",
              backgroundColor: "rgba(255,255,255,0.90)",
              padding: { left: 2, right: 2, top: 0, bottom: 0 },
            }
          )
          .setOrigin(0.5)
          .setResolution(2)
          .setVisible(false)
          .setDepth(34);

        slotBg.on("pointerdown", () => {
          this.selectQuickSlot(i);
        });

        this.quickbarViews.push({ slotBg, numberText, selection, icon, quantityText });
      }
    }

    getItemTexture(item) {
      if (!item) return null;

      if (item.type === "seed") {
        return CROPS[item.crop].seedIcon;
      }

      if (item.type === "tool" && item.tool === "watering-can") {
        return "watering-can-icon";
      }

      return null;
    }

    getItemQuantity(item) {
      if (!item) return null;

      if (item.type === "seed") {
        return state.inventory.seeds[item.crop];
      }

      if (item.type === "crop") {
        return state.inventory.crops[item.crop];
      }

      // Ferramentas não têm quantidade (ex.: regador).
      return null;
    }

    // Liga/desliga o contorno amarelo de "selecionado" num slot.
    // Usado tanto no Basket quanto na Quickbar para não repetir o
    // mesmo setStrokeStyle(3, 0xffd85a, ...) em vários lugares.
    setSlotSelected(strokeRect, selected) {
      strokeRect.setStrokeStyle(3, 0xffd85a, selected ? 1 : 0);
    }

    sameItem(a, b) {
      if (!a || !b) return false;
      if (a.type !== b.type) return false;

      if (a.type === "seed") {
        return a.crop === b.crop;
      }

      if (a.type === "tool") {
        return a.tool === b.tool;
      }

      return false;
    }

    refreshQuickbar() {
      this.quickbarViews.forEach(
        (view, index) => {
          const item = state.quickSlots[index];

          if (!item) {
            view.icon.setVisible(false);
            view.quantityText.setVisible(false);
            this.setSlotSelected(view.selection, false);
            return;
          }

          const texture =
            this.getItemTexture(item);

          view.icon
            .setTexture(texture)
            .setDisplaySize(QUICKBAR_ICON_SIZE, QUICKBAR_ICON_SIZE)
            .setVisible(true);

          const quantity =
            this.getItemQuantity(item);

          if (quantity !== null) {
            view.quantityText
              .setText(`${quantity}`)
              .setVisible(true);
          } else {
            view.quantityText.setVisible(false);
          }

          this.setSlotSelected(view.selection, this.sameItem(item, state.selectedItem));
        }
      );
    }

    selectQuickSlot(index) {
      const item = state.quickSlots[index];
      if (!item) return;

      state.selectedItem = { ...item };

      this.refreshInventorySelection();
      this.refreshQuickbar();
    }

    assignQuickSlot(index, item) {
      if (index < 0 || index >= QUICKBAR_SLOTS) {
        return;
      }

      state.quickSlots[index] = { ...item };

      this.hideQuickAccessMenu();
      this.refreshQuickbar();
    }

    // =========================
    // INVENTÁRIO
    // =========================
    createBasket() {
      this.basketPanel = this.add
        .container(WIDTH / 2, HEIGHT / 2)
        .setDepth(200)
        .setVisible(false);

      const overlay = this.add
        .rectangle(0, 0, WIDTH, HEIGHT, 0x102014, 0.42)
        .setInteractive();

      const inventoryBg = this.add
        .image(0, 0, "inventory-bg")
        .setOrigin(0.5)
        .setDisplaySize(INVENTORY_WIDTH, INVENTORY_HEIGHT);

      const title = this.add
        .text(
          -318,
          -176,
          "Basket",
          {
            fontFamily: FONT_FAMILY,
            fontSize: "27px",
            fontStyle: "bold",
            color: "#34190f",
            stroke: "#f0a568",
            strokeThickness: 1,
          }
        )
        .setOrigin(0, 0.5)
        .setResolution(4);

      const closeText = this.add
        .text(
          341,
          -181,
          "X",
          { fontFamily: FONT_FAMILY, fontSize: "26px", fontStyle: "bold", color: "#34190f" }
        )
        .setOrigin(0.5)
        .setResolution(4);

      const closeHit = this.add
        .rectangle(341, -181, 46, 46, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true });

      this.basketPanel.add([overlay, inventoryBg, title, closeText, closeHit]);

      this.createInventorySlots();
      this.createSlotBackgrounds();
      this.createInventoryItems();

      closeHit.on("pointerdown", () => {
        this.hideQuickAccessMenu();
        this.toggleBasket(false);
      });
    }

    createInventorySlots() {
      this.inventorySlots = [];

      for (
        let row = 0;
        row < INVENTORY_ROWS;
        row += 1
      ) {
        for (
          let col = 0;
          col < INVENTORY_COLS;
          col += 1
        ) {
          const index =
            row * INVENTORY_COLS + col;

          const x =
            INVENTORY_SLOT_START_X +
            col * INVENTORY_SLOT_GAP_X;

          const y =
            INVENTORY_SLOT_START_Y +
            row * INVENTORY_SLOT_GAP_Y;

          this.inventorySlots.push({ index, x, y });
        }
      }
    }

    // Desenha o fundo de TODOS os slots (vazios inclusive), para o Basket
    // parecer um grid de inventário de verdade em vez de um painel vazio.
    createSlotBackgrounds() {
      const backgrounds = this.inventorySlots.map((slot) =>
        this.add
          .image(slot.x, slot.y, "inventory-slot")
          .setOrigin(0.5)
          .setDisplaySize(INVENTORY_SLOT_SIZE, INVENTORY_SLOT_SIZE)
      );

      this.basketPanel.add(backgrounds);
    }

    createInventoryItems() {
      this.createInventoryItem({
        key: "seed-carrot",
        slotIndex: 0,
        texture: CROPS.carrot.seedIcon,
        type: "seed",
        crop: "carrot",
        iconSize: INVENTORY_SEED_ICON_SIZE,
        selectable: true,
      });

      this.createInventoryItem({
        key: "seed-wheat",
        slotIndex: 1,
        texture: CROPS.wheat.seedIcon,
        type: "seed",
        crop: "wheat",
        iconSize: INVENTORY_SEED_ICON_SIZE,
        selectable: true,
      });

      this.createInventoryItem({
        key: "seed-sunflower",
        slotIndex: 2,
        texture: CROPS.sunflower.seedIcon,
        type: "seed",
        crop: "sunflower",
        iconSize: INVENTORY_SEED_ICON_SIZE,
        selectable: true,
      });

      this.createInventoryItem({
        key: "tool-watering-can",
        slotIndex: 3,
        texture: "watering-can-icon",
        type: "tool",
        tool: "watering-can",
        iconSize: INVENTORY_TOOL_ICON_SIZE,
        selectable: true,
      });

      this.createInventoryItem({
        key: "crop-carrot",
        slotIndex: 10,
        texture: CROPS.carrot.cropIcon,
        type: "crop",
        crop: "carrot",
        iconSize: INVENTORY_CROP_ICON_SIZE,
        selectable: false,
      });

      this.createInventoryItem({
        key: "crop-wheat",
        slotIndex: 11,
        texture: CROPS.wheat.cropIcon,
        type: "crop",
        crop: "wheat",
        iconSize: INVENTORY_CROP_ICON_SIZE,
        selectable: false,
      });

      this.createInventoryItem({
        key: "crop-sunflower",
        slotIndex: 12,
        texture: CROPS.sunflower.cropIcon,
        type: "crop",
        crop: "sunflower",
        iconSize: INVENTORY_CROP_ICON_SIZE,
        selectable: false,
      });
    }

    createInventoryItem(config) {
      const slot =
        this.inventorySlots[config.slotIndex];

      if (!slot) return;

      const container =
        this.add.container(slot.x, slot.y);

      const icon = this.add
        .image(0, -2, config.texture)
        .setOrigin(0.5)
        .setDisplaySize(config.iconSize, config.iconSize);

      const quantityBg = this.add
        .rectangle(14, 14, 26, 19, 0xfff4dd, 1)
        .setStrokeStyle(2, 0x5c3425, 1);

      const quantityText = this.add
        .text(
          14,
          14,
          "",
          { fontFamily: FONT_FAMILY, fontSize: "16px", fontStyle: "bold", color: "#24120d" }
        )
        .setOrigin(0.5)
        .setResolution(4);

      const selection = this.add
        .rectangle(0, 0, INVENTORY_SLOT_SIZE - 2, INVENTORY_SLOT_SIZE - 2, 0xffffff, 0)
        .setStrokeStyle(3, 0xffd85a, 0);

      const hit = this.add
        .rectangle(0, 0, INVENTORY_SLOT_SIZE, INVENTORY_SLOT_SIZE, 0xffffff, 0.001);

      const selectable =
        config.selectable !== false;

      if (selectable) {
        hit.setInteractive({ useHandCursor: true });

        hit.on(
          "pointerdown",
          (pointer) => {
            // Botão direito = acesso rápido.
            if (pointer.rightButtonDown && pointer.rightButtonDown()) {
              this.showQuickAccessMenu(slot.x, slot.y, config);
              return;
            }

            // Clique normal = seleciona e mantém o Basket aberto.
            this.hideQuickAccessMenu();

            if (config.type === "seed") {
              state.selectedItem = { type: "seed", crop: config.crop };
            }

            if (config.type === "tool") {
              state.selectedItem = { type: "tool", tool: config.tool };
            }

            this.refreshInventorySelection();
            this.refreshQuickbar();
          }
        );
      }

      container.add([selection, icon, quantityBg, quantityText, hit]);

      this.basketPanel.add(container);

      this.inventoryItemViews[config.key] = { ...config, container, icon, quantityBg, quantityText, selection };
    }

    showQuickAccessMenu(x, y, config) {
      this.hideQuickAccessMenu();

      const menu = this.add
        .container(x + QUICK_ACCESS_MENU_OFFSET_X, y + QUICK_ACCESS_MENU_OFFSET_Y)
        .setDepth(260);

      const panel = this.add
        .rectangle(0, 0, QUICK_ACCESS_PANEL_WIDTH, QUICK_ACCESS_PANEL_HEIGHT, 0xffe0b3, 1)
        .setStrokeStyle(3, 0x75462f, 1);

      const label = this.add
        .text(
          0,
          QUICK_ACCESS_LABEL_Y,
          "Add to quick access",
          { fontFamily: FONT_FAMILY, fontSize: "14px", fontStyle: "bold", color: "#3a241d" }
        )
        .setOrigin(0.5)
        .setResolution(2);

      menu.add([panel, label]);

      for (let i = 0; i < QUICKBAR_SLOTS; i += 1) {
        const buttonX =
          QUICK_ACCESS_BUTTON_START_X +
          i * QUICK_ACCESS_BUTTON_GAP;

        const button = this.add
          .rectangle(
            buttonX,
            QUICK_ACCESS_BUTTON_Y,
            QUICK_ACCESS_BUTTON_SIZE,
            QUICK_ACCESS_BUTTON_SIZE,
            0xffc87a,
            1
          )
          .setStrokeStyle(2, 0x75462f, 1)
          .setInteractive({ useHandCursor: true });

        const number = this.add
          .text(
            buttonX,
            QUICK_ACCESS_BUTTON_Y,
            `${i + 1}`,
            { fontFamily: FONT_FAMILY, fontSize: "13px", fontStyle: "bold", color: "#3a241d" }
          )
          .setOrigin(0.5)
          .setResolution(2);

        button.on("pointerdown", () => {
          const item =
            config.type === "seed"
              ? { type: "seed", crop: config.crop }
              : { type: "tool", tool: config.tool };

          this.assignQuickSlot(i, item);
        });

        menu.add([button, number]);
      }

      this.quickAccessMenu = menu;
      this.basketPanel.add(menu);
    }

    hideQuickAccessMenu() {
      if (!this.quickAccessMenu) return;

      this.quickAccessMenu.destroy();
      this.quickAccessMenu = null;
    }

    refreshInventoryUI() {
      Object.values(this.inventoryItemViews).forEach((view) => {
        let quantity = 1;

        if (view.type === "seed") {
          quantity =
            state.inventory.seeds[view.crop];
        }

        if (view.type === "crop") {
          quantity =
            state.inventory.crops[view.crop];
        }

        if (view.type === "tool") {
          quantity = 1;
        }

        view.quantityText.setText(`${quantity}`);

        if (view.type === "crop") {
          view.container.setVisible(quantity > 0);
        } else {
          view.container.setVisible(true);
        }
      });

      this.refreshInventorySelection();
    }

    refreshInventorySelection() {
      Object.values(this.inventoryItemViews).forEach((view) => {
        let selected = false;

        if (view.type === "seed" && state.selectedItem.type === "seed") {
          selected =
            view.crop ===
            state.selectedItem.crop;
        }

        if (view.type === "tool" && state.selectedItem.type === "tool") {
          selected =
            view.tool ===
            state.selectedItem.tool;
        }

        this.setSlotSelected(view.selection, selected);
      });
    }

    toggleBasket(forceState) {
      if (!this.basketPanel) return;

      this.hideCropInfoPanel();

      const shouldShow =
        typeof forceState === "boolean"
          ? forceState
          : !this.basketPanel.visible;

      if (!shouldShow) {
        this.hideQuickAccessMenu();
      }

      this.basketPanel.setVisible(shouldShow);

      if (shouldShow) {
        this.refreshInventoryUI();
      }
    }
  }

  const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "#8bcf68",
    scene: SeedhavenScene,

    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },

    render: { antialias: false, pixelArt: true },
  };

  const startGame = () => {
    new Phaser.Game(config);
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(startGame);
  } else {
    startGame();
  }
})();
