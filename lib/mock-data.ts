// Mock data for frontend-only development (no MongoDB required)

export const mockCategories = [
  { _id: 'cat-1', name: 'Clothing', slug: 'clothing' },
  { _id: 'cat-2', name: 'Accessories', slug: 'accessories' },
  { _id: 'cat-3', name: 'Footwear', slug: 'footwear' },
  { _id: 'cat-4', name: 'Bags', slug: 'bags' },
  { _id: 'cat-5', name: 'Jewellery', slug: 'jewellery' },
  { _id: 'cat-6', name: 'Home & Living', slug: 'home-living' },
  { _id: 'cat-7', name: 'Digital', slug: 'digital' },
  { _id: 'cat-8', name: 'Art', slug: 'art' },
]

export const mockDesigners = [
  {
    _id: 'des-1',
    name: 'Nina Lomidze',
    username: 'nina-lomidze',
    storeName: 'NINA L.',
    bio: 'Tbilisi-based womenswear designer. Clean silhouettes, natural fabrics.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    socialLinks: { instagram: 'ninalomidze', website: '' },
    role: 'designer',
    status: 'approved',
  },
  {
    _id: 'des-2',
    name: 'Giorgi Kvaratskhelia',
    username: 'gk-studio',
    storeName: 'GK Studio',
    bio: 'Streetwear meets Georgian craft. Limited drops, always handmade.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    socialLinks: { instagram: 'gkstudio', website: '' },
    role: 'designer',
    status: 'approved',
  },
  {
    _id: 'des-3',
    name: 'Mariam Beridze',
    username: 'mariam-b',
    storeName: 'Mariam B.',
    bio: 'Jewellery and objects. Silver, stone, and slow making.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    socialLinks: { instagram: 'mariamb', website: '' },
    role: 'designer',
    status: 'approved',
  },
  {
    _id: 'des-4',
    name: 'Luka Tabatadze',
    username: 'luka-t',
    storeName: 'LT Objects',
    bio: 'Bags and leather goods. Every piece takes two weeks to make.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    socialLinks: { instagram: 'ltobjects', website: '' },
    role: 'designer',
    status: 'approved',
  },
  {
    _id: 'des-5',
    name: 'Ana Gogitidze',
    username: 'ana-g',
    storeName: 'Studio Ana',
    bio: 'Knitwear and textiles. Slow fashion from the Caucasus.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    socialLinks: { instagram: 'studioana', website: '' },
    role: 'designer',
    status: 'approved',
  },
  {
    _id: 'des-6',
    name: 'Davit Mchedlishvili',
    username: 'davit-m',
    storeName: 'DAVIT M',
    bio: 'Graphic art and digital prints. Download and print anywhere.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    socialLinks: { instagram: 'davitm', website: '' },
    role: 'designer',
    status: 'approved',
  },
]

