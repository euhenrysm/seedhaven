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
  const INVENTORY_HEIGHT = 445;

  const INVENTORY_COLS = 10;
  const INVENTORY_ROWS = 3;

  // Coordenadas ajustadas para o layout do seu inventory-bg
  const INVENTORY_SLOT_START_X = -307;
  const INVENTORY_SLOT_START_Y = -86;
  const INVENTORY_SLOT_GAP_X = 68.5;
  const INVENTORY_SLOT_GAP_Y = 74.5;
  const INVENTORY_SLOT_SIZE = 55;

  const INVENTORY_SEED_ICON_SIZE = 31;
  const INVENTORY_CROP_ICON_SIZE = 33;
  const INVENTORY_TOOL_ICON_SIZE = 35;

  // =========================
  // CROPS
  // Tempos curtos para teste.
  // Só começam a contar depois de regar.
  // =========================
  const CROPS = {
    carrot: {
      name: "Carrot",
      seedIcon: "carrot-seed-icon",
      cropIcon: "carrot-icon",
      stages: [
        "carrot-stage-1",
        "carrot-stage-2",
        "carrot-stage-3",
      ],
      stage2Ms: 5_000,
      readyMs: 10_000,
    },

    wheat: {
      name: "Wheat",
      seedIcon: "wheat-seed-icon",
      cropIcon: "wheat-icon",
      stages: [
        "wheat-stage-1",
        "wheat-stage-2",
        "wheat-stage-3",
      ],
      stage2Ms: 7_000,
      readyMs: 14_000,
    },

    sunflower: {
      name: "Sunflower",
      seedIcon: "sunflower-seed-icon",
      cropIcon: "sunflower-icon",
      stages: [
        "sunflower-stage-1",
        "sunflower-stage-2",
        "sunflower-stage-3",
      ],
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

    selectedItem: {
      type: "seed",
      crop: "carrot",
    },

    inventory: {
      seeds: {
        carrot: 5,
        wheat: 5,
        sunflower: 5,
      },

      crops: {
        carrot: 0,
        wheat: 0,
        sunflower: 0,
      },
    },
  };

  class SeedhavenScene extends Phaser.Scene {
    constructor() {
      super("SeedhavenScene");

      this.gridCells = [];
      this.gridDebug = false;

      this.basketPanel = null;
      this.inventorySlots = [];
      this.inventoryItemViews = {};
      this.selectedItemText = null;
    }

    preload() {
      // =========================
      // MUNDO
      // =========================
      this.load.image(
        "plot-base",
        "../public/assets/plots/plot-base.png"
      );

      this.load.image(
        "game-bg",
        "../public/assets/backgrounds/game-bg.png"
      );

      // =========================
      // HUD
      // =========================
      this.load.image(
        "logo",
        "../public/assets/ui/logo.png"
      );

      this.load.image(
        "backpack-level",
        "../public/assets/ui/backpack-level.png"
      );

      // =========================
      // INVENTÁRIO
      // =========================
      this.load.image(
        "inventory-bg",
        "../public/assets/ui/inventory/inventory-bg.png"
      );

      this.load.image(
        "inventory-slot",
        "../public/assets/ui/inventory/inventory-slot.png"
      );

      // =========================
      // ÍCONES DE SEMENTES
      // =========================
      this.load.image(
        "carrot-seed-icon",
        "../public/assets/items/seeds/carrot-seed-icon.png"
      );

      this.load.image(
        "wheat-seed-icon",
        "../public/assets/items/seeds/wheat-seed-icon.png"
      );

      this.load.image(
        "sunflower-seed-icon",
        "../public/assets/items/seeds/sunflower-seed-icon.png"
      );

      // =========================
      // ÍCONES DAS COLHEITAS
      // =========================
      this.load.image(
        "carrot-icon",
        "../public/assets/items/crops/carrot-icon.png"
      );

      this.load.image(
        "wheat-icon",
        "../public/assets/items/crops/wheat-icon.png"
      );

      this.load.image(
        "sunflower-icon",
        "../public/assets/items/crops/sunflower-icon.png"
      );

      // =========================
      // FERRAMENTAS
      // =========================
      this.load.image(
        "watering-can-icon",
        "../public/assets/items/tools/watering-can.png"
      );

      // =========================
      // CARROT
      // =========================
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

      // =========================
      // WHEAT
      // =========================
      this.load.image(
        "wheat-stage-1",
        "../public/assets/crops/wheat/wheat-stage-1.png"
      );

      this.load.image(
        "wheat-stage-2",
        "../public/assets/crops/wheat/wheat-stage-2.png"
      );

      this.load.image(
        "wheat-stage-3",
        "../public/assets/crops/wheat/wheat-stage-3.png"
      );

      // =========================
      // SUNFLOWER
      // =========================
      this.load.image(
        "sunflower-stage-1",
        "../public/assets/crops/sunflower/sunflower-stage-1.png"
      );

      this.load.image(
        "sunflower-stage-2",
        "../public/assets/crops/sunflower/sunflower-stage-2.png"
      );

      this.load.image(
        "sunflower-stage-3",
        "../public/assets/crops/sunflower/sunflower-stage-3.png"
      );
    }

    create() {
      this.drawWorld();
      this.createGrid();
      this.createHud();
      this.createBasket();

      this.input.keyboard.on("keydown-G", () => {
        this.gridDebug = !this.gridDebug;
        this.refreshGridDebug();
      });

      this.refreshHudSelection();
      this.refreshInventoryUI();
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

    // =========================
    // INTERAÇÃO
    // =========================
    handleCellClick(cell) {
      if (!cell.plantable) return;

      // Planta pronta = colher
      if (
        cell.occupied &&
        cell.object &&
        cell.object.type === "crop" &&
        cell.object.stage === 3
      ) {
        this.harvestCrop(cell);
        return;
      }

      // Plantar
      if (
        state.selectedItem.type === "seed" &&
        !cell.occupied
      ) {
        this.plantCrop(cell, state.selectedItem.crop);
        return;
      }

      // Regar
      if (
        state.selectedItem.type === "tool" &&
        state.selectedItem.tool === "watering-can"
      ) {
        this.waterCrop(cell);
      }
    }

    // =========================
    // PLANTIO
    // =========================
    plantCrop(cell, cropId) {
      if (cell.occupied) return;

      const cropConfig = CROPS[cropId];
      if (!cropConfig) return;

      if (state.inventory.seeds[cropId] <= 0) {
        return;
      }

      state.inventory.seeds[cropId] -= 1;

      const sprite = this.add
        .image(
          cell.x,
          cell.y,
          cropConfig.stages[0]
        )
        .setOrigin(0.5)
        .setDisplaySize(
          CROP_RENDER_SIZE,
          CROP_RENDER_SIZE
        )
        .setDepth(8);

      cell.occupied = true;

      cell.object = {
        type: "crop",
        crop: cropId,
        stage: 1,
        watered: false,
        sprite,
        stageTwoTimer: null,
        readyTimer: null,
      };

      this.refreshInventoryUI();
    }

    // =========================
    // REGAR
    // =========================
    waterCrop(cell) {
      if (
        !cell.occupied ||
        !cell.object ||
        cell.object.type !== "crop"
      ) {
        return;
      }

      const cropObject = cell.object;

      if (
        cropObject.stage === 3 ||
        cropObject.watered
      ) {
        return;
      }

      cropObject.watered = true;

      const cropConfig = CROPS[cropObject.crop];

      cropObject.stageTwoTimer =
        this.time.delayedCall(
          cropConfig.stage2Ms,
          () => {
            if (
              !cell.object ||
              cell.object !== cropObject
            ) {
              return;
            }

            cropObject.stage = 2;

            cropObject.sprite
              .setTexture(cropConfig.stages[1])
              .setDisplaySize(
                CROP_RENDER_SIZE,
                CROP_RENDER_SIZE
              );
          }
        );

      cropObject.readyTimer =
        this.time.delayedCall(
          cropConfig.readyMs,
          () => {
            if (
              !cell.object ||
              cell.object !== cropObject
            ) {
              return;
            }

            cropObject.stage = 3;

            cropObject.sprite
              .setTexture(cropConfig.stages[2])
              .setDisplaySize(
                CROP_RENDER_SIZE,
                CROP_RENDER_SIZE
              );
          }
        );
    }

    // =========================
    // COLHEITA
    // =========================
    harvestCrop(cell) {
      if (
        !cell.object ||
        cell.object.type !== "crop" ||
        cell.object.stage !== 3
      ) {
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

      cell.object = null;
      cell.occupied = false;

      state.inventory.crops[cropId] += 1;

      this.refreshInventoryUI();
    }

    // =========================
    // LEVEL BADGE
    // =========================
    getLevelBadgeConfig(level) {
      const digits = String(level).length;

      if (digits === 1) {
        return {
          x: 101,
          y: 59,
          fontSize: "10px",
        };
      }

      if (digits === 2) {
        return {
          x: 101,
          y: 59,
          fontSize: "8px",
        };
      }

      return {
        x: 101,
        y: 59,
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

      const backpack = this.add
        .image(72, 53, "backpack-level")
        .setOrigin(0.5)
        .setDisplaySize(82, 82)
        .setDepth(30)
        .setInteractive({
          useHandCursor: true,
        });

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

      this.add
        .image(210, 42, "logo")
        .setOrigin(0.5)
        .setDisplaySize(135, 49)
        .setDepth(30);

      this.goldText = this.add
        .text(
          470,
          34,
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

      this.selectedItemText = this.add
        .text(
          470,
          55,
          "",
          {
            fontFamily: FONT_FAMILY,
            fontSize: "12px",
            fontStyle: "bold",
            color: "#6b7766",
          }
        )
        .setOrigin(0.5)
        .setDepth(30);

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

    refreshHudSelection() {
      if (!this.selectedItemText) return;

      if (state.selectedItem.type === "seed") {
        const crop =
          CROPS[state.selectedItem.crop];

        this.selectedItemText.setText(
          `Selected: ${crop.name} Seed`
        );

        return;
      }

      if (
        state.selectedItem.type === "tool" &&
        state.selectedItem.tool === "watering-can"
      ) {
        this.selectedItemText.setText(
          "Selected: Watering Can"
        );
      }
    }

    // =========================
    // INVENTÁRIO
    // =========================
    createBasket() {
      this.basketPanel = this.add
        .container(
          WIDTH / 2,
          HEIGHT / 2
        )
        .setDepth(200)
        .setVisible(false);

      // Escurece o jogo atrás
      const overlay = this.add
        .rectangle(
          0,
          0,
          WIDTH,
          HEIGHT,
          0x102014,
          0.42
        )
        .setInteractive();

      // Seu asset do inventário
      const inventoryBg = this.add
        .image(
          0,
          0,
          "inventory-bg"
        )
        .setOrigin(0.5)
        .setDisplaySize(
          INVENTORY_WIDTH,
          INVENTORY_HEIGHT
        );

      // Título
      const title = this.add
        .text(
          -320,
          -166,
          "Basket",
          {
            fontFamily: FONT_FAMILY,
            fontSize: "21px",
            fontStyle: "bold",
            color: "#4a281d",
          }
        )
        .setOrigin(0, 0.5);

      // X dentro do quadrado no canto superior direito
      const closeText = this.add
        .text(
          338,
          -160,
          "X",
          {
            fontFamily: FONT_FAMILY,
            fontSize: "22px",
            fontStyle: "bold",
            color: "#4a281d",
          }
        )
        .setOrigin(0.5);

      const closeHit = this.add
        .rectangle(
          338,
          -160,
          45,
          45,
          0xffffff,
          0.001
        )
        .setInteractive({
          useHandCursor: true,
        });

      this.basketPanel.add([
        overlay,
        inventoryBg,
        title,
        closeText,
        closeHit,
      ]);

      this.createInventorySlots();
      this.createInventoryItems();

      closeHit.on("pointerdown", () => {
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

          // Guarda apenas a posição.
          // O slot-bg só será desenhado quando existir um item nesse espaço.
          this.inventorySlots.push({
            index,
            x,
            y,
          });
        }
      }
    }

    createInventoryItems() {
      // Linha 1: sementes + ferramenta
      this.createInventoryItem({
        key: "seed-carrot",
        slotIndex: 0,
        texture: CROPS.carrot.seedIcon,
        type: "seed",
        crop: "carrot",
        iconSize: INVENTORY_SEED_ICON_SIZE,
      });

      this.createInventoryItem({
        key: "seed-wheat",
        slotIndex: 1,
        texture: CROPS.wheat.seedIcon,
        type: "seed",
        crop: "wheat",
        iconSize: INVENTORY_SEED_ICON_SIZE,
      });

      this.createInventoryItem({
        key: "seed-sunflower",
        slotIndex: 2,
        texture: CROPS.sunflower.seedIcon,
        type: "seed",
        crop: "sunflower",
        iconSize: INVENTORY_SEED_ICON_SIZE,
      });

      this.createInventoryItem({
        key: "tool-watering-can",
        slotIndex: 3,
        texture: "watering-can-icon",
        type: "tool",
        tool: "watering-can",
        iconSize: INVENTORY_TOOL_ICON_SIZE,
      });

      // Linha 2: colheitas
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

      // Slot visual aparece apenas onde existe um item.
      const slotBg = this.add
        .image(0, 0, "inventory-slot")
        .setOrigin(0.5)
        .setDisplaySize(
          INVENTORY_SLOT_SIZE,
          INVENTORY_SLOT_SIZE
        );

      const icon = this.add
        .image(0, -2, config.texture)
        .setOrigin(0.5)
        .setDisplaySize(
          config.iconSize,
          config.iconSize
        );

      // Quantidade no canto inferior direito
      const quantityBg = this.add
        .rectangle(
          18,
          18,
          22,
          15,
          0xffffff,
          0.92
        )
        .setStrokeStyle(
          1,
          0x8e5a3c,
          1
        );

      const quantityText = this.add
        .text(
          18,
          18,
          "",
          {
            fontFamily: FONT_FAMILY,
            fontSize: "10px",
            fontStyle: "bold",
            color: "#4a281d",
          }
        )
        .setOrigin(0.5);

      // Seleção visual
      const selection = this.add
        .rectangle(
          0,
          0,
          INVENTORY_SLOT_SIZE - 3,
          INVENTORY_SLOT_SIZE - 3,
          0xffffff,
          0
        )
        .setStrokeStyle(
          3,
          0xffd85a,
          0
        );

      const hit = this.add
        .rectangle(
          0,
          0,
          INVENTORY_SLOT_SIZE,
          INVENTORY_SLOT_SIZE,
          0xffffff,
          0.001
        );

      const selectable =
        config.selectable !== false;

      if (selectable) {
        hit.setInteractive({
          useHandCursor: true,
        });

        hit.on("pointerdown", () => {
          if (config.type === "seed") {
            state.selectedItem = {
              type: "seed",
              crop: config.crop,
            };
          }

          if (config.type === "tool") {
            state.selectedItem = {
              type: "tool",
              tool: config.tool,
            };
          }

          this.refreshHudSelection();
          this.refreshInventorySelection();
          this.toggleBasket(false);
        });
      }

      container.add([
        slotBg,
        selection,
        icon,
        quantityBg,
        quantityText,
        hit,
      ]);

      this.basketPanel.add(container);

      this.inventoryItemViews[config.key] = {
        ...config,
        container,
        icon,
        quantityBg,
        quantityText,
        selection,
      };
    }

    refreshInventoryUI() {
      Object.values(
        this.inventoryItemViews
      ).forEach((view) => {
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

        view.quantityText.setText(
          `${quantity}`
        );

        // Colheitas só aparecem depois que existir pelo menos 1.
        if (view.type === "crop") {
          const visible = quantity > 0;

          view.container.setVisible(
            visible
          );
        } else {
          view.container.setVisible(true);
        }
      });

      this.refreshInventorySelection();
    }

    refreshInventorySelection() {
      Object.values(
        this.inventoryItemViews
      ).forEach((view) => {
        let selected = false;

        if (
          view.type === "seed" &&
          state.selectedItem.type === "seed"
        ) {
          selected =
            view.crop ===
            state.selectedItem.crop;
        }

        if (
          view.type === "tool" &&
          state.selectedItem.type === "tool"
        ) {
          selected =
            view.tool ===
            state.selectedItem.tool;
        }

        view.selection.setStrokeStyle(
          3,
          0xffd85a,
          selected ? 1 : 0
        );
      });
    }

    toggleBasket(forceState) {
      if (!this.basketPanel) return;

      const shouldShow =
        typeof forceState === "boolean"
          ? forceState
          : !this.basketPanel.visible;

      this.basketPanel.setVisible(
        shouldShow
      );

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

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter:
        Phaser.Scale.CENTER_BOTH,
    },

    render: {
      antialias: false,
      pixelArt: true,
    },
  };

  const startGame = () => {
    new Phaser.Game(config);
  };

  if (
    document.fonts &&
    document.fonts.ready
  ) {
    document.fonts.ready.then(
      startGame
    );
  } else {
    startGame();
  }
})();
