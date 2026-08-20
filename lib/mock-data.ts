// Knowledge Base Articles
export interface Article {
  id: string
  title: string
  content: string
  category: string
  author: string
  createdAt: Date
  updatedAt: Date
  status: 'published' | 'draft'
}

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Benefits of Breastfeeding for Infants',
    content: 'Breastfeeding provides essential nutrients and antibodies for infant development...',
    category: 'Newborn Health',
    author: 'Dr. Maria Santos',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    status: 'published',
  },
  {
    id: '2',
    title: 'Proper Latch Techniques',
    content: 'A proper latch is crucial for successful breastfeeding and infant comfort...',
    category: 'Latching Techniques',
    author: 'Dr. Maria Santos',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    status: 'published',
  },
  {
    id: '3',
    title: 'Managing Breast Engorgement',
    content: 'Breast engorgement can be uncomfortable but there are several remedies available...',
    category: 'Milk Storage & Safety',
    author: 'Nurse Patricia',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-19'),
    status: 'published',
  },
]

// Comments for Moderation
export interface Comment {
  id: string
  articleId: string
  author: string
  content: string
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
}

export const mockComments: Comment[] = [
  {
    id: '1',
    articleId: '1',
    author: 'User_123',
    content: 'This was very helpful! I learned a lot about infant nutrition.',
    createdAt: new Date('2024-01-20'),
    status: 'pending',
  },
  {
    id: '2',
    articleId: '2',
    author: 'MomBlog',
    content: 'Great tips! These techniques really helped me.',
    createdAt: new Date('2024-01-19'),
    status: 'approved',
  },
  {
    id: '3',
    articleId: '1',
    author: 'Spammer_Bot',
    content: 'Buy cheap products at www.spam.com NOW!!!',
    createdAt: new Date('2024-01-21'),
    status: 'pending',
    reason: 'Spam/Commercial content',
  },
]

// Facility Profiles
export type SupplyLevel = 'low' | 'adequate' | 'high'

export interface Facility {
  id: string
  name: string
  location: string
  phone: string
  email: string
  services: string[]
  supplyLevel: SupplyLevel
  operatingHours: string
  accreditation: string
  createdAt: Date
  updatedAt: Date
}

export const mockFacilities: Facility[] = [
  {
    id: '1',
    name: 'Dr. Jose Fabella Memorial Hospital',
    location: 'Lope de Vega St., Sta. Cruz, Manila, Philippines',
    phone: '+63-2-8734-1857',
    email: 'fabella.milkbank@doh.gov.ph',
    services: ['Milk Collection', 'Donor Screening', 'Milk Processing', 'Distribution', 'Storage', 'Testing'],
    supplyLevel: 'adequate',
    operatingHours: 'Mon-Sun: 24 Hours (Human Milk Bank)',
    accreditation: 'DOH Licensed, WHO/UNICEF Baby-Friendly Hospital',
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Quezon City General Hospital',
    location: 'Seminary Rd., EDSA, Quezon City, Philippines',
    phone: '+63-2-8426-1314',
    email: 'qcgh.milkbank@quezoncity.gov.ph',
    services: ['Milk Collection', 'Donor Screening', 'Testing', 'Storage', 'Distribution', 'Education'],
    supplyLevel: 'high',
    operatingHours: 'Mon-Fri: 7AM-5PM, Sat: 8AM-12PM',
    accreditation: 'DOH Licensed, PhilHealth Accredited',
    createdAt: new Date('2023-08-20'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    // TODO: Verify contact details with PCMC public affairs before production deployment.
    // Phone, email, hours sourced from pcmc.gov.ph — confirm they are current.
    id: '3',
    name: 'Philippine Children\'s Medical Center (PCMC) – Human Milk Bank',
    location: 'Quezon Avenue cor. Agham Road, Diliman, Quezon City, Metro Manila, Philippines',
    phone: '(+632) 8588-9900 / (+632) 8924-6001 to 25',
    email: 'hiss@pcmc.gov.ph',
    services: ['Evaluation', 'Milk Collection', 'Processing & Pasteurization', 'Microbiological Quality Control Testing', 'Safe Storage & Distribution'],
    supplyLevel: 'low',
    operatingHours: 'Mon-Fri: 8:00 AM – 5:00 PM',
    accreditation: 'DOH Accredited Pioneer Human Milk Bank',
    createdAt: new Date('2023-10-10'),
    updatedAt: new Date('2024-01-19'),
  },
]

// System Statistics
export interface Statistics {
  totalBookings: number
  totalDonors: number
  totalRecipients: number
  activeArticles: number
  pendingComments: number
  activeFacilities: number
  bookingTrend: { month: string; count: number }[]
  engagementData: { category: string; count: number }[]
  donorSummary: { status: string; count: number }[]
  recipientSummary: { status: string; count: number }[]
}

export const mockStatistics: Statistics = {
  totalBookings: 187,
  totalDonors: 64,
  totalRecipients: 143,
  activeArticles: 3,
  pendingComments: 2,
  activeFacilities: mockFacilities.length,
  bookingTrend: [
    { month: 'Jan', count: 18 },
    { month: 'Feb', count: 24 },
    { month: 'Mar', count: 21 },
    { month: 'Apr', count: 29 },
    { month: 'May', count: 35 },
    { month: 'Jun', count: 38 },
    { month: 'Jul', count: 22 },
  ],
  engagementData: [
    { category: 'Breastfeeding Tips', count: 86 },
    { category: 'Milk Banking', count: 63 },
    { category: 'Nutrition', count: 47 },
    { category: 'Health Benefits', count: 39 },
    { category: 'Support Groups', count: 28 },
  ],
  donorSummary: [
    { status: 'Active', count: 41 },
    { status: 'Inactive', count: 15 },
    { status: 'Pending Verification', count: 8 },
  ],
  recipientSummary: [
    { status: 'Active', count: 98 },
    { status: 'Inactive', count: 27 },
    { status: 'Completed', count: 18 },
  ],
}
