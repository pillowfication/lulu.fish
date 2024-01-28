import fs from 'fs'
import path from 'path'
import spreadsheetDataRaw from '../data/spreadsheet-data-raw.json'
import oceanFishingFishes from '../data/fishes.json'

const OUTPUT = path.resolve(__dirname, '../data/spreadsheet-data.json')

const PILL_BUG = 2587
const RAT_TAIL = 2591
const GLOWWORM = 2603
const SHRIMP_CAGE_FEEDER = 2613
const HEAVY_STEEL_JIG = 2619
const STONEFLY_NYMPH = 12704
const SQUID_STRIP = 27590
const RAGWORM = 29714
const KRILL = 29715
const PLUMP_WORM = 29716
const VERSATILE_LURE = 29717
const MACKEREL_STRIP = 36593

enum Weather {
  Blizzards = 'Blizzards',
  ClearSkies = 'ClearSkies',
  Clouds = 'Clouds',
  DustStorms = 'DustStorms',
  FairSkies = 'FairSkies',
  Fog = 'Fog',
  Gales = 'Gales',
  HeatWaves = 'HeatWaves',
  Rain = 'Rain',
  Showers = 'Showers',
  Snow = 'Snow',
  Thunder = 'Thunder',
  Thunderstorms = 'Thunderstorms',
  Wind = 'Wind'
}

