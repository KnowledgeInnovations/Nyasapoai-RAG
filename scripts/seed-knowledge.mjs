/**
 * seed-knowledge.mjs
 * Loads publicly available Devtraco Plus knowledge into the RAG database.
 * Run once: node scripts/seed-knowledge.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Parse .env.local ─────────────────────────────────────────
const envContent = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  if (!line || line.startsWith('#') || !line.includes('=')) continue
  const idx = line.indexOf('=')
  env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Knowledge documents ───────────────────────────────────────
const DOCUMENTS = [

  {
    title: 'Devtraco Plus — Company Overview & History',
    department: 'general',
    sensitivity: 'public',
    content: `
DEVTRACO PLUS — COMPANY OVERVIEW

Company Name: Devtraco Plus Ghana Limited
Parent Group: Devtraco Group
Founded: Spun off from Devtraco Limited in 2012
Head Office: No. 8B, Sir Arku Korsah Road, Airport Residential Area, Accra, Ghana
Phone: +233 (0) 302 798 692 | +233 (0) 270 000 004
Email: info@devtracoplus.com

HISTORY
Devtraco Plus was established in 2012 as a premium residential and hospitality development arm of the Devtraco Group, which itself has over three decades (30+ years) of experience in Ghana's real estate sector. The parent company, Devtraco Limited, was one of Ghana's pioneering institutional property developers. Devtraco Plus was created specifically to address the growing demand for premium, signature-quality residences in Accra's most prestigious neighbourhoods.

MISSION & VISION
Mission: To provide a heavenly range of property developments in the heart of Accra which will offer people a chance to achieve their dream lifestyle and investment goals.
Vision: To create a new generation of Signature Homes in Ghana — properties that set the benchmark for premium living in West Africa.

MARKET POSITION
Devtraco Plus has carved out a unique niche for exclusive, premium quality housing units in prime areas of Accra, Ghana. The company distinguishes itself through:
- Outstanding customer service as a core differentiator
- Developments exclusively in Accra's highest-demand residential zones
- An investment-first approach that delivers both lifestyle and financial returns
- A track record of successfully completing and delivering premium developments

As of 2025, the company has:
- 5 ongoing/upcoming projects
- 7 completed projects
- Portfolio spanning Cantonments, Airport Residential Area, Labone, Roman Ridge, Dzorwulu, and Tema

BUSINESS AREAS
1. Residential Sales — Luxury apartments and townhouses
2. Hotel Apartment Investments — Hands-off investment model with rental management
3. Rental Properties — Managed rental options for residents
4. Land Services — Assistance for landowners looking to develop
5. Referral Programme — Customer referral incentives
6. Property Management — End-to-end estate management services

LEADERSHIP
- Joseph Aidoo — Real estate mogul leading Devtraco Group, with over 30 years in Ghana's property sector
- Francis Okine Okoh — Chief Executive Officer, Devtraco Plus
- Derek Jason Bossman — Key management figure, business development

AWARDS & RECOGNITION
Devtraco and Devtraco Plus have received multiple industry awards for innovative designs and contributions to addressing Ghana's housing deficit, cementing their status as industry leaders in Ghana's property development sector.
`,
  },

  {
    title: 'Devtraco Plus — Investment & Market Intelligence',
    department: 'finance',
    sensitivity: 'internal',
    content: `
DEVTRACO PLUS — INVESTMENT OVERVIEW & MARKET DATA

GHANA PRIME REAL ESTATE MARKET (ACCRA, 2025)

Rental Yields:
- Prime apartments in Accra (Cantonments, Airport Residential, Labone): 7–10% per annum
- Hotel apartment investments: Variable, managed returns

Capital Appreciation:
- Annual appreciation in prime areas (Cantonments, Airport Residential): 15–20% per annum
- Long-term appreciation driven by constrained land supply in premium zones

Tenant Demand Profile:
- Primary tenant base: Diplomats, international NGOs, multinational executives
- Lease terms: Landlords typically securing 12–24 months rent paid upfront in USD
- Vacancy rates: Stable to declining in Cantonments and Airport Residential Area

STRATEGIC LOCATION RATIONALE
Devtraco Plus intentionally sites all developments within Accra's strongest performing districts, where:
- Rental demand remains resilient regardless of broader economic conditions
- Premium property continues to appreciate steadily
- High-quality infrastructure (roads, utilities, security) is in place
- Proximity to key business, diplomatic, and lifestyle hubs

TARGET DISTRICTS:
- Cantonments: Diplomatic enclave, premium residential, proximity to Kotoka International Airport
- Airport Residential Area: Business hub, excellent connectivity, expatriate demand
- Roman Ridge: Established premium residential zone, close to Cantonments
- Labone: Upscale neighbourhood, growing demand from young professionals
- Dzorwulu: Expanding premium zone, emerging high-value residential market
- Tema: Industrial and residential growth corridor

INVESTMENT MODELS OFFERED

1. OUTRIGHT PURCHASE
- Full ownership of residential unit
- Option for self-occupation or rental through Devtraco Plus management
- Standard conveyancing and title deed transfer

2. HOTEL APARTMENT INVESTMENT (The Pelican model)
- Buy a fully managed hotel apartment
- Professional hospitality management handles all operations
- Hands-off, passive income model
- Returns linked to hotel occupancy performance

3. ARLO CANTONMENTS MODEL
- Flexible furnishing packages or full turnkey rental solutions
- Smart technology: keypad access, mobile app for monitoring rental performance
- Developer manages the rental programme on behalf of investors
- Introductory pricing from GH¢989,000 (approx. $83,000 USD at current rates)

PAYMENT STRUCTURES
- Flexible payment plans available for all developments
- Financial partnerships with leading Ghanaian banks
- USD and GHS pricing options
- Instalment plans available subject to project phase and availability

CURRENCY CONSIDERATIONS
- Properties priced in both USD and GHS
- USD pricing provides inflation and cedi depreciation hedge
- Strong USD income from expatriate tenants provides natural currency protection

COMPETITIVE ADVANTAGE
Devtraco Plus's three-decade track record, strong brand reputation, and completed project portfolio de-risks investment compared to newer developers. All projects are in prime, established locations with proven demand.
`,
  },

  {
    title: 'Arlo Cantonments — Project Details',
    department: 'site-reports',
    sensitivity: 'public',
    content: `
ARLO CANTONMENTS — FULL PROJECT DETAILS

PROJECT NAME: Arlo Cantonments (branded as "ARLO")
DEVELOPER: Devtraco Plus Ghana Limited
STATUS: Pre-construction / Launching 2025
CONSTRUCTION START: 2025 (later in the year)
EXPECTED COMPLETION: Q4 2027
LOCATION: Cantonments, Greater Accra, Ghana

ADDRESS & ACCESSIBILITY
- Address: Giffard Road, Cantonments, Accra
- Near: Oxford Street Mall, Henrietta's Residences, Zollikon Heights
- Proximity to: Kotoka International Airport (short drive), business districts, diplomatic missions
- Easy access to cultural, culinary, and recreational hubs of Accra

PROJECT DESCRIPTION
ARLO is a curated collection of residences ranging from studios to three-bedroom penthouses. The development is designed for the modern investor and luxury lifestyle buyer, rising to 18 floors and set to redefine vertical luxury living in Cantonments.

Design philosophy: Intentional living spaces with balanced form, function, and elevated experience. ARLO blends architectural sophistication with premium lifestyle amenities and exclusive services.

UNIT TYPES
- Studios
- One-bedroom apartments
- Two-bedroom apartments
- Three-bedroom penthouses

PRICING
- Introductory price: Starting from GH¢989,000
- USD equivalent: Starting from approximately $83,000
- Flexible payment plans available

AMENITIES & FACILITIES
- Rooftop infinity pool
- Private padel court
- State-of-the-art gym and spa
- Zen garden
- Amphitheatre
- Dedicated co-working spaces
- Firepit lounges

SMART TECHNOLOGY
- Keypad/smart access system
- Mobile application for remote monitoring of rental performance
- Smart home integration

INVESTMENT OFFERING
- Flexible furnishing packages (part-furnished or fully furnished options)
- Turnkey rental solutions — developer manages rental on owner's behalf
- Passive income model with professional rental management
- Introductory pricing for early buyers

BRAND IDENTITY
The name "ARLO" reflects a modern, lifestyle-led brand positioning. The development is described as "a true investment vehicle and a complete lifestyle destination" — CEO Francis Okine Okoh, Devtraco Plus.

TARGET BUYERS
1. High-net-worth Ghanaian investors
2. Diaspora investors seeking Ghana property exposure
3. International/foreign investors attracted by USD-linked yields
4. Professionals and executives seeking premium Accra residences
5. Hospitality investors seeking serviced apartment returns
`,
  },

  {
    title: 'The Address — Roman Ridge Project Details',
    department: 'site-reports',
    sensitivity: 'public',
    content: `
THE ADDRESS — FULL PROJECT DETAILS

PROJECT NAME: The Address
DEVELOPER: Devtraco Plus Ghana Limited
STATUS: Active development / Available for purchase
LOCATION: Roman Ridge, Greater Accra, Ghana

PROJECT DESCRIPTION
The Address is a landmark development positioned as "the pinnacle of modern living" in Roman Ridge, one of Accra's most prestigious residential areas. The project comprises three towers offering vacation apartments, residential apartments, and hotel apartments, each designed to elevate the standard of luxury living.

The Address sets out to redefine modern living in Accra with an exceptional blend of residential luxury, hospitality services, and premium amenities.

UNIT TYPES
- Studio apartments
- One-bedroom apartments
- Two-bedroom apartments
- Three-bedroom apartments
- Penthouses

PRICING
- Starting from $89,000 USD
- Multiple tiers based on floor level, view, and unit type

AMENITIES & FACILITIES
- Rooftop fitness centres
- Swimming pools
- In-house retail marts
- Kids' play area
- Multipurpose sports complex
- Private cinema
- Concierge service
- 24-hour security

DEVELOPMENT STRUCTURE
Three towers:
1. Vacation Apartments — Short-stay, furnished units for corporate and leisure guests
2. Residential Apartments — Long-term premium residence
3. Hotel Apartments — Managed investment units (hands-off returns)

LOCATION ADVANTAGES
Roman Ridge is an established premium residential neighbourhood of Accra, known for:
- Strong expatriate and diplomat population
- Proximity to Cantonments diplomatic enclave
- Excellent infrastructure and road access
- High-end retail, dining, and leisure options nearby
- Low crime rate and secure environment

INVESTMENT CASE
The Address provides three distinct investment models within one development, allowing buyers to choose between self-occupation, long-term rental, or short-stay hotel apartment returns. The mixed-use structure spreads risk and maximises potential occupancy.
`,
  },

  {
    title: 'The Pelican Hotel Apartments — Project Details',
    department: 'site-reports',
    sensitivity: 'public',
    content: `
THE PELICAN HOTEL APARTMENTS — FULL PROJECT DETAILS

PROJECT NAME: The Pelican Hotel Apartments
DEVELOPER: Devtraco Plus Ghana Limited
STATUS: Available for investment
LOCATION: Cantonments, Greater Accra, Ghana

PROJECT DESCRIPTION
The Pelican is one of Devtraco Plus's iconic hotel apartment projects, located in the prime Cantonments area. It represents a pure hospitality investment model, allowing buyers to own hotel apartments that are professionally managed under a hospitality brand.

INVESTMENT MODEL
The Pelican operates on a fully hands-off investment basis:
- Buyer purchases a hotel apartment unit
- Professional hospitality management team operates the property
- Investor receives returns tied to hotel occupancy performance
- No management involvement required from the owner
- Suitable for local, diaspora, and international investors

PRICING
- Starting from $274,125 USD
- Pricing reflects the larger unit sizes and premium hospitality fittings

CANTONMENTS LOCATION
Cantonments is Accra's most prestigious neighbourhood, hosting:
- Foreign embassies and diplomatic missions
- High-end expatriate housing
- Premium retail and dining (Oxford Street area)
- Excellent road infrastructure
- Close proximity to Kotoka International Airport

TARGET INVESTORS
- Investors seeking truly passive hotel returns
- Diaspora Ghanaians wanting a managed Accra asset
- High-net-worth individuals diversifying into hospitality
- Corporate investors seeking USD-denominated returns
`,
  },

  {
    title: 'Forte Residences — Project Details',
    department: 'site-reports',
    sensitivity: 'public',
    content: `
FORTE RESIDENCES — FULL PROJECT DETAILS

PROJECT NAME: Forte Residences
DEVELOPER: Devtraco Plus Ghana Limited
STATUS: Available
LOCATIONS: Tema Community 20 (off Spintex Road) and Accra

PROJECT DESCRIPTION
Forte Residences is Devtraco Plus's flagship gated community townhouse development, offering luxury living for families seeking space, security, and premium amenities. The development positions itself as "Luxury living in a gated community."

UNIT TYPES
- 2-bedroom townhouses
- 3-bedroom townhouses
- 4-bedroom townhouses
- 4.5-bedroom townhouses
- Semi-detached and fully detached houses (15 units total in Tema community)
- All units include a maid's quarters

PRICING
- Starting from $270,720 USD
- Reflecting larger land area and premium fittings

AMENITIES & FACILITIES
- Swimming pool
- Gym / fitness facility
- Fitted kitchen with premium finishes
- Fitted bathrooms
- 24/7 security personnel
- Estate management services
- Gated community access control

LOCATION — TEMA COMMUNITY 20
- Off Spintex Road, Tema
- Well-established residential area
- Close to industrial and commercial zones
- Good road infrastructure and connectivity to Accra
- Schools, hospitals, and retail nearby

TYPICAL BUYER PROFILE
- Families seeking space and security
- Professionals requiring more bedrooms than a typical apartment
- Long-term residents committed to ownership
- Buyers seeking lower price per square metre compared to Cantonments/Airport Residential
`,
  },

  {
    title: 'NoVA, Niiyo, Henrietta\'s, Acasia & Other Completed Projects',
    department: 'site-reports',
    sensitivity: 'public',
    content: `
DEVTRACO PLUS — COMPLETED & OTHER PROJECTS

NOVA (Roman Ridge)
Type: Mixed-use apartments
Unit types: Studios, 1, 2, and 3-bedroom apartments
Starting price: $141,347 USD
Description: Urban lifestyle development in Roman Ridge. NoVA represents Devtraco Plus's vision for modern urban living — compact, design-forward units in an established neighbourhood popular with young professionals and the expatriate community.

THE NIIYO (Dzorwulu)
Type: Apartments
Location: Dzorwulu, Accra
Starting price: $275,000 USD
Description: A residential oasis in the expanding premium zone of Dzorwulu. Dzorwulu is a rapidly developing neighbourhood increasingly popular with Accra's professional and business community.

HENRIETTA'S RESIDENCES (Cantonments)
Type: Apartments
Location: Cantonments, Accra
Unit types: 1, 2, and 3-bedroom apartments
Starting price: $245,000 USD
Description: A well-established Devtraco Plus project in the heart of Cantonments. Henrietta's Residences appeals to the diplomatic and expatriate community that forms the core of Cantonments' residential base.

ACASIA TOWNHOMES
Type: Luxury townhomes
Starting price: $850,000 USD
Description: Acasia represents the pinnacle of Devtraco Plus's townhome offering — an iconic symbol of luxury, quality and convenience for discerning homeowners in the heart of Accra. These are among the most premium offerings in Devtraco Plus's portfolio.

ACASIA APARTMENTS
Type: Apartments
Starting price: $145,000 USD
Description: The apartment complement to Acasia Townhomes, offering premium apartment living within the same luxury positioning.

THE EDGE
Type: Mixed-use apartments
Starting price: $99,000 USD
Description: A mixed-use development promoting urban living. The Edge provides an accessible entry point into Devtraco Plus premium living.

PALMER'S PLACE
Type: Luxury townhomes
Units: 7 exclusive units
Starting price: $760,000 USD
Description: An exclusive collection of just 7 luxury townhomes, representing ultra-premium family living.

AVANT GARDE
Type: Apartments
Starting price: $170,000 USD
Description: Contemporary styled apartments in Accra's premium residential zones.

COMPLETED PROJECT TRACK RECORD
Devtraco Plus has successfully completed and delivered 7 developments, covering:
- Cantonments
- Airport Residential Area
- Labone
- Roman Ridge
- Dzorwulu
- Tema
All projects delivered to premium specifications with full title deeds transferred to buyers.
`,
  },

  {
    title: 'Devtraco Plus — Services, Process & Customer Journey',
    department: 'general',
    sensitivity: 'public',
    content: `
DEVTRACO PLUS — SERVICES & CUSTOMER JOURNEY

SERVICES OVERVIEW

1. RESIDENTIAL SALES
Process for buying a Devtraco Plus property:
- Step 1: Express interest online or visit the sales office at 8B Sir Arku Korsah Road, Airport Residential Area, Accra
- Step 2: Consultation with a sales executive to understand your needs and budget
- Step 3: Property viewing / virtual tour of selected development
- Step 4: Reservation — payment of a reservation fee to hold the unit
- Step 5: Payment plan selection — outright payment or instalment plan
- Step 6: Sale and Purchase Agreement signing
- Step 7: Construction updates throughout the build period
- Step 8: Snagging inspection before handover
- Step 9: Title deed transfer and key handover

2. RENTAL PROPERTIES
Devtraco Plus manages a portfolio of rental properties for clients who prefer to rent rather than buy. Available units span their completed developments in Cantonments, Airport Residential, Roman Ridge, Labone, and Dzorwulu.

3. HOTEL APARTMENT INVESTMENT SERVICE
For investors in The Pelican and similar hotel apartment projects:
- Acquisition advisory and unit selection
- Legal and conveyancing support
- Furnishing and fit-out management
- Hospitality management by professional hotel operators
- Regular financial reporting to investors
- Transparent rental income distribution

4. LAND SERVICES
For landowners looking to develop or monetise their land:
- Land valuation advisory
- Joint development agreement structuring
- Connection to Devtraco Plus development pipeline
- Legal support for land transactions

5. REFERRAL PROGRAMME
Devtraco Plus operates a referral incentive programme:
- Customers and agents who refer buyers receive commissions
- Commission rates vary by project and unit type
- Contact info@devtracoplus.com for referral partnership enquiries

6. PROPERTY MANAGEMENT
Post-purchase management services:
- Property maintenance coordination
- Tenant management for investors
- Utility management
- Security management
- Rental income collection and disbursement

CONTACT INFORMATION
Head Office: No. 8B, Sir Arku Korsah Road, Airport Residential Area, Accra, Ghana
Phone: +233 (0) 302 798 692
Mobile: +233 (0) 270 000 004
Email: info@devtracoplus.com
Website: www.devtracoplus.com

Social Media:
- Facebook: Devtraco Plus
- LinkedIn: Devtraco Plus
- Twitter: Devtraco Plus
- Instagram: Devtraco Plus

FREQUENTLY ASKED QUESTIONS

Q: Can foreigners buy Devtraco Plus properties?
A: Yes. Devtraco Plus sells to both Ghanaian nationals and international/foreign buyers. Properties are available to diaspora Ghanaians and international investors.

Q: Are title deeds provided?
A: Yes. All completed Devtraco Plus developments come with full title deed transfer to buyers.

Q: What payment plans are available?
A: Payment plans vary by project and phase. Options typically include outright purchase (with potential discount) and instalment plans spread over the construction period. Contact the sales team for current availability.

Q: Can I rent out my purchased unit?
A: Yes. Devtraco Plus offers rental management services, and for hotel apartment projects, a full managed returns programme is available.

Q: What currencies are accepted?
A: Properties are priced in both USD and GHS. Payment arrangements can be discussed with the sales team.

Q: What is the construction timeline for current projects?
A: Arlo Cantonments: Construction starts 2025, completion Q4 2027. Other projects have individual timelines — contact sales for specific details.
`,
  },

  {
    title: 'Ghana Real Estate Market — Context & Intelligence',
    department: 'board-reports',
    sensitivity: 'internal',
    content: `
GHANA REAL ESTATE MARKET — MARKET INTELLIGENCE BRIEFING

MARKET OVERVIEW
Ghana's residential real estate market, particularly in Accra's premium zones, remains one of West Africa's most attractive for investors. The combination of political stability, a growing middle and upper class, strong diaspora investment, and high expatriate demand creates consistent fundamentals for premium residential property.

ACCRA PREMIUM ZONES — KEY STATISTICS (2024/2025)

Rental Yields:
- Cantonments: 8–10% per annum (USD)
- Airport Residential Area: 7–9% per annum (USD)
- Labone: 7–8% per annum (USD)
- Roman Ridge: 7–8% per annum (USD)
- Dzorwulu: 6–8% per annum (USD)

Capital Appreciation:
- Cantonments: 15–20% per annum
- Airport Residential: 15–18% per annum
- Emerging zones (Dzorwulu, Spintex): 10–15% per annum

DEMAND DRIVERS
1. Diplomatic and expatriate demand — Accra hosts a significant number of embassies, UN agencies, international NGOs, and multinational corporations, all generating consistent demand for premium housing
2. Ghana's growing high-net-worth population — Rising business class demanding premium lifestyle options
3. Diaspora investment — Ghanaians in the UK, USA, Canada, and Europe regularly investing in Accra property
4. Limited prime land supply — Scarcity in Cantonments and Airport Residential driving values
5. Dollarisation of premium rents — Most premium leases denominated in USD, protecting investors from cedi depreciation

COMPETITIVE LANDSCAPE
Key competitors in the premium segment:
- Devtraco Courts (Devtraco Limited, Tema focus)
- Trasacco Group (ultra-premium, higher price points)
- Djed Real Estate
- Various boutique developers

Devtraco Plus competitive advantages:
- 30+ year track record
- Established brand trust
- Consistent delivery record (7 completed projects)
- Premium locations in top-tier zones
- Full-service offering (sales, rental management, hospitality)

RISKS & MITIGANTS

Risk: Currency depreciation (GHS/USD)
Mitigant: USD pricing and USD-denominated rental income; inflation-linked appreciation

Risk: Construction delays
Mitigant: Devtraco Plus's track record of delivery; strong contractor relationships

Risk: Oversupply in premium segments
Mitigant: Constrained land in prime zones; continued expatriate demand growth

Risk: Regulatory changes
Mitigant: Ghana has stable property rights framework; Devtraco Plus has strong legal and regulatory relationships

OUTLOOK (2025–2027)
The Ghana premium real estate market is expected to remain strong driven by:
- Continued GDP growth
- Increased foreign investment inflows
- Infrastructure improvements (road upgrades, Kotoka Airport expansion)
- Growing demand from Nigerian high-net-worth buyers for Accra exposure
- Strong pipeline of diplomatic and corporate relocations to Accra
`,
  },

]

// ── Helpers ───────────────────────────────────────────────────
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = []
  let start = 0
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize))
    start += chunkSize - overlap
  }
  return chunks.filter(c => c.trim().length > 60)
}

async function embedText(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  })
  const data = await res.json()
  if (!data.data?.[0]?.embedding) throw new Error('Embedding failed: ' + JSON.stringify(data))
  return data.data[0].embedding
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('🌍  Seeding Devtraco Plus knowledge base...\n')

  // Get tenant
  const { data: tenant } = await supabase
    .from('tenants').select('id').eq('subdomain', 'devtraco').maybeSingle()
  if (!tenant) throw new Error('Devtraco tenant not found. Run seed.mjs first.')
  const tenantId = tenant.id

  // Get admin user
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const admin = users?.find(u => u.email === 'admin@devtraco.com')
  if (!admin) throw new Error('Admin user not found. Run seed.mjs first.')
  const adminId = admin.id

  let totalChunks = 0

  for (const doc of DOCUMENTS) {
    console.log(`📄  Processing: ${doc.title}`)

    // Check if document already exists
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('title', doc.title)
      .maybeSingle()

    if (existing) {
      console.log(`    ↳ Already exists, skipping.\n`)
      continue
    }

    // Insert document record
    const { data: document, error: docErr } = await supabase
      .from('documents')
      .insert({
        tenant_id:   tenantId,
        uploaded_by: adminId,
        title:       doc.title,
        source:      'devtracoplus.com (public knowledge)',
        department:  doc.department,
        sensitivity: doc.sensitivity,
        status:      'processing',
      })
      .select()
      .single()

    if (docErr || !document) {
      console.error(`    ✗ Failed to create document record:`, docErr?.message)
      continue
    }

    // Chunk and embed
    const text   = doc.content.trim()
    const chunks = chunkText(text)
    console.log(`    ↳ ${chunks.length} chunks to embed…`)

    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await embedText(chunks[i])
        await supabase.from('document_chunks').insert({
          document_id: document.id,
          tenant_id:   tenantId,
          chunk_text:  chunks[i],
          chunk_index: i,
          embedding,
          metadata: { source: 'devtracoplus.com', chunk_index: i, total_chunks: chunks.length },
        })
        process.stdout.write('.')
        totalChunks++
      } catch (e) {
        console.error(`\n    ✗ Chunk ${i} failed:`, e.message)
      }
    }

    // Mark ready
    await supabase.from('documents').update({ status: 'ready' }).eq('id', document.id)
    console.log(`\n    ✓ Done — ${chunks.length} chunks stored.\n`)
  }

  console.log(`\n✅  Knowledge base seeded successfully!`)
  console.log(`   ${DOCUMENTS.length} documents · ${totalChunks} chunks total`)
  console.log(`\n   The AI can now answer questions about:`)
  console.log(`   • Devtraco Plus company history, mission, and leadership`)
  console.log(`   • All current and completed projects (Arlo, The Address, Pelican, Forte, etc.)`)
  console.log(`   • Investment models, rental yields, and market intelligence`)
  console.log(`   • Ghana premium real estate market overview`)
  console.log(`   • Services, processes, and contact information`)
  console.log(`\n   Login at http://localhost:3000/auth/login and start asking!\n`)
}

main().catch(err => {
  console.error('\n✗ Error:', err.message)
  process.exit(1)
})
