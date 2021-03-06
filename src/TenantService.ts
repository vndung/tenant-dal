import format from 'pg-format'
import DBPool from './DBPool'
import migrate from 'node-pg-migrate'

const DEFAULT_OPTS = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
}

export default class TenantService {
  _pool?: DBPool

  constructor(pool: DBPool) {
    this._pool = pool
  }

  async create(name: string) {
    await this._pool?.connect(DEFAULT_OPTS)

    // TODO: generate tenant password and save it to the master database
    await this._pool?.query(
      format('CREATE ROLE %I WITH LOGIN PASSWORD %L;', name, name)
    )

    await this._pool?.query(
      format('CREATE SCHEMA %I AUTHORIZATION %I;', name, name)
    )

    await this._pool?.close()

    await migrate({
      schema: name,
      direction: 'up',
      log: () => {},
      noLock: true,
      dir: 'migrations',
      databaseUrl: {
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: name,
        password: name,
      },
      migrationsTable: 'migrations',
      count: Infinity,
    })

    await this._pool?.connect({
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: name,
      password: name,
    })

    const currentUser = await this._pool?.query(`SELECT current_user;`)
    return JSON.stringify(currentUser?.rows)
  }
}
