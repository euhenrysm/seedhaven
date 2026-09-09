# Seedhaven Prototype v0.1

First playable slice of Seedhaven.

## Included

- 100 starting Gold
- Farm Shop
- 4 starter farming plots
- Buy 4 Sunflower Seeds
- Planting
- Watering
- 30-second crop growth timer
- Fallen branch activity (+2 Wood)
- Harvesting
- Farm Stand selling
- XP progression
- Level 2 unlock
- Potato Seed unlock preview

## Run locally

Because the prototype uses Phaser from a CDN, you can open `index.html` directly in a browser while online.

For the most reliable local test, serve the folder with a small local web server, for example:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## GitHub Pages

Upload the entire `game` folder into the Seedhaven repository.

If the repository is already published with GitHub Pages, the game will be available at:

`https://euhenrysm.github.io/seedhaven/game/`

## Current design values

| Item | Value |
| --- | ---: |
| Starting Gold | 100 |
| Starter plots | 4 |
| Sunflower Seed | 5 Gold |
| Sunflower growth | 30 sec |
| Sunflower sell price | 10 Gold |
| Potato Seed | 10 Gold |
| Potato growth | 2 min |
| Potato sell price | 22 Gold |
| Level 2 threshold | 40 XP |

This is a prototype. Values and mechanics are expected to change during balancing and playtesting.
