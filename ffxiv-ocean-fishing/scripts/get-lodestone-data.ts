import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import oceanFishingFishes from '../data/fishes.json'

const OUTPUT = path.resolve(__dirname, '../data/lodestone-data.json')

async function get (url: string): Promise<string> {
  console.log('Fetching', url)
  const response = await fetch(url)
  return await response.text()
}

interface LodestoneData {
  item?: string
  icon_sm?: string
  icon_md?: string
  icon_lg?: string
}

/**
 * Grabs an item's ID and icon hashes from the Lodestone.
 * {
 *   item: 44-bit hash?
 *   icon_sm: 160-bit hash / 40x40 image
 *   icon_md: 160-bit hash / 64x64 image
 *   icon_lg: 160-bit hash / 128x128 image
 * }
 *
 * Lodestone URL:
 *   - https://na.finalfantasyxiv.com/lodestone/playguide/db/item/[item]/
 * Image URL:
 *   - https://img.finalfantasyxiv.com/lds/pc/global/images/itemicon/[hash-prefix]/[hash].png
 *   - [hash] is `icon_sm` or `icon_md` or `icon_lg`
 *   - [hash-prefix] is the first two characters of [hash]
 *   - an optional `?n[patch-number]` is appended as a cache buster
 *   - e.g.: https://img.finalfantasyxiv.com/lds/pc/global/images/itemicon/ab/abcdefg1234.png?n5.57
 */
async function getLodestoneData (query: string, dataVersion: string): Promise<LodestoneData | null> {
  // The first step is to make a general search for the item on Lodestone.
  // This gives a list of results, and we select the first one whose item name matches the query.
  // The query options represent
  //   ?db_search_category=item - Item
  //   ?category2=6             - Materials
  //   ?category3=47            - Seafood
  let $ = cheerio.load(await get(`https://na.finalfantasyxiv.com/lodestone/playguide/db/item/?db_search_category=item&category2=6&category3=47&q=${query}`))
  const data: LodestoneData = { item: undefined, icon_sm: undefined, icon_md: undefined, icon_lg: undefined }

  // There is still a chance that this picks up the wrong item, but I'm too lazy to make it exact
  $('table.db-table > tbody > tr > td:first-child').each((_, td) => {
    if (data.item === undefined && (new RegExp(query, 'i')).test($(td).find('.db-table__link_txt > a').text())) {
      data.item = $(td).find('.db-table__link_txt > a')?.attr('href')?.match(/item\/([^/]+)\//)?.[1]
      data.icon_sm = $(td).find('.db-list__item__icon img')?.attr('src')?.match(/\/([^/]+)\.png/)?.[1]
    }
  })

  // Not all items appear on the Lodestone.
  // This is typical of newly released blue fishes.
  if (data.item === undefined) {
    console.log('Could not find item:', query)
    return null
  }

  // After the item ID is found, we can grab its `icon_md`.
  // This icon is seen in the hover tooltip that is handled by https://na.finalfantasyxiv.com/lodestone/special/fankit/tooltip/.
  const tooltipJs = await get(`https://img.finalfantasyxiv.com/lds/pc/tooltip/${dataVersion}/na/item/${data.item}.js`)
  $ = cheerio.load((JSON.parse(tooltipJs.match(/^eorzeadb\.pushup\((.+)\)$/)![1]) as { html: string }).html) // eslint-disable-line @typescript-eslint/no-non-null-assertion
  data.icon_md = $('.db-tooltip__item__icon img').eq(0).attr('src')?.match(/\/([^/]+)\.png/)?.[1]

  // Then `icon_lg` can be found by visiting the item's page
  $ = cheerio.load(await get(`https://na.finalfantasyxiv.com/lodestone/playguide/db/item/${data.item}/`))
  data.icon_lg = $('.db__l_main .db-view__item__icon img').eq(1).attr('src')?.match(/\/([^/]+)\.png/)?.[1]

  return data
}

void (async () => {
  // Get the Eorzea DB data version
  console.log('Fetching Eorzea DB version...')
  const versionJs = await fetch('https://img.finalfantasyxiv.com/lds/pc/global/js/eorzeadb/version.js')
    .then(async response => await response.text())
  const versionMatch = versionJs.match(/"data":(\d+)/)
  if (versionMatch == null) {
    console.error(versionJs)
    throw new Error('Could not find Eorzea DB version')
  }
  const DATA_VERSION = versionMatch[1]

  const lodestoneData: Record<number, any> = {}
  for (const fish of Object.values(oceanFishingFishes)) {
    if (fish.id === 0) {
      lodestoneData[fish.id] = null
    } else {
      lodestoneData[fish.id] = await getLodestoneData(fish.name.en, DATA_VERSION)
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(lodestoneData))

  console.log('Done!')
})()
