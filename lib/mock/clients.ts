import type { Client, Project } from './types'
import { ORG_ID } from './user'

// Client IDs — gebruikt in andere mock bestanden
export const CLIENT_ACME_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012'
export const CLIENT_TECHSTART_ID = 'c4d5e6f7-b8c9-0123-defa-234567890123'
export const CLIENT_GEMEENTE_ID = 'c5e6f7a8-c9d0-1234-efab-345678901234'

// Project IDs — gebruikt in andere mock bestanden
export const PROJECT_WEBSITE_ID = 'p1a2b3c4-d5e6-7890-abcd-ef1234567890'
export const PROJECT_SEO_ID = 'p2b3c4d5-e6f7-8901-bcde-f12345678901'
export const PROJECT_ONDERHOUD_ID = 'p3c4d5e6-f7a8-9012-cdef-123456789012'
export const PROJECT_MOBILE_ID = 'p4d5e6f7-a8b9-0123-defa-234567890123'
export const PROJECT_API_ID = 'p5e6f7a8-b9c0-1234-efab-345678901234'
export const PROJECT_LOKET_ID = 'p6f7a8b9-c0d1-2345-fabc-456789012345'
export const PROJECT_AUDIT_ID = 'p7a8b9c0-d1e2-3456-abcd-567890123456'

export const mockClients: Client[] = [
  {
    id: CLIENT_ACME_ID,
    organizationId: ORG_ID,
    name: 'Acme BV',
    email: 'contact@acme.nl',
    color: '#3D52D5',
    hourlyRate: 95,
    kmRate: 0.23,
    minimumMinutes: 15,
    isActive: true,
    isFavorite: true,
    jorttId: 'jortt_acme_001',
    moneybirdId: null,
    createdAt: '2025-07-01T09:00:00Z',
    updatedAt: '2026-02-15T14:00:00Z',
  },
  {
    id: CLIENT_TECHSTART_ID,
    organizationId: ORG_ID,
    name: 'TechStart B.V.',
    email: 'info@techstart.nl',
    color: '#22C55E',
    hourlyRate: 110,
    kmRate: 0.23,
    minimumMinutes: null,
    isActive: true,
    isFavorite: true,
    jorttId: null,
    moneybirdId: null,
    createdAt: '2025-09-10T11:00:00Z',
    updatedAt: '2026-01-20T16:30:00Z',
  },
  {
    id: CLIENT_GEMEENTE_ID,
    organizationId: ORG_ID,
    name: 'Gemeente Amsterdam',
    email: 'inkoop@amsterdam.nl',
    color: '#F59E0B',
    hourlyRate: 85,
    kmRate: 0.23,
    minimumMinutes: 30,
    isActive: true,
    isFavorite: false,
    jorttId: null,
    moneybirdId: null,
    createdAt: '2025-11-05T13:00:00Z',
    updatedAt: '2026-02-28T10:00:00Z',
  },
]

export const mockProjects: Project[] = [
  // Acme BV projecten
  {
    id: PROJECT_WEBSITE_ID,
    organizationId: ORG_ID,
    clientId: CLIENT_ACME_ID,
    name: 'Website redesign',
    description: 'Volledig herontwerp van de bedrijfswebsite inclusief CMS',
    budgetHours: 200,
    hourlyRate: null, // gebruikt klant-tarief
    color: null,
    isActive: true,
    jorttProjectId: 'jortt_proj_001',
    createdAt: '2025-07-15T09:00:00Z',
    updatedAt: '2026-03-01T08:00:00Z',
  },
  {
    id: PROJECT_SEO_ID,
    organizationId: ORG_ID,
    clientId: CLIENT_ACME_ID,
    name: 'SEO optimalisatie',
    description: 'Technische SEO-audit en implementatie van verbeteringen',
    budgetHours: 40,
    hourlyRate: null,
    color: null,
    isActive: true,
    jorttProjectId: null,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-20T15:00:00Z',
  },
  {
    id: PROJECT_ONDERHOUD_ID,
    organizationId: ORG_ID,
    clientId: CLIENT_ACME_ID,
    name: 'Maandelijks onderhoud',
    description: 'Doorlopend onderhoud, updates en kleine aanpassingen',
    budgetHours: null,
    hourlyRate: null,
    color: null,
    isActive: true,
    jorttProjectId: null,
    createdAt: '2025-08-01T09:00:00Z',
    updatedAt: '2026-03-05T11:00:00Z',
  },
  // TechStart B.V. projecten
  {
    id: PROJECT_MOBILE_ID,
    organizationId: ORG_ID,
    clientId: CLIENT_TECHSTART_ID,
    name: 'Mobile app',
    description: 'React Native app voor iOS en Android',
    budgetHours: 300,
    hourlyRate: null,
    color: null,
    isActive: true,
    jorttProjectId: null,
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2026-02-28T16:00:00Z',
  },
  {
    id: PROJECT_API_ID,
    organizationId: ORG_ID,
    clientId: CLIENT_TECHSTART_ID,
    name: 'API development',
    description: 'REST API voor de mobile app en webapplicatie',
    budgetHours: 120,
    hourlyRate: null,
    color: null,
    isActive: true,
    jorttProjectId: null,
    createdAt: '2025-10-15T10:00:00Z',
    updatedAt: '2026-03-02T14:00:00Z',
  },
  // Gemeente Amsterdam projecten
  {
    id: PROJECT_LOKET_ID,
    organizationId: ORG_ID,
    clientId: CLIENT_GEMEENTE_ID,
    name: 'Digitaal loket',
    description: 'Online portaal voor burgeraanvragen en vergunningen',
    budgetHours: 500,
    hourlyRate: null,
    color: null,
    isActive: true,
    jorttProjectId: null,
    createdAt: '2025-11-15T09:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z',
  },
  {
    id: PROJECT_AUDIT_ID,
    organizationId: ORG_ID,
    clientId: CLIENT_GEMEENTE_ID,
    name: 'Toegankelijkheidsaudit',
    description: 'WCAG 2.1 AA audit en rapportage',
    budgetHours: 60,
    hourlyRate: null,
    color: null,
    isActive: true,
    jorttProjectId: null,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-03-04T10:00:00Z',
  },
]
