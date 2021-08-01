import DBPool from './src/DBPool'
import TenantService from './src/TenantService'

async function start() {
  const pool = new DBPool()
  const tenantService = new TenantService(pool)

  try {
    const result = await tenantService.create('org-d')
    console.log(`created tenant: ${result}`)
  } catch (e) {
    console.error(e)
  }
}

start()