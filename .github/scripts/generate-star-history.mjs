/**
 * Generate brand-styled star-history SVGs for the README.
 * Fetches stargazer timestamps via the GitHub API (requires GITHUB_TOKEN
 * with collaborator access), then writes light + dark charts with axes
 * and no redundant title (README already has "Star 历史").
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OWNER = process.env.STAR_HISTORY_OWNER || 'nicejade'
const REPO = process.env.STAR_HISTORY_REPO || 'wealth-tracker'
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
const OUT_DIR = process.env.STAR_HISTORY_OUT || '.github/shieldcn'
const WIDTH = 800
const HEIGHT = 360
const BRAND = '#f59e0b'
const SAMPLE_POINTS = 48
const Y_TICKS = 4
const X_TICKS = 4

const THEMES = {
  light: {
    fg: '#1d1d1f',
    muted: '#636366',
    grid: 'rgba(0,0,0,0.08)',
    areaOpacity: 0.22,
  },
  dark: {
    fg: '#fafafa',
    muted: '#a1a1aa',
    grid: 'rgba(255,255,255,0.12)',
    areaOpacity: 0.28,
  },
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function r2(n) {
  return Math.round(n * 100) / 100
}

function niceMax(value) {
  if (value <= 5) return 5
  const pow = Math.pow(10, Math.floor(Math.log10(value)))
  for (const s of [1, 2, 2.5, 5, 10]) {
    const candidate = s * pow
    if (candidate >= value) return candidate
  }
  return 10 * pow
}

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`
  return String(Math.round(n))
}

function dateLabel(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

async function ghJson(url) {
  const headers = {
    Accept: 'application/vnd.github.star+json',
    'User-Agent': 'wealth-tracker-star-history',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`

  const res = await fetch(url, { headers })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub API ${res.status} ${url}: ${body.slice(0, 200)}`)
  }
  const link = res.headers.get('link') || ''
  const data = await res.json()
  return { data, link }
}

function nextPage(linkHeader) {
  const m = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
  return m ? m[1] : null
}

async function fetchStarredAt() {
  const times = []
  let url = `https://api.github.com/repos/${OWNER}/${REPO}/stargazers?per_page=100`
  while (url) {
    const { data, link } = await ghJson(url)
    for (const row of data) {
      if (row.starred_at) times.push(new Date(row.starred_at).getTime())
    }
    url = nextPage(link)
  }
  times.sort((a, b) => a - b)
  return times
}

async function fetchMeta() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'wealth-tracker-star-history',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, { headers })
  if (!res.ok) throw new Error(`Failed to fetch repo meta: ${res.status}`)
  return res.json()
}

/** Build cumulative [t, stars] samples for a smooth chart. */
function buildSeries(times, totalNow) {
  if (!times.length) {
    const now = Date.now()
    return [{ t: now - 86_400_000, v: 0 }, { t: now, v: totalNow || 0 }]
  }

  const points = []
  const n = times.length
  const step = Math.max(1, Math.floor(n / SAMPLE_POINTS))
  for (let i = 0; i < n; i += step) {
    points.push({ t: times[i], v: i + 1 })
  }
  const last = times[n - 1]
  if (points[points.length - 1].t !== last) {
    points.push({ t: last, v: n })
  }
  // Anchor at "now" with live total so the chart never undercounts.
  const now = Date.now()
  if (now > points[points.length - 1].t) {
    points.push({ t: now, v: Math.max(totalNow || n, n) })
  } else {
    points[points.length - 1].v = Math.max(totalNow || n, n)
  }
  return points
}

function renderSvg(points, mode) {
  const theme = THEMES[mode]
  const pad = { top: 24, right: 28, bottom: 36, left: 52 }
  const plotW = WIDTH - pad.left - pad.right
  const plotH = HEIGHT - pad.top - pad.bottom

  const tMin = points[0].t
  const tMax = points[points.length - 1].t || tMin + 1
  const yMax = niceMax(Math.max(...points.map((p) => p.v), 1))

  const xOf = (t) => pad.left + ((t - tMin) / (tMax - tMin || 1)) * plotW
  const yOf = (v) => pad.top + plotH - (v / yMax) * plotH

  const linePts = points.map((p) => `${r2(xOf(p.t))},${r2(yOf(p.v))}`).join(' ')
  const areaPts = [
    `${r2(xOf(points[0].t))},${r2(pad.top + plotH)}`,
    ...points.map((p) => `${r2(xOf(p.t))},${r2(yOf(p.v))}`),
    `${r2(xOf(points[points.length - 1].t))},${r2(pad.top + plotH)}`,
  ].join(' ')

  let grid = ''
  for (let i = 0; i <= Y_TICKS; i++) {
    const v = (yMax * i) / Y_TICKS
    const y = r2(yOf(v))
    grid += `<line x1="${pad.left}" y1="${y}" x2="${pad.left + plotW}" y2="${y}" stroke="${theme.grid}" stroke-width="1"${i === 0 ? '' : ' stroke-dasharray="3 3"'} />`
    grid += `<text x="${pad.left - 10}" y="${y + 3.5}" text-anchor="end" font-size="11" fill="${theme.muted}" font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">${esc(formatCount(v))}</text>`
  }

  let xLabels = ''
  for (let i = 0; i < X_TICKS; i++) {
    const t = tMin + ((tMax - tMin) * i) / (X_TICKS - 1)
    const x = r2(xOf(t))
    const anchor = i === 0 ? 'start' : i === X_TICKS - 1 ? 'end' : 'middle'
    xLabels += `<text x="${x}" y="${pad.top + plotH + 22}" text-anchor="${anchor}" font-size="11" fill="${theme.muted}" font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">${esc(dateLabel(new Date(t).toISOString()))}</text>`
  }

  const last = points[points.length - 1]
  const endDot = `<circle cx="${r2(xOf(last.t))}" cy="${r2(yOf(last.v))}" r="4" fill="${BRAND}" />`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="Star history of ${OWNER}/${REPO}">
  <defs>
    <linearGradient id="area-${mode}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND}" stop-opacity="${theme.areaOpacity}"/>
      <stop offset="100%" stop-color="${BRAND}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${grid}
  <polygon fill="url(#area-${mode})" points="${areaPts}"/>
  <polyline fill="none" stroke="${BRAND}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${linePts}"/>
  ${endDot}
  ${xLabels}
</svg>
`
}

async function main() {
  const meta = await fetchMeta()
  const total = meta.stargazers_count || 0
  console.log(`Repo ${OWNER}/${REPO}: ${total} stars`)

  let series
  try {
    const times = await fetchStarredAt()
    console.log(`Fetched ${times.length} stargazer timestamps`)
    series = buildSeries(times, total)
  } catch (err) {
    console.warn(`Stargazer history unavailable (${err.message}); using created_at → now`)
    const created = new Date(meta.created_at).getTime()
    series = [
      { t: created, v: 0 },
      { t: Date.now(), v: total },
    ]
  }

  mkdirSync(OUT_DIR, { recursive: true })

  for (const mode of ['light', 'dark']) {
    const svg = renderSvg(series, mode)
    const path = join(OUT_DIR, `star-chart-${mode}.svg`)
    writeFileSync(path, svg)
    console.log(`Wrote ${path}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
