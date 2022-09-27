import { Server } from '../../../lexicon'
import { InvalidRequestError } from '@adxp/xrpc-server'
import * as util from '../../../util'
import { Repo } from '@adxp/repo'
import { AuthStore } from '@adxp/auth'

export default function (server: Server) {
  server.todo.adx.getAccountsConfig((_params, _input, _req, res) => {
    const cfg = util.getConfig(res)

    let availableUserDomains: string[]
    if (cfg.debugMode && cfg.didTestRegistry) {
      availableUserDomains = ['test']
    } else {
      throw new Error('TODO')
    }

    const inviteCodeRequired = true // TODO

    return {
      encoding: 'application/json',
      body: { availableUserDomains, inviteCodeRequired },
    }
  })

  server.todo.adx.getAccount(() => {
    // TODO
    return { encoding: '', body: {} }
  })

  server.todo.adx.createAccount(async (_params, input, _req, res) => {
    const { username, password } = input.body
    const cfg = util.getConfig(res)

    if (username.startsWith('did:')) {
      throw new InvalidRequestError(
        'Cannot register a username that starts with `did:`',
      )
    }

    let did
    let isTestUser = false
    if (username.endsWith('.test')) {
      if (!cfg.debugMode || !cfg.didTestRegistry) {
        throw new InvalidRequestError(
          'Cannot register a test user if debug mode is not enabled',
        )
      }
      did = `did:test:${username.replace(/\.test$/, '')}`
      isTestUser = true
    } else {
      throw new Error('Not yet able to allocate DIDs')
    }

    const { db, blockstore, keypair, auth } = util.getLocals(res)
    await db.registerUser(username, did, password)

    const authStore = await AuthStore.fromTokens(keypair, [])
    const repo = await Repo.create(blockstore, did, authStore)
    await db.setRepoRoot(did, repo.cid)

    if (isTestUser) {
      cfg.didTestRegistry?.set(username.slice(0, -5), {
        name: username,
        service: cfg.origin,
      })
    }

    const jwt = auth.createToken(did)
    return { encoding: 'application/json', body: { jwt, name: username, did } }
  })

  server.todo.adx.deleteAccount(() => {
    // TODO
    return { encoding: '', body: {} }
  })
}
