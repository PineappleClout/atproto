import { AdxUri } from '@adxp/uri'
import { DataDiff, Repo } from '@adxp/repo'
import Database from './db'

export const processDiff = async (
  db: Database,
  repo: Repo,
  diff: DataDiff,
): Promise<void> => {
  db.assertTransaction()
  const did = repo.did()
  const adds = diff.addList().map(async (add) => {
    const loaded = await repo.blockstore.getUnchecked(add.cid)
    const uri = new AdxUri(`${did}/${add.key}`)
    await db.indexRecord(uri, add.cid, loaded)
  })
  const updates = diff.updateList().map(async (_update) => {
    throw new Error('Updates are not implemented yet')
    // const loaded = await repo.blockstore.getUnchecked(update.cid)
    // const uri = new AdxUri(`${did}/${update.key}`)
    // await db.indexRecord(uri, update.cid, loaded)
  })
  const deletes = diff.deleteList().map(async (del) => {
    const uri = new AdxUri(`${did}/${del.key}`)
    await db.deleteRecord(uri)
  })

  await Promise.all([...adds, ...updates, ...deletes])

  // @TODO notify subscribers
}
