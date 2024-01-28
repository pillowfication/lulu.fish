# @pillowfication/ffxiv-ocean-fishing

By Lulu Pillow@Adamantoise

# Updating data

The data in this module comes mainly from 4 sources:

- **Datamining** - Data from the game files is mined directly using [SaintCoinach.Cmd](https://github.com/xivapi/SaintCoinach/).
    - Item descriptions
    - Item icons
    - Official translations
- **Lodestone** - The [Lodestone](https://na.finalfantasyxiv.com/lodestone/) (or more specifically [Eorzea Database](https://na.finalfantasyxiv.com/lodestone/playguide/db/)) hosts some additional information that is not found in the game files.
    - Larger item icons
- **Ocean Fishing Spreadsheet** - The [Ocean Fishing Data spreadsheet](https://docs.google.com/spreadsheets/d/e/2PACX-1vRwGdlaadqwY_X7htQdIGbKmhaAue2leyrB7jj06gsuoCcdwxRQtDdqLKW0k-H3SJ7P7wvM1pi2zoJ2/pubhtml) is a community-sourced spreadsheet managed by Tyo’to Tayuun. It's responsible for all the fish data that must be determined through player testing.
    - Fish availability
    - Preferred baits, hooksets, and bite-times
    - Fishers’ Intuition requirements
    - Point values
- **Teamcraft** - [Teamcraft](https://ffxivteamcraft.com/) offers a massive amount of crowdsourced data. This is primarily used to fill in missing data in the Ocean Fishing Data spreadsheet.
    - Fish bite-times

## Update datamined data

**1. Download [SaintCoinach.Cmd](https://github.com/xivapi/SaintCoinach/releases) to `/data`**

**2. Run `cd data/SaintCoinach.Cmd && SaintCoinach.Cmd.exe` then execute `allrawexd` (and `maps`, `ui`, `uihd`)**

**3. Download the CN and KO repositories to `/data` (`git pull`)**

- https://github.com/thewakingsands/ffxiv-datamining-cn
- https://github.com/Ra-Workspace/ffxiv-datamining-ko

## Update ocean fishing data

**1. Run `ts-node scripts/get-ocean-fishing-data.ts`**

This uses the datamined data to create the following files:

- `data/achievements.json`
- `data/baits.json`
- `data/content-bonuses.json`
- `data/fishes.json`
- `data/fishing-spots.json`
- `data/place-names.json`

## Update Lodestone data

**1. Run `ts-node scripts/get-lodestone-data.ts`**

This reads `data/fishes.json` and scrapes the Lodestone to create the following file:

- `data/lodestone-data.json`

## Update spreadsheet data

**1. Run `ts-node scripts/get-spreadsheet-data-raw.ts`**

**2. Run `ts-node scripts/get-spreadsheet-data.ts`**

This reads `data/Ocean Fishing Data.html` and to create the following file:

- `data/spreadsheet-data.json`

Spreadsheet parsing is split into two steps due to how inexact and inconsistent parsing it can be. The `get-spreadsheet-data-raw.ts` script attempts to parse the spreadsheet exactly as is, creating `data/spreadsheet-data-raw.json`. The `get-spreadsheet-data.ts` script then fixes the `.json` by

- Fixing typos
- Fixing fishes with implicit tags
- Mapping baits to the correct special bait or mooch fish
- Mapping bait names and fish names to their respective IDs
- Mapping fish availability data to the correct times or weathers
- Parsing comments into intuition requirements
- Disambiguating overloaded cells not handled by the raw parser
- Manually fixing any other issues with the parser that were too complicated to implement

## Update Teamcraft data

**1. Run `ts-node scripts/get-teamcraft-data-raw.ts`**

This script scrapes the Teamcraft website for every fish’s bait-specific bite-times. It will prompt you for a Bearer Token because I was too lazy to fetch one programmatically.

1. Navigate to any Teamcraft webpage (e.g. [Momora Mora](https://ffxivteamcraft.com/db/en/item/29725/Momora-Mora))
2. Open the developer tools (press F12, or right-click > Inspect)
3. Select the Network panel
4. Refresh the webpage
5. Select a network request with the name "gubal" (there is a Filter option)
6. Select the Headers tab
7. Scroll down to the Request Headers section and copy the Authorization value (it should begin with "Bearer" followed by random characters)

This creates `data/teamcraft/spot-[id].json` files.

**2. Run `ts-node scripts/get-teamcraft-data.ts`**

This reads all the data within `data/teamcraft/` to create the following file:

- `data/teamcraft-data.json`
