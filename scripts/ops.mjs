#!/usr/bin/env node
// Satori ops CLI — talks to the Supabase Management API and the Vercel API
// using tokens from .env.local. Never prints secret values.
//
//   node scripts/ops.mjs sql "select count(*) from profiles"
//   node scripts/ops.mjs migrate supabase/migrations/<file>.sql
//   node scripts/ops.mjs types                 regenerate lib/database.types.ts
//   node scripts/ops.mjs advisors              Supabase security + performance lints
//   node scripts/ops.mjs env:list              Vercel env var names / targets
//   node scripts/ops.mjs env:push KEY [--plain] copy KEY from .env.local to Vercel (prod + preview)
//   node scripts/ops.mjs deploys [n]           latest Vercel deployments
//   node scripts/ops.mjs wait [sha]            wait until the deployment for a commit is READY
//   node scripts/ops.mjs bypass:create         preview-protection bypass secret -> .env.local
//   node scripts/ops.mjs bypass:revoke

import fs from 'fs'
import crypto from 'crypto'
import { execSync } from 'child_process'

const SUPABASE_REF = 'ooiddphmbwyepuacjpoz'          // "Satori PK", ap-south-1 (Mumbai)
const VERCEL_TEAM  = 'team_T8e7bGrqIpxCUVEP126ENESe'
const VERCEL_PRJ   = 'prj_PJluJv4ueQoiEcz1HYWUrFsSByM0' // "satoripk"
const ENV_FILE     = '.env.local'

const readEnv = () => Object.fromEntries(
  fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]))
const env = readEnv()

function setLocalEnv(key, value) {
  const lines = fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/).filter(Boolean)
  const i = lines.findIndex(l => l.startsWith(`${key}=`))
  if (value === null) { if (i >= 0) lines.splice(i, 1) }
  else if (i >= 0) lines[i] = `${key}=${value}`
  else lines.push(`${key}=${value}`)
  fs.writeFileSync(ENV_FILE, lines.join('\n') + '\n')
}

async function supabase(method, path, body) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  })
  const text = await res.text()
  let json; try { json = JSON.parse(text) } catch { json = text }
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${typeof json === 'string' ? json : JSON.stringify(json)}`)
  return json
}

async function vercel(method, path, body) {
  const sep = path.includes('?') ? '&' : '?'
  const res = await fetch(`https://api.vercel.com${path}${sep}teamId=${VERCEL_TEAM}`, {
    method,
    headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`Vercel ${res.status}: ${json?.error?.message ?? JSON.stringify(json)}`)
  return json
}

const sql = query => supabase('POST', `/projects/${SUPABASE_REF}/database/query`, { query })
const sleep = ms => new Promise(r => setTimeout(r, ms))

const commands = {
  async sql(query) {
    if (!query) throw new Error('usage: sql "<query>"')
    console.log(JSON.stringify(await sql(query), null, 2))
  },

  async migrate(file) {
    if (!file) throw new Error('usage: migrate <file.sql>')
    await sql(fs.readFileSync(file, 'utf8'))
    console.log(`applied ${file}`)
  },

  async types() {
    const { types } = await supabase('GET', `/projects/${SUPABASE_REF}/types/typescript?included_schemas=public`)
    fs.writeFileSync('lib/database.types.ts', types)
    console.log('wrote lib/database.types.ts')
  },

  async advisors() {
    for (const kind of ['security', 'performance']) {
      const { lints = [] } = await supabase('GET', `/projects/${SUPABASE_REF}/advisors/${kind}`)
      console.log(`== ${kind}${lints.length ? '' : ': none'}`)
      for (const l of lints) console.log(`  ${l.level} ${l.name} — ${(l.detail || '').replace(/\\`/g, '`')}`)
    }
  },

  async 'env:list'() {
    const { envs = [] } = await vercel('GET', `/v10/projects/${VERCEL_PRJ}/env`)
    for (const e of envs) console.log(`${e.key.padEnd(32)} ${e.type.padEnd(10)} ${e.target.join('+')}`)
  },

  async 'env:push'(key, flag) {
    if (!key) throw new Error('usage: env:push KEY [--plain]')
    if (!env[key]) throw new Error(`${key} is not set in ${ENV_FILE}`)
    const type = flag === '--plain' || key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'sensitive'
    const { envs = [] } = await vercel('GET', `/v10/projects/${VERCEL_PRJ}/env`)
    for (const e of envs.filter(e => e.key === key)) await vercel('DELETE', `/v9/projects/${VERCEL_PRJ}/env/${e.id}`)
    await vercel('POST', `/v10/projects/${VERCEL_PRJ}/env`, { key, value: env[key], type, target: ['production', 'preview'] })
    console.log(`${key} -> Vercel (${type}, production+preview). Redeploy for it to take effect.`)
  },

  async deploys(n = '5') {
    const { deployments = [] } = await vercel('GET', `/v6/deployments?projectId=${VERCEL_PRJ}&limit=${n}`)
    for (const d of deployments) {
      console.log(`${d.state.padEnd(9)} ${(d.target || 'preview').padEnd(10)} ${(d.meta?.githubCommitRef || '').padEnd(28)} ${(d.meta?.githubCommitSha || '').slice(0, 7)}  https://${d.url}`)
    }
  },

  async wait(sha) {
    sha ||= execSync('git rev-parse HEAD').toString().trim()
    for (let i = 0; i < 90; i++) {
      const { deployments = [] } = await vercel('GET', `/v6/deployments?projectId=${VERCEL_PRJ}&limit=10`)
      const d = deployments.find(d => d.meta?.githubCommitSha?.startsWith(sha.slice(0, 7)))
      if (d && ['READY', 'ERROR', 'CANCELED'].includes(d.state)) {
        console.log(`${d.state} ${d.target || 'preview'} https://${d.url}`)
        if (d.state !== 'READY') process.exitCode = 1
        return
      }
      await sleep(10_000)
    }
    throw new Error(`no finished deployment for ${sha.slice(0, 7)} after 15 minutes`)
  },

  async 'bypass:create'() {
    const secret = crypto.randomBytes(16).toString('hex')
    await vercel('PATCH', `/v1/projects/${VERCEL_PRJ}/protection-bypass`, { generate: { secret, note: 'claude e2e' } })
    setLocalEnv('VERCEL_BYPASS_SECRET', secret)
    console.log('bypass secret saved to .env.local as VERCEL_BYPASS_SECRET')
  },

  async 'bypass:revoke'() {
    if (!env.VERCEL_BYPASS_SECRET) return console.log('no VERCEL_BYPASS_SECRET in .env.local')
    await vercel('PATCH', `/v1/projects/${VERCEL_PRJ}/protection-bypass`, { revoke: { secret: env.VERCEL_BYPASS_SECRET, regenerate: false } })
    setLocalEnv('VERCEL_BYPASS_SECRET', null)
    console.log('bypass secret revoked')
  },
}

const [cmd, ...args] = process.argv.slice(2)
if (!commands[cmd]) {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).join('\n'))
  process.exit(cmd ? 1 : 0)
}
commands[cmd](...args).catch(err => { console.error(err.message); process.exit(1) })
