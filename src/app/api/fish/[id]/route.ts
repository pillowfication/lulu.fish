import { fishes, lodestoneData, spreadsheetData, teamcraftData } from '@ffxiv-ocean-fishing/src/data'

export function GET (request: Request, { params }: { params: { id: string } }): Response {
  const id = params.id

  if (id in fishes) {
    const fish = fishes[id as any]
    const fishData = {
      ...fish,
      lodestoneData: lodestoneData[id as any] ?? null,
      spreadsheetData: spreadsheetData[id as any] ?? null,
      teamcraftData: teamcraftData[id as any] ?? null
    }
    return Response.json({ result: fishData, error: null })
  } else {
    return Response.json({ result: null, error: `Fish '${id}' could not be found` })
  }
}
