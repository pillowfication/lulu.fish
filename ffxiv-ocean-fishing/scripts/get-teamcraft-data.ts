import { boxplot } from '@sgratzl/boxplots'
import fs from 'fs'
import path from 'path'
import fishingSpots from '../data/fishing-spots.json'

const OUTPUT = path.resolve(__dirname, '../data/teamcraft-data.json')

const teamcraftData: Record<string, Record<number, Record<number, Array<[number, number]>>>> = {}
for (const spotId of Object.keys(fishingSpots)) {
  if (spotId === '0') {
    continue
  }
  teamcraftData[spotId] = require(`../data/teamcraft/spot-${spotId}.json`)
}

const newData: Record<number, any> = {}

for (const spotId of Object.keys(teamcraftData)) {
  const spotData = teamcraftData[spotId]
  for (const fishId of Object.keys(spotData)) {
    const fishData = spotData[Number(fishId)]
    newData[Number(fishId)] = {
      baits: Object.keys(fishData).reduce<Record<number, any>>((baits, baitId) => {
        const baitData = fishData[Number(baitId)]
        const boxplotStats = boxplot(baitData.map(([biteTime, occurrences]) =>
          Array.from({ length: occurrences }).map(() => biteTime)
        ).flat())
        baits[Number(baitId)] = {
          low: boxplotStats.whiskerLow,
          high: boxplotStats.whiskerHigh,
          biteTimes: baitData
            .sort(([biteTimeA], [biteTimeB]) => biteTimeA - biteTimeB)
            .reduce<Record<number, number>>((acc, [biteTime, occurrences]) => {
              acc[biteTime] = occurrences
              return acc
            }, {})
        }
        return baits
      }, {})
    }
  }
}

fs.writeFileSync(OUTPUT, JSON.stringify(newData))

console.log('Done!')
