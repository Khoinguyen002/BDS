import type { PayloadRequest } from 'payload'

const blacklistedRoutes = ['admin', 'api', 'can-ho', '_next']

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function generateUniqueSlug(base: string, req: PayloadRequest): Promise<string> {
  const normalized = normalizeString(base)
  
  if (blacklistedRoutes.includes(normalized)) {
    return generateUniqueSlug(`${normalized}-1`, req)
  }

  const { payload } = req

  let isUnique = false
  let count = 0
  let currentSlug = normalized

  while (!isUnique) {
    const existing = await payload.find({
      collection: 'landing-pages',
      where: { slug: { equals: currentSlug } },
      req, // crucial: pass req down so it participates in the transaction
      depth: 0,
    })

    if (existing.totalDocs === 0) {
      isUnique = true
    } else {
      count++
      currentSlug = `${normalized}-${count}`
    }
  }

  return currentSlug
}
