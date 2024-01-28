import fs from 'fs'
import { createInterface } from 'readline'
import oceanFishes from '../data/fishes.json'
import fishingSpots from '../data/fishing-spots.json'
import spreadsheetData from '../data/spreadsheet-data.json'
import path from 'path'

const OUTPUT_FOLDER = path.resolve(__dirname, '../data/teamcraft')

async function getBearerToken (): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return await new Promise(resolve => {
    rl.question('Bearer Token: ', answer => {
      rl.close()
      resolve(answer)
    })
  })
}

async function getTeamcraftData (bearerToken: string, spotId: number, baitId: number): Promise<Array<{ fish: number, biteTime: number, count: number }>> {
  const response = await fetch('https://api.ffxivteamcraft.com/gubal', {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      authorization: bearerToken,
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site'
    },
    referrer: 'https://ffxivteamcraft.com/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: JSON.stringify({
      operationName: 'BiteTimesPerFishPerSpotPerBaitQuery',
      variables: { spotId, baitId },
      query: 'query BiteTimesPerFishPerSpotPerBaitQuery($fishId: Int, $spotId: Int, $baitId: Int) { biteTimes: bite_time_per_fish_per_spot_per_bait(where: {spot: {_eq: $spotId}, itemId: {_eq: $fishId}, baitId: {_eq: $baitId}, flooredBiteTime: {_gt: 1, _lt: 600}, occurences: {_gte: 3}}) { itemId spot baitId flooredBiteTime occurences } }'
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include'
  })
  const json = await response.json()
  return json.data.biteTimes.map((datum: any) => ({
    fish: datum.itemId,
    biteTime: datum.flooredBiteTime,
    count: datum.occurences
  }))
}

void (async () => {
  const bearerToken = await getBearerToken()

  for (const { id: spotId, fishes } of Object.values(fishingSpots)) {
    if (fishes.length > 0) {
      // Collect possible baits and mooches
      const baits = ['29714', '29715', '29716', '29717']
      const mooches = [] as string[]

      for (const fish of fishes) {
        const fishData = spreadsheetData[String(fish) as keyof typeof spreadsheetData] as {
          baits: Record<string, unknown>
          mooches?: Record<string, unknown>
        }
        for (const bait of Object.keys(fishData.baits)) {
          if (!baits.includes(bait)) {
            baits.push(bait)
          }
        }
        if (fishData.mooches !== undefined) {
          for (const mooch of Object.keys(fishData.mooches)) {
            if (!mooches.includes(mooch)) {
              mooches.push(mooch)
            }
          }
        }
      }

      // Collect data
      const allData: Record<number, Record<number, Array<[ biteTime: number, count: number ]>>> = {}

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      for (const bait of [...baits.map(Number), ...mooches.map(mooch => Object.values(oceanFishes).find(fish => fish.name.en === mooch)!.id)]) {
        console.log('Fetching', { spotId, baitId: bait })
        const data = await getTeamcraftData(bearerToken, spotId, bait)
        for (const { fish, biteTime, count } of data) {
          const fishData = allData[fish] ?? (allData[fish] = {})
          const baitData = fishData[bait] ?? (fishData[bait] = [])
          baitData.push([biteTime, count])
        }
      }

      fs.writeFileSync(path.resolve(OUTPUT_FOLDER, `./spot-${spotId}.json`), JSON.stringify(allData))
    }
  }

  console.log('Done!')
})()