export const mockProducts = [
  {
    _id: 'prod-1',
    slug: 'oversized-linen-coat-natural',
    title: 'Oversized Linen Coat — Natural',
    description: 'A relaxed, floor-length coat in 100% undyed linen. Slightly stiff when new, softens beautifully with wear. One size fits most.',
    aiDescription: 'Undyed and unhurried — this linen coat is cut long and left raw at the hem. Meant to be worn open, layered, lived in.',
    price: 280,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4b4571?w=800&q=80',
    ],
    type: 'physical',
    category: { _id: 'cat-1', name: 'Clothing', slug: 'clothing' },
    designer: mockDesigners[0],
    variants: [
      { size: 'XS/S', color: 'Natural', stock: 3, sku: 'NL-COAT-XS' },
      { size: 'M/L', color: 'Natural', stock: 2, sku: 'NL-COAT-ML' },
      { size: 'XL/XXL', color: 'Natural', stock: 1, sku: 'NL-COAT-XL' },
    ],
    weight: 800,
    tags: ['linen', 'coat', 'natural', 'oversized', 'slow-fashion'],
    status: 'published',
    featured: true,
    views: 342,
    soldCount: 12,
  },
  {
    _id: 'prod-2',
    slug: 'hand-painted-silk-scarf-blue',
    title: 'Hand-Painted Silk Scarf — Indigo',
    description: 'Each scarf is hand-painted individually — no two are exactly the same. Pure silk, 90×90cm.',
    aiDescription: 'Silk absorbs dye the way fabric remembers hands — slowly, unevenly, beautifully. Each piece is a one-off.',
    price: 95,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
    ],
    type: 'physical',
    category: { _id: 'cat-2', name: 'Accessories', slug: 'accessories' },
    designer: mockDesigners[0],
    variants: [
      { size: '90×90cm', color: 'Indigo', stock: 5, sku: 'NL-SCARF-IND' },
    ],
    weight: 120,
    tags: ['silk', 'scarf', 'hand-painted', 'indigo', 'one-of-a-kind'],
    status: 'published',
    featured: true,
    views: 210,
    soldCount: 8,
  },
  {
    _id: 'prod-3',
    slug: 'washed-denim-jacket-raw-edge',
    title: 'Washed Denim Jacket — Raw Edge',
    description: 'Stone-washed Japanese selvedge denim. Raw edges intentionally left unfinished. Boxy fit.',
    aiDescription: 'Cut from selvedge denim and left unfinished where others would stitch. Boxy, heavy, already worn-in looking.',
    price: 195,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800&q=80',
    ],
    type: 'physical',
    category: { _id: 'cat-1', name: 'Clothing', slug: 'clothing' },
    designer: mockDesigners[1],
    variants: [
      { size: 'S', color: 'Stone Wash', stock: 2, sku: 'GK-DJ-S' },
      { size: 'M', color: 'Stone Wash', stock: 4, sku: 'GK-DJ-M' },
      { size: 'L', color: 'Stone Wash', stock: 3, sku: 'GK-DJ-L' },
      { size: 'XL', color: 'Stone Wash', stock: 1, sku: 'GK-DJ-XL' },
    ],
    weight: 650,
    tags: ['denim', 'jacket', 'selvedge', 'raw', 'streetwear'],
    status: 'published',
    featured: true,
    views: 489,
    soldCount: 21,
  },
  {
    _id: 'prod-4',
    slug: 'silver-cast-ring-pebble',
    title: 'Silver Cast Ring — Pebble',
    description: 'Cast directly from a river pebble found in the Mtkvari River. Sterling silver, 925. Made to order — specify ring size at checkout.',
    aiDescription: 'A pebble from the Mtkvari River, cast in sterling silver. The river made the shape; the workshop made it wearable.',
    price: 120,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    ],
    type: 'physical',
    category: { _id: 'cat-5', name: 'Jewellery', slug: 'jewellery' },
    designer: mockDesigners[2],
    variants: [
      { size: '6', stock: 2, sku: 'MB-RING-6', color: 'Silver' },
      { size: '7', stock: 3, sku: 'MB-RING-7', color: 'Silver' },
      { size: '8', stock: 2, sku: 'MB-RING-8', color: 'Silver' },
      { size: '9', stock: 1, sku: 'MB-RING-9', color: 'Silver' },
    ],
    weight: 30,
    tags: ['silver', 'ring', 'cast', 'handmade', 'jewellery', 'georgia'],
    status: 'published',
    featured: false,
    views: 178,
    soldCount: 9,
  },
  {
    _id: 'prod-5',
    slug: 'vegetable-tanned-tote-chestnut',
    title: 'Vegetable-Tanned Tote — Chestnut',
    description: 'Full-grain vegetable-tanned leather. Unlined for a raw feel. Brass hardware. Ages beautifully with use.',
    aiDescription: 'Leather that shows where it has been — unlined, uncoated, vegetable-tanned in chestnut. A bag that earns its character.',
    price: 340,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    ],
    type: 'physical',
    category: { _id: 'cat-4', name: 'Bags', slug: 'bags' },
    designer: mockDesigners[3],
    variants: [
      { size: 'One Size', color: 'Chestnut', stock: 4, sku: 'LT-TOTE-CH' },
    ],
    weight: 700,
    tags: ['leather', 'tote', 'vegetable-tanned', 'handmade', 'bag'],
    status: 'published',
    featured: true,
    views: 301,
    soldCount: 7,
  },
  {
    _id: 'prod-6',
    slug: 'merino-wool-crewneck-undyed',
    title: 'Merino Wool Crewneck — Undyed',
    description: 'Hand-knitted merino crewneck in natural undyed wool. Slightly chunky gauge, boxy fit, ribbed cuffs and collar.',
    aiDescription: 'Merino in its natural state — cream and lanolin-soft. Knitted slowly, worn indefinitely.',
    price: 165,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80',
    ],
    type: 'physical',
    category: { _id: 'cat-1', name: 'Clothing', slug: 'clothing' },
    designer: mockDesigners[4],
    variants: [
      { size: 'S', color: 'Undyed', stock: 2, sku: 'AG-MW-S' },
      { size: 'M', color: 'Undyed', stock: 3, sku: 'AG-MW-M' },
      { size: 'L', color: 'Undyed', stock: 2, sku: 'AG-MW-L' },
    ],
    weight: 500,
    tags: ['merino', 'wool', 'knitwear', 'undyed', 'slow-fashion', 'handmade'],
    status: 'published',
    featured: false,
    views: 214,
    soldCount: 6,
  },
  {
    _id: 'prod-7',
    slug: 'typography-poster-pack-digital',
    title: 'Georgian Typography Poster Pack — Digital',
    description: 'Set of 6 high-resolution poster designs featuring Georgian script. A4 and A3, print-ready PDF. Instant download.',
    aiDescription: 'Georgian script rendered bold and minimal — six posters that look good anywhere. Download once, print forever.',
    price: 18,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    ],
    type: 'digital',
    category: { _id: 'cat-7', name: 'Digital', slug: 'digital' },
    designer: mockDesigners[5],
    variants: [],
    digitalFileUrl: '/downloads/georgian-typography-pack.zip',
    tags: ['georgian', 'typography', 'poster', 'digital', 'print', 'download'],
    status: 'published',
    featured: false,
    views: 527,
    soldCount: 84,
  },
  {
    _id: 'prod-8',
    slug: 'hand-thrown-ceramic-cup-ash',
    title: 'Hand-Thrown Ceramic Cup — Ash Glaze',
    description: 'Wheel-thrown stoneware cup with a natural ash glaze. Each piece varies slightly in shape and glaze pooling. 280ml capacity.',
    aiDescription: 'Ash glaze pools differently every firing — no two cups come out the same. Stoneware that holds heat and character in equal measure.',
    price: 55,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&q=80',
    ],
    type: 'physical',
    category: { _id: 'cat-6', name: 'Home & Living', slug: 'home-living' },
    designer: mockDesigners[2],
    variants: [
      { size: '280ml', color: 'Ash', stock: 8, sku: 'MB-CUP-ASH' },
    ],
    weight: 350,
    tags: ['ceramic', 'cup', 'handmade', 'ash-glaze', 'stoneware', 'home'],
    status: 'published',
    featured: false,
    views: 132,
    soldCount: 15,
  },
  {
    _id: 'prod-9',
    slug: 'raw-canvas-crossbody-natural',
    title: 'Raw Canvas Crossbody — Natural',
    description: 'Waxed canvas crossbody bag with vegetable-tanned leather straps. Aged brass zipper. Fits A5, phone, keys.',
    aiDescription: 'Canvas waxed to resist weather and age into something better. Small enough to move in, large enough to matter.',
    price: 145,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80',
    ],
    type: 'physical',
    category: { _id: 'cat-4', name: 'Bags', slug: 'bags' },
    designer: mockDesigners[3],
    variants: [
      { size: 'One Size', color: 'Natural', stock: 6, sku: 'LT-CB-NAT' },
    ],
    weight: 420,
    tags: ['canvas', 'crossbody', 'waxed', 'leather', 'bag', 'everyday'],
    status: 'published',
    featured: false,
    views: 198,
    soldCount: 11,
  },
  {
    _id: 'prod-10',
    slug: 'wide-leg-trousers-wool-charcoal',
    title: 'Wide-Leg Trousers — Wool Charcoal',
    description: 'High-waisted wide-leg trousers in a medium-weight Italian wool. Pleated front, side pockets, raw-hem finish.',
    aiDescription: 'Italian wool cut wide and pleated high — structured enough for a meeting, loose enough to forget you are wearing them.',
    price: 220,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    ],
    type: 'physical',
    category: { _id: 'cat-1', name: 'Clothing', slug: 'clothing' },
    designer: mockDesigners[0],
    variants: [
      { size: 'XS', color: 'Charcoal', stock: 2, sku: 'NL-TRST-XS' },
      { size: 'S', color: 'Charcoal', stock: 3, sku: 'NL-TRST-S' },
      { size: 'M', color: 'Charcoal', stock: 3, sku: 'NL-TRST-M' },
      { size: 'L', color: 'Charcoal', stock: 1, sku: 'NL-TRST-L' },
    ],
    weight: 550,
    tags: ['wool', 'trousers', 'wide-leg', 'charcoal', 'pleated'],
    status: 'published',
    featured: true,
    views: 276,
    soldCount: 9,
  },
  {
    _id: 'prod-11',
    slug: 'oxidised-silver-necklace-chain',
    title: 'Oxidised Silver Necklace — Heavy Chain',
    description: 'Hand-fabricated heavy link chain in oxidised sterling silver. 50cm length with toggle clasp. Each link shaped individually.',
    aiDescription: 'Heavy chain darkened by oxidation — worn, aged, present. Every link shaped by hand from sterling silver.',
    price: 185,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    ],
    type: 'physical',
    category: { _id: 'cat-5', name: 'Jewellery', slug: 'jewellery' },
    designer: mockDesigners[2],
    variants: [
      { size: '50cm', color: 'Oxidised Silver', stock: 3, sku: 'MB-NC-50' },
    ],
    weight: 45,
    tags: ['silver', 'necklace', 'chain', 'oxidised', 'handmade', 'jewellery'],
    status: 'published',
    featured: false,
    views: 155,
    soldCount: 4,
  },
  {
    _id: 'prod-12',
    slug: 'graphic-hoodie-cut-label',
    title: 'Graphic Hoodie — CUT Label',
    description: 'Heavy French terry hoodie with screen-printed RAW CUT graphic on back. Garment-dyed in small batches. Oversized fit.',
    aiDescription: 'French terry dyed in small batches, screen-printed by hand. Oversized and intentionally heavy — the weight is the point.',
    price: 135,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
    ],
    type: 'physical',
    category: { _id: 'cat-1', name: 'Clothing', slug: 'clothing' },
    designer: mockDesigners[1],
    variants: [
      { size: 'S', color: 'Washed Black', stock: 5, sku: 'GK-HD-S-BK' },
      { size: 'M', color: 'Washed Black', stock: 8, sku: 'GK-HD-M-BK' },
      { size: 'L', color: 'Washed Black', stock: 6, sku: 'GK-HD-L-BK' },
      { size: 'XL', color: 'Washed Black', stock: 3, sku: 'GK-HD-XL-BK' },
    ],
    weight: 600,
    tags: ['hoodie', 'graphic', 'garment-dyed', 'oversized', 'streetwear'],
    status: 'published',
    featured: true,
    views: 612,
    soldCount: 47,
  },
]

// Helpers
export function getMockProduct(slug: string) {
  return mockProducts.find((p) => p.slug === slug) ?? null
}

export function getMockDesigner(username: string) {
  return mockDesigners.find((d) => d.username === username) ?? null
}

export function getMockDesignerProducts(designerId: string) {
  return mockProducts.filter((p) => p.designer._id === designerId)
}

export function getMockFeaturedProducts() {
  return mockProducts.filter((p) => p.featured)
}

export function filterMockProducts(params: {
  q?: string
  category?: string
  type?: string
  minPrice?: number
  maxPrice?: number
}) {
  let results = [...mockProducts]

  if (params.q) {
    const q = params.q.toLowerCase()
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    )
  }
  if (params.category) {
    results = results.filter((p) => p.category.slug === params.category)
  }
  if (params.type) {
    results = results.filter((p) => p.type === params.type)
  }
  if (params.minPrice) {
    results = results.filter((p) => p.price >= params.minPrice!)
  }
  if (params.maxPrice) {
    results = results.filter((p) => p.price <= params.maxPrice!)
  }

  return results
}
