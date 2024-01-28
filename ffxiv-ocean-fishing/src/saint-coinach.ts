import { parse as csvParse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

const SAINT_COINACH = path.resolve(__dirname, '..\\data\\SaintCoinach.Cmd\\2023.11.09.0000.0000')
const SAINT_COINACH_CN = path.resolve(__dirname, '..\\data\\ffxiv-datamining-cn')
const SAINT_COINACH_KO = path.resolve(__dirname, '..\\data\\ffxiv-datamining-ko')

export const FOLDER = SAINT_COINACH

/**
 * Parse a .csv file created by SaintCoinach.
 *
 * @param key The name of the .csv file
 * @param locale The locale or `undefined`
 * @returns A `SaintCoinachCsv` object representing the file
 */
export function requireCsv<T extends { '#': number } = any> (key: string, locale?: 'en' | 'fr' | 'de' | 'ja' | 'cn' | 'ko'): SaintCoinachCsv<T> {
  switch (locale) {
    case 'en':
    case 'fr':
    case 'de':
    case 'ja':
      return new SaintCoinachCsv<T>(path.join(SAINT_COINACH, 'raw-exd-all', `${key}.${locale}.csv`))
    case 'cn':
      return new SaintCoinachCsv<T>(path.join(SAINT_COINACH_CN, `${key}.csv`))
    case 'ko':
      return new SaintCoinachCsv<T>(path.join(SAINT_COINACH_KO, 'csv', `${key}.csv`))
    case undefined:
      return new SaintCoinachCsv<T>(path.join(SAINT_COINACH, 'raw-exd-all', `${key}.csv`))
  }
}

/**
 * Represents a single SaintCoinach .csv file. Handles mapping keys and casting to the correct types.
 */
export class SaintCoinachCsv<T extends { '#': number }> {
  keys: Record<string, string>
  types: Record<string, string>
  data: T[]

  constructor (file: string) {
    // Read the file and parse it as .csv
    console.log('Reading file', file)
    const csv = csvParse(fs.readFileSync(file), { columns: true })

    // The first row contains the names of the columns, and the second row contains the type
    const [_keys, _types, ..._data] = csv as [
      Record<string, string>,
      Record<string, string>,
      ...Array<Record<string, any>>
    ]

    this.keys = mapKeys(_keys, _keys)
    this.types = mapKeys(_keys, _types)
    this.data = _data.map(datum => castValues(this.types, mapKeys(_keys, datum))) as T[]
  }

  // Get the entry with the associated id
  get (id: number): T | undefined {
    return this.data.find(({ '#': rowId }) => rowId === id)
  }
}

/**
 * Rename the keys of `datum` according to the mapping defined by `keys`.
 * If `keys` doesn't contain a definition for the requested key, then `<UNKNOWN_${key}>` is used instead.
 * @param keys A mapping defining how keys should be renamed
 * @param datum The object whose keys should be renamed
 * @returns The object with renamed keys
 */
function mapKeys (keys: Record<string, string>, datum: Record<string, any>): Record<string, string> {
  const mappedDatum: Record<string, any> = {}

  for (const [key, value] of Object.entries(datum)) {
    const mappedKey = keys[key] !== '' ? keys[key] : `<UNKNOWN_${key}>`
    mappedDatum[mappedKey] = value
  }

  return mappedDatum
}

/**
 * Cast the values of `datum` according to the types defined by `types`.
 * @param types A mapping defining keys with their types
 * @param datum The object whose values should be parsed
 * @returns The object with parsed values
 */
function castValues (types: Record<string, string>, datum: Record<string, any>): Record<string, any> {
  for (const [key, value] of Object.entries(datum)) {
    const type = types[key]

    if (/^s?byte$/.test(type) || /^u?int\d+$/.test(type)) {
      datum[key] = Number(value)
    } else if (/^bit&\d+$/.test(type)) {
      datum[key] = (value === 'True')
    } else if (type === 'Color') {
      const color = Number(value)
      datum[key] = {
        R: (color & 0xFF0000) >> 16,
        G: (color & 0x00FF00) >> 8,
        B: (color & 0x0000FF) >> 0
      }
    }
  }

  return datum
}

export function parseIconId (icon: string): number {
  const match = icon.match(/^ui\/icon\/\d{6}\/(\d{6}).(?:tex|png)$/)

  if (match !== null) {
    return Number(match[1])
  } else {
    throw new Error(`Could not parse Icon ID from '${icon}'`)
  }
}

export function getIcon (id: number): { path: string, buffer: Buffer } {
  const folder = padZeroes(id - (id % 1000))
  const fileName = padZeroes(id)

  const file = path.join(SAINT_COINACH, 'ui/icon', folder, fileName + '.png')
  const buffer = fs.readFileSync(file)

  return { path: file, buffer }
}

function padZeroes (id: number): string {
  return `000000${id}`.slice(-6)
}