void (async () => {
  const data: Record<string, any> = spreadsheetDataRaw

  // Pre-fixes
  for (const fishes of Object.values(data)) {
    for (const fish of fishes) {
      switch (fish.name) {
        case 'Jade Shrimp':
          // This fish's name was updated
          fish.name = 'Jade Mantis Shrimp'
          break
        case 'Jewel of Plum Spring':
          // Change "1x" to "x1" so that this parser works
          fish.notes = fish.notes.replace('1x', 'x1')
          break
        case 'Placodus':
        case 'Glass Dragon':
          // These fishes were not detected as being mooch-only, so the raw-parser broke
          fish.moochOnly = true
          fish.baits = {
            ragworm: { biteTime: null, usable: false, best: false },
            krill: { biteTime: null, usable: false, best: false },
            plumpWorm: { biteTime: null, usable: false, best: false },
            other: { biteTime: null, usable: false, best: false },
            mooch: { biteTime: fish.baits.ragworm.biteTime, usable: true, best: true }
          }
          break
        case 'Snapping Koban':
          // This fish was not detected as a mooched fish
          fish.mooched = true
          fish.baits.mooch = { biteTime: null, usable: true, best: null }
          break
      }
    }
  }

  for (const [fishingSpot, fishes] of Object.entries<any>(data)) {
    const isSpectral = /spectral current/i.test(fishingSpot)
    for (const fish of fishes) {
      // Fix baits
      const newBaits: any = {
        [RAGWORM]: fish.baits.ragworm,
        [KRILL]: fish.baits.krill,
        [PLUMP_WORM]: fish.baits.plumpWorm
      }

      if (isSpectral) {
        newBaits[VERSATILE_LURE] = null
        newBaits[getSpecialBait(fishingSpot)] = fish.baits.other
      } else {
        newBaits[VERSATILE_LURE] = fish.baits.other
      }

      if (fish.baits.mooch.usable) { // eslint-disable-line @typescript-eslint/strict-boolean-expressions
        fish.mooches = {
          [getMoochBait(fishingSpot)]: {
            ...fish.baits.mooch
          }
        }
      }

      fish.baits = newBaits

      // Fix time and weather availabilities
      if (isSpectral) {
        fish.timeAvailability = ['D', 'S', 'N'].filter((_, index) => fish.availability[`weather${index + 1}`])
        fish.weatherAvailability = { type: 'ALL' }
      } else {
        fish.timeAvailability = ['D', 'S', 'N']

        const possibleWeathers = getPossibleWeathers(fishingSpot)
        const weatherAvailabilites = possibleWeathers.map((_, index) => fish.availability[`weather${index + 1}`])
        if (weatherAvailabilites.every(availability => availability === true)) {
          fish.weatherAvailability = { type: 'ALL' }
        } else if (weatherAvailabilites.some(availability => availability === false)) {
          fish.weatherAvailability = { type: 'NOT OK', weathers: possibleWeathers.filter((_, index) => weatherAvailabilites[index] === false) }
        } else {
          fish.weatherAvailability = { type: 'OK', weathers: possibleWeathers.filter((_, index) => weatherAvailabilites[index] === true) }
        }
      }

      delete fish.availability

      // Add intuition duration and fishes
      if (fish.intuition) { // eslint-disable-line @typescript-eslint/strict-boolean-expressions
        const intMatch = (fish.notes as string).match(/^Intuition:\s*(.*)\s*\((\d+)s\)$/)
        if (intMatch != null) {
          fish.intuitionDuration = Number(intMatch[2])
          fish.intuitionFishes = intMatch[1].split(',').map(fishNote => {
            const fishMatch = fishNote.trim().match(/^x(\d+) (.+)$/)
            return {
              fish: fishMatch?.[2],
              count: Number(fishMatch?.[1]) || null // eslint-disable-line @typescript-eslint/strict-boolean-expressions
            }
          })
        } else {
          fish.intuitionDuration = null
          fish.intuitionFishes = null
        }
      }

      // Drop notes
      delete fish.notes

      // Fix mooch data appearing as bait data
      if (['Glass Dragon', 'Smooth Jaguar', 'Levi Elver', 'Panoptes', 'Placodus', 'Snapping Koban'].includes(fish.name as string)) {
        Object.apply(fish.mooches[getMoochBait(fishingSpot)], fish.baits[0] as [value: any])
        delete fish.baits[0]
      } else if (fish.baits[0] !== null) {
        delete fish.baits[0]
      }
    }
  }

  const newData: any = {}
  for (const fishes of Object.values(data)) {
    for (const fish of fishes) {
      const id = Object.values(oceanFishingFishes).find(oceanFishingFish => oceanFishingFish.name.en === fish.name)?.id
      if (id === undefined) {
        throw new Error(`Fish with name "${fish.name}" does not exist`)
      } else {
        delete fish.name
        newData[id] = fish
      }
    }
  }

  // Strip all nulls
  (function stripNull (obj: any): void {
    for (const key in obj) {
      if (obj[key] === null) {
        delete obj[key] // eslint-disable-line @typescript-eslint/no-dynamic-delete
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        stripNull(obj[key])
      }
    }
  })(newData)

  function getSpecialBait (fishingSpot: string): number {
    return {
      'Galadion Spectral Current': GLOWWORM,
      'Southern Merlthor Spectral Current': SHRIMP_CAGE_FEEDER,
      'Northern Merlthor Spectral Current': HEAVY_STEEL_JIG,
      'Rhotano Spectral Current': RAT_TAIL,
      'Cieldalaes Spectral Current': SQUID_STRIP,
      'Bloodbrine Spectral Current': PILL_BUG,
      'Rothlyt Spectral Current': 0,
      'Sirensong Spectral Current': MACKEREL_STRIP,
      'Kugane Spectral Current': 0,
      'Ruby Spectral Current': SQUID_STRIP,
      'One River Spectral Current': STONEFLY_NYMPH
    }[fishingSpot] ?? 0
  }

  function getMoochBait (fishingSpot: string): string {
    return data[fishingSpot].find((fish: any) => fish.moochable).name
  }

  function getPossibleWeathers (fishingSpot: string): Weather[] {
    return {
      'Outer Galadion Bay': [Weather.FairSkies, Weather.Clouds, Weather.Fog, Weather.Rain, Weather.Showers, Weather.ClearSkies],
      'The Southern Strait of Merlthor': [Weather.FairSkies, Weather.Clouds, Weather.Fog, Weather.Wind, Weather.Gales, Weather.ClearSkies],
      'The Northern Strait of Merlthor': [Weather.FairSkies, Weather.Clouds, Weather.Fog, Weather.Snow, Weather.Blizzards, Weather.ClearSkies],
      'Open Rhotano Sea': [Weather.FairSkies, Weather.Clouds, Weather.Fog, Weather.DustStorms, Weather.HeatWaves, Weather.ClearSkies],
      'Cieldalaes Margin': [Weather.FairSkies, Weather.Clouds, Weather.Fog, Weather.Thunder, Weather.Thunderstorms, Weather.ClearSkies],
      'Open Bloodbrine Sea': [Weather.FairSkies, Weather.Clouds, Weather.Fog, Weather.Rain, Weather.Showers, Weather.ClearSkies],
      'Outer Rothlyt Sound': [Weather.FairSkies, Weather.Clouds, Weather.Fog, Weather.Thunder, Weather.Thunderstorms, Weather.ClearSkies],
      'Open Sirensong Sea': [Weather.FairSkies, Weather.Clouds, Weather.Fog, Weather.Rain, Weather.Thunderstorms, Weather.ClearSkies],
      'Kugane Coast': [Weather.FairSkies, Weather.Clouds, Weather.Fog, Weather.Rain, Weather.Showers, Weather.ClearSkies],
      'Open Ruby Sea': [Weather.FairSkies, Weather.Clouds, Weather.Fog, Weather.Wind, Weather.Gales, Weather.Thunder, Weather.ClearSkies],
      'Lower One River': [Weather.FairSkies, Weather.Clouds, Weather.Fog, Weather.Rain, Weather.Showers, Weather.ClearSkies]
    }[fishingSpot] ?? []
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(newData, null, 2))

  console.log('Done!')
})()
