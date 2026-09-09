(() => {
  "use strict";

  const WIDTH = 960;
  const HEIGHT = 540;
  const GROW_TIME_MS = 30_000;
  const LEVEL_TWO_XP = 40;

  const state = {
    gold: 100,
    xp: 0,
    level: 1,
    sunflowerSeeds: 0,
    sunflowers: 0,
    wood: 0,
    selectedTool: "seed",
    tutorialStep: 0,
    branchCollected: false,
    plantedCount: 0,
    wateredCount: 0,
    harvestedCount: 0,
    soldTutorialHarvest: false,
    potatoUnlocked: false,
  };

  const tutorialCopy = [
    "Buy 4 Sunflower Seeds from the Farm Shop.",
    "Plant 4 Sunflowers in the empty plots.",
    "Select the Watering Can and water all 4 crops.",
    "While your crops grow, remove the fallen branch.",
    "Your Sunflowers are growing. Wait until they are ready.",
    "Harvest all 4 Sunflowers.",
    "Sell your 4 Sunflowers at the Farm Stand.",
    "Tutorial complete — your farm, your choices.",
  ];

  class SeedhavenScene extends Phaser.Scene {
    constructor() {
      super("SeedhavenScene");
      this.plots = [];
      this.shopPanel = null;
      this.toast = null;
    }

    create() {
      this.cameras.main.setBackgroundColor("#9fc96d");
      this.drawWorld();
      this.createHud();
      this.createFarmObjects();
      this.createToolbar();
      this.createTutorialPanel();
      this.createShopPanel();
      this.refreshUI();
    }

    drawWorld() {
      const g = this.add.graphics();

      // Grass
      g.fillStyle(0xa7cc75, 1);
      g.fillRect(0, 0, WIDTH, HEIGHT);

      // Subtle grass strips
      g.fillStyle(0x9cc267, 0.5);
      for (let y = 90; y < 440; y += 48) {
        g.fillRect(0, y, WIDTH, 2);
      }

      // Dirt farming zone
      g.fillStyle(0xd8b06e, 1);
      g.fillRoundedRect(298, 116, 380, 316, 26);
      g.lineStyle(4, 0xc79a59, 1);
      g.strokeRoundedRect(298, 116, 380, 316, 26);

      // Path
      g.fillStyle(0xe4cf9b, 1);
      g.fillRoundedRect(60, 370, 220, 56, 22);
      g.fillRoundedRect(682, 370, 220, 56, 22);

      // Decorative pond
      g.fillStyle(0x7bc3cf, 1);
      g.fillEllipse(823, 151, 120, 82);
      g.lineStyle(5, 0x6aaeba, 1);
      g.strokeEllipse(823, 151, 120, 82);

      // Fence
      g.lineStyle(7, 0x8f633b, 1);
      g.lineBetween(20, 84, 940, 84);
      for (let x = 26; x <= 930; x += 60) {
        g.lineBetween(x, 69, x, 99);
      }
    }

    createHud() {
      this.add.rectangle(480, 35, 920, 56, 0xffffff, 0.94)
        .setStrokeStyle(1, 0xdce5d4)
        .setOrigin(0.5);

      this.add.text(42, 22, "🌱 Seedhaven", {
        fontFamily: "Arial",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#2f4a2b",
      });

      this.goldText = this.add.text(345, 23, "", this.hudStyle());
      this.inventoryText = this.add.text(500, 23, "", this.hudStyle());
      this.levelText = this.add.text(830, 23, "", this.hudStyle()).setOrigin(1, 0);

      this.xpBarBg = this.add.rectangle(870, 49, 128, 7, 0xdde5d7).setOrigin(1, 0.5);
      this.xpBar = this.add.rectangle(742, 49, 0, 7, 0x5f8f4d).setOrigin(0, 0.5);
    }

    hudStyle() {
      return {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#42513e",
      };
    }

    createFarmObjects() {
      const positions = [
        [397, 207],
        [575, 207],
        [397, 335],
        [575, 335],
      ];

      positions.forEach(([x, y], index) => {
        const plot = this.createPlot(x, y, index);
        this.plots.push(plot);
      });

      this.createBranch();
      this.createFarmShop();
      this.createFarmStand();
    }

    createPlot(x, y, index) {
      const container = this.add.container(x, y);

      const soil = this.add.rectangle(0, 0, 130, 92, 0x966339)
        .setStrokeStyle(4, 0x7b4c2b)
        .setInteractive({ useHandCursor: true });

      const cropText = this.add.text(0, -7, "", {
        fontFamily: "Arial",
        fontSize: "34px",
      }).setOrigin(0.5);

      const statusText = this.add.text(0, 31, "Empty", {
        fontFamily: "Arial",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#f7e7c6",
      }).setOrigin(0.5);

      container.add([soil, cropText, statusText]);

      const plot = {
        index,
        container,
        soil,
        cropText,
        statusText,
        stage: "empty",
        watered: false,
        readyAt: null,
        readyTimer: null,
        timerEvent: null,
      };

      soil.on("pointerdown", () => this.onPlotClick(plot));
      soil.on("pointerover", () => soil.setStrokeStyle(4, 0xfff2bd));
      soil.on("pointerout", () => soil.setStrokeStyle(4, 0x7b4c2b));

      return plot;
    }

    createBranch() {
      this.branch = this.add.container(190, 258);

      const hit = this.add.rectangle(0, 0, 130, 70, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true });
      const icon = this.add.text(0, -4, "🪵", {
        fontFamily: "Arial",
        fontSize: "42px",
      }).setOrigin(0.5);
      const label = this.add.text(0, 29, "Fallen branch", {
        fontFamily: "Arial",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#496047",
      }).setOrigin(0.5);

      this.branch.add([hit, icon, label]);
      this.branch.setAlpha(0.55);

      hit.on("pointerdown", () => {
        if (state.tutorialStep !== 3 || state.branchCollected) {
          this.showToast("Finish watering your crops first.");
          return;
        }

        state.branchCollected = true;
        state.wood += 2;
        this.addXP(5);
        state.tutorialStep = 4;
        this.branch.destroy();
        this.showToast("+2 Wood  •  +5 XP");
        this.refreshUI();
      });
    }

    createFarmShop() {
      const shop = this.add.container(145, 156);
      const bg = this.add.rectangle(0, 0, 170, 112, 0xf9f1ce)
        .setStrokeStyle(3, 0xb18a4a)
        .setInteractive({ useHandCursor: true });
      const icon = this.add.text(0, -20, "🏪", {
        fontFamily: "Arial",
        fontSize: "38px",
      }).setOrigin(0.5);
      const label = this.add.text(0, 27, "Farm Shop", {
        fontFamily: "Arial",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#5f4b2e",
      }).setOrigin(0.5);
      const sub = this.add.text(0, 47, "Buy seeds", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#7e6c4b",
      }).setOrigin(0.5);

      shop.add([bg, icon, label, sub]);
      bg.on("pointerdown", () => this.toggleShop(true));
      bg.on("pointerover", () => bg.setFillStyle(0xfff7d9));
      bg.on("pointerout", () => bg.setFillStyle(0xf9f1ce));
    }

    createFarmStand() {
      const stand = this.add.container(815, 300);
      const bg = this.add.rectangle(0, 0, 170, 118, 0xf4ddbd)
        .setStrokeStyle(3, 0x9b693d)
        .setInteractive({ useHandCursor: true });
      const icon = this.add.text(0, -23, "🧺", {
        fontFamily: "Arial",
        fontSize: "40px",
      }).setOrigin(0.5);
      const label = this.add.text(0, 24, "Farm Stand", {
        fontFamily: "Arial",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#5f432c",
      }).setOrigin(0.5);
      const sub = this.add.text(0, 45, "Sell crops", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#805f44",
      }).setOrigin(0.5);

      stand.add([bg, icon, label, sub]);

      bg.on("pointerdown", () => this.sellSunflowers());
      bg.on("pointerover", () => bg.setFillStyle(0xf9e7cc));
      bg.on("pointerout", () => bg.setFillStyle(0xf4ddbd));
    }

    createToolbar() {
      const bar = this.add.container(480, 469);
      const bg = this.add.rectangle(0, 0, 480, 66, 0xffffff, 0.95)
        .setStrokeStyle(1, 0xd8e1d1);
      bar.add(bg);

      this.seedButton = this.makeToolButton(-150, 0, "🌻", "Seeds", "seed");
      this.waterButton = this.makeToolButton(0, 0, "💧", "Water", "water");
      this.harvestButton = this.makeToolButton(150, 0, "🧺", "Harvest", "harvest");

      bar.add([this.seedButton.container, this.waterButton.container, this.harvestButton.container]);
    }

    makeToolButton(x, y, icon, label, tool) {
      const container = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, 124, 44, 0xf2f5ed)
        .setStrokeStyle(2, 0xd8dfd2)
        .setInteractive({ useHandCursor: true });
      const iconText = this.add.text(-42, 0, icon, {
        fontFamily: "Arial",
        fontSize: "21px",
      }).setOrigin(0.5);
      const text = this.add.text(7, 0, label, {
        fontFamily: "Arial",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#42543e",
      }).setOrigin(0.5);

      container.add([bg, iconText, text]);

      bg.on("pointerdown", () => {
        state.selectedTool = tool;
        this.refreshUI();
      });

      return { container, bg, tool };
    }

    createTutorialPanel() {
      this.add.rectangle(480, 518, 920, 34, 0x263c27, 0.96)
        .setStrokeStyle(1, 0x3d5a3c);

      this.tutorialText = this.add.text(480, 518, "", {
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#f5f8ef",
        align: "center",
      }).setOrigin(0.5);
    }

    createShopPanel() {
      this.shopPanel = this.add.container(480, 250).setDepth(100).setVisible(false);

      const overlay = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x1d2b1e, 0.48)
        .setInteractive();
      const panel = this.add.rectangle(0, 0, 420, 280, 0xffffff, 1)
        .setStrokeStyle(2, 0xdce4d5);
      const title = this.add.text(-170, -108, "Farm Shop", {
        fontFamily: "Arial",
        fontSize: "24px",
        fontStyle: "bold",
        color: "#2f472d",
      });
      const close = this.add.text(171, -111, "✕", {
        fontFamily: "Arial",
        fontSize: "21px",
        color: "#5a6656",
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      const cropCard = this.add.rectangle(0, 12, 350, 128, 0xf4f7ef, 1)
        .setStrokeStyle(1, 0xdce4d5);
      const cropIcon = this.add.text(-138, -10, "🌻", {
        fontFamily: "Arial",
        fontSize: "44px",
      }).setOrigin(0.5);
      const cropName = this.add.text(-92, -42, "Sunflower Seed", {
        fontFamily: "Arial",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#34452f",
      });
      const cropStats = this.add.text(-92, -13, "5 Gold each  •  Growth: 30 sec", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#687365",
      });

      const buyButton = this.add.rectangle(67, 42, 162, 42, 0x547e47, 1)
        .setInteractive({ useHandCursor: true });
      this.buyButtonText = this.add.text(67, 42, "Buy 4 • 20 Gold", {
        fontFamily: "Arial",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#ffffff",
      }).setOrigin(0.5);

      const footer = this.add.text(0, 108, "The first seeds are all you need to begin.", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#75806f",
      }).setOrigin(0.5);

      this.shopPanel.add([
        overlay,
        panel,
        title,
        close,
        cropCard,
        cropIcon,
        cropName,
        cropStats,
        buyButton,
        this.buyButtonText,
        footer,
      ]);

      close.on("pointerdown", () => this.toggleShop(false));
      buyButton.on("pointerdown", () => this.buySunflowerSeeds());
      buyButton.on("pointerover", () => buyButton.setFillStyle(0x466c3b));
      buyButton.on("pointerout", () => buyButton.setFillStyle(0x547e47));
    }

    toggleShop(show) {
      this.shopPanel.setVisible(show);
    }

    buySunflowerSeeds() {
      if (state.tutorialStep > 0) {
        if (state.gold < 5) {
          this.showToast("Not enough Gold.");
          return;
        }
        state.gold -= 5;
        state.sunflowerSeeds += 1;
        this.showToast("+1 Sunflower Seed");
        this.refreshUI();
        return;
      }

      if (state.gold < 20) {
        this.showToast("Not enough Gold.");
        return;
      }

      state.gold -= 20;
      state.sunflowerSeeds += 4;
      state.tutorialStep = 1;
      this.addXP(10);
      state.selectedTool = "seed";
      this.toggleShop(false);
      this.showToast("4 seeds purchased  •  +10 XP");
      this.refreshUI();
    }

    onPlotClick(plot) {
      if (state.selectedTool === "seed") {
        this.tryPlant(plot);
        return;
      }

      if (state.selectedTool === "water") {
        this.tryWater(plot);
        return;
      }

      if (state.selectedTool === "harvest") {
        this.tryHarvest(plot);
      }
    }

    tryPlant(plot) {
      if (plot.stage !== "empty") {
        this.showToast("This plot is already in use.");
        return;
      }

      if (state.sunflowerSeeds <= 0) {
        this.showToast("You need Sunflower Seeds.");
        return;
      }

      state.sunflowerSeeds -= 1;
      state.plantedCount += 1;
      plot.stage = "planted";
      plot.watered = false;
      plot.cropText.setText("🌱");
      plot.statusText.setText("Needs water");
      plot.soil.setFillStyle(0x93613a);

      if (state.tutorialStep === 1 && state.plantedCount === 4) {
        state.tutorialStep = 2;
        this.addXP(10);
        state.selectedTool = "water";
        this.showToast("4 Sunflowers planted  •  +10 XP");
      }

      this.refreshUI();
    }

    tryWater(plot) {
      if (plot.stage !== "planted") {
        this.showToast("Plant something here first.");
        return;
      }

      if (plot.watered) {
        this.showToast("This crop is already watered.");
        return;
      }

      plot.watered = true;
      plot.stage = "growing";
      plot.soil.setFillStyle(0x76543f);
      plot.cropText.setText("🌿");
      plot.readyAt = Date.now() + GROW_TIME_MS;
      plot.statusText.setText("30s");
      state.wateredCount += 1;

      plot.timerEvent = this.time.addEvent({
        delay: 250,
        loop: true,
        callback: () => this.updatePlotTimer(plot),
      });

      plot.readyTimer = this.time.delayedCall(GROW_TIME_MS, () => {
        if (plot.timerEvent) plot.timerEvent.remove(false);
        plot.stage = "ready";
        plot.cropText.setText("🌻");
        plot.statusText.setText("Ready!");
        plot.soil.setFillStyle(0x79543b);

        if (this.plots.every((p) => p.stage === "ready" || p.stage === "empty")) {
          if (state.tutorialStep === 4) {
            state.tutorialStep = 5;
            state.selectedTool = "harvest";
            this.showToast("Your Sunflowers are ready!");
          }
          this.refreshUI();
        }
      });

      if (state.tutorialStep === 2 && state.wateredCount === 4) {
        state.tutorialStep = 3;
        this.branch.setAlpha(1);
        this.showToast("All crops watered. Clean up the branch while you wait.");
      }

      this.refreshUI();
    }

    updatePlotTimer(plot) {
      if (plot.stage !== "growing" || !plot.readyAt) return;
      const remaining = Math.max(0, Math.ceil((plot.readyAt - Date.now()) / 1000));
      plot.statusText.setText(`${remaining}s`);
    }

    tryHarvest(plot) {
      if (plot.stage !== "ready") {
        this.showToast("This crop is not ready yet.");
        return;
      }

      plot.stage = "empty";
      plot.watered = false;
      plot.readyAt = null;
      plot.cropText.setText("");
      plot.statusText.setText("Empty");
      plot.soil.setFillStyle(0x966339);
      state.sunflowers += 1;
      state.harvestedCount += 1;

      this.showToast("+1 Sunflower");

      if (state.tutorialStep === 5 && state.harvestedCount === 4) {
        state.tutorialStep = 6;
        this.addXP(15);
        this.showToast("4 Sunflowers harvested  •  +15 XP");
      }

      this.refreshUI();
    }

    sellSunflowers() {
      if (state.sunflowers <= 0) {
        this.showToast("You have no Sunflowers to sell.");
        return;
      }

      const amount = state.sunflowers;
      const value = amount * 10;
      state.gold += value;
      state.sunflowers = 0;

      if (state.tutorialStep === 6 && amount >= 4) {
        state.tutorialStep = 7;
        state.soldTutorialHarvest = true;
        this.tryLevelUp();
        this.showToast(`Sold ${amount} Sunflowers  •  +${value} Gold`);
      } else {
        this.showToast(`Sold ${amount} Sunflower${amount === 1 ? "" : "s"}  •  +${value} Gold`);
      }

      this.refreshUI();
    }

    addXP(amount) {
      state.xp += amount;
      this.tryLevelUp();
    }

    tryLevelUp() {
      if (state.level === 1 && state.xp >= LEVEL_TWO_XP && state.soldTutorialHarvest) {
        state.level = 2;
        state.potatoUnlocked = true;
        this.showLevelUp();
      }
    }

    showLevelUp() {
      const panel = this.add.container(480, 254).setDepth(200);
      const overlay = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x1d2c1e, 0.45).setInteractive();
      const box = this.add.rectangle(0, 0, 440, 250, 0xfffdf5, 1)
        .setStrokeStyle(3, 0xe0c76d);
      const icon = this.add.text(0, -72, "✨", {
        fontFamily: "Arial",
        fontSize: "42px",
      }).setOrigin(0.5);
      const title = this.add.text(0, -24, "LEVEL 2", {
        fontFamily: "Arial",
        fontSize: "34px",
        fontStyle: "bold",
        color: "#385235",
      }).setOrigin(0.5);
      const unlock = this.add.text(0, 30, "🥔 Potato Seed unlocked!", {
        fontFamily: "Arial",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#5b654f",
      }).setOrigin(0.5);
      const stats = this.add.text(0, 60, "10 Gold  •  Growth: 2 min  •  Sell: 22 Gold", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#7a806f",
      }).setOrigin(0.5);
      const button = this.add.rectangle(0, 97, 150, 38, 0x537c47, 1)
        .setInteractive({ useHandCursor: true });
      const buttonText = this.add.text(0, 97, "Continue", {
        fontFamily: "Arial",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#ffffff",
      }).setOrigin(0.5);

      panel.add([overlay, box, icon, title, unlock, stats, button, buttonText]);
      button.on("pointerdown", () => panel.destroy());
    }

    refreshUI() {
      this.goldText.setText(`🪙 ${state.gold} Gold`);
      this.inventoryText.setText(`🌻 Seeds ${state.sunflowerSeeds}   •   Crop ${state.sunflowers}   •   🪵 ${state.wood}`);
      this.levelText.setText(`Level ${state.level}  •  ${state.xp} XP`);

      const xpProgress = state.level >= 2 ? 1 : Phaser.Math.Clamp(state.xp / LEVEL_TWO_XP, 0, 1);
      this.xpBar.width = 128 * xpProgress;

      this.tutorialText.setText(tutorialCopy[state.tutorialStep] || tutorialCopy[7]);

      [this.seedButton, this.waterButton, this.harvestButton].forEach((button) => {
        const active = button.tool === state.selectedTool;
        button.bg.setFillStyle(active ? 0xdcebd3 : 0xf2f5ed);
        button.bg.setStrokeStyle(2, active ? 0x5c8b4b : 0xd8dfd2);
      });

      if (state.tutorialStep >= 5) {
        state.selectedTool = state.tutorialStep === 5 ? "harvest" : state.selectedTool;
      }
    }

    showToast(message) {
      if (this.toast) {
        this.toast.destroy();
      }

      const bg = this.add.rectangle(480, 100, 390, 42, 0x233925, 0.94)
        .setStrokeStyle(1, 0x4f6a50)
        .setDepth(300);
      const text = this.add.text(480, 100, message, {
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff",
      }).setOrigin(0.5).setDepth(301);

      this.toast = this.add.container(0, 0, [bg, text]).setDepth(300);
      this.tweens.add({
        targets: this.toast,
        alpha: 0,
        delay: 1800,
        duration: 350,
        onComplete: () => {
          if (this.toast) {
            this.toast.destroy();
            this.toast = null;
          }
        },
      });
    }
  }

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "#a7cc75",
    scene: SeedhavenScene,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
  });
})();
