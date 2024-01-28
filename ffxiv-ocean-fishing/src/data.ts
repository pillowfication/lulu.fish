import _achievements from '../data/achievements.json'
import _baits from '../data/baits.json'
import _contentBonuses from '../data/content-bonuses.json'
import _fishes from '../data/fishes.json'
import _fishingSpots from '../data/fishing-spots.json'
import _lodestoneData from '../data/lodestone-data.json'
import _placeNames from '../data/place-names.json'
import _spreadsheetData from '../data/spreadsheet-data.json'
import _teamcraftData from '../data/teamcraft-data.json'

export type Locale = 'en' | 'de' | 'fr' | 'ja' | 'cn' | 'ko'
export type Translatable<T> = Record<Locale, T>

export interface Achievement {
  id: number
  icon: number
  name: Translatable<string>
  description: Translatable<string>
  reward: Translatable<string>
  order: number
}

export const achievements = _achievements as Record<number, Achievement>

export interface Bait {
  id: number
  icon: number
  name: Translatable<string>
}

export const baits = _baits as Record<number, Bait>

export interface ContentBonus {
  id: number
  icon: number
  objective: Translatable<string>
  requirement: Translatable<string>
  bonus: number
  order: number
}

export const contentBonuses = _contentBonuses as Record<number, ContentBonus>

export interface Fish {
  id: number
  icon: number
  name: Translatable<string>
  description: Translatable<string>
  contentBonus: number | null
}

export const fishes = _fishes as Record<number, Fish>

export interface FishingSpot {
  id: number
  placeName_main: number
  placeName_sub: number
  placeName: number
  fishes: number[]
  order: number
}

export const fishingSpots = _fishingSpots as Record<number, FishingSpot>

export interface PlaceName {
  id: number
  name: Translatable<string>
  name_noArticle: Translatable<string>
}

export const placeNames = _placeNames as Record<number, PlaceName>

export interface LodestoneData {
  item?: string
  icon_sm?: string
  icon_md?: string
  icon_lg?: string
}

export const lodestoneData = _lodestoneData as Record<number, LodestoneData | null>

export interface SpreadsheetData {
  moochable?: boolean
  mooched?: boolean
  moochOnly?: boolean
  intuition?: boolean
  baits?: Record<number, {
    biteTime?: [number, number | null]
    usable?: boolean
    best?: boolean
  }>
  points?: number
  doubleHook?: [number, number]
  tripleHook?: [number, number]
  tug?: number
  hookset?: 'Precision' | 'Powerful'
  stars?: number
  mooches?: Record<string, { // TODO: use fish ID instead?
    biteTime?: [number, number | null]
    usable?: boolean
    best?: boolean
  }>
  timeAvailability?: Array<'D' | 'S' | 'N'> // TODO: ???
  weatherAvailability?: {
    type: 'ALL'
    weathers: undefined
  } | {
    type: 'OK' | 'NOT OK'
    weathers: OceanFishingWeather[]
  }
}

export type OceanFishingWeather =
  'Blizzards' |
  'ClearSkies' |
  'Clouds' |
  'DustStorms' |
  'FairSkies' |
  'Fog' |
  'Gales' |
  'HeatWaves' |
  'Rain' |
  'Showers' |
  'Snow' |
  'Thunder' |
  'Thunderstorms' |
  'Wind'

export const spreadsheetData = _spreadsheetData as unknown as Record<number, SpreadsheetData | null>

export interface TeamcraftData {
  baits?: Record<number, {
    low?: number
    height?: number
    biteTimes?: Record<number, number>
  }>
}

export const teamcraftData = _teamcraftData as Record<number, TeamcraftData | null>
