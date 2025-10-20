import { Event } from '../types/event';

export const sampleEvents: Event[] = [
  {
    id: 'engagement-2025',
    title: 'Engagement Ceremony',
    description: 'A warm and intimate gathering of close family and loved ones. This occasion gives both families a chance to come together, share joyful moments, and grow closer in celebration.',
    startDateTime: new Date('2025-10-19T10:00:00'),
    endDateTime: new Date('2025-10-19T14:00:00'),
    timezone: 'Asia/Kolkata',
    venue: 'Thayankavu Bhagavathy Temple',
    locationUrl: 'https://maps.app.goo.gl/vKkmhnzw3V1T9eu48',
    mapLink: 'https://maps.app.goo.gl/vKkmhnzw3V1T9eu48',
    dresscode: 'Traditional',
    image: '/engagement-background.jpg',
    category: 'ceremony',
    status: 'upcoming', // Will be automatically updated by EventService
    isRecurring: false,
    lastModified: new Date(),
    created: new Date()
  },
  {
    id: 'ganapathy-2026',
    title: 'Ganapathykidal',
    description: 'A traditional ritual dedicated to Lord Ganesha, performed to invoke His blessings before the wedding.',
    startDateTime: new Date('2026-01-03T08:00:00'),
    endDateTime: new Date('2026-01-03T12:00:00'),
    timezone: 'Asia/Kolkata',
    venue: 'At Home',
    locationUrl: 'https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA',
    mapLink: 'https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA',
    dresscode: 'Ladies: Set Mundu',
    image: '/ganapathy.jpg',
    category: 'ritual',
    status: 'upcoming',
    isRecurring: false,
    lastModified: new Date(),
    created: new Date()
  },
  {
    id: 'sangeet-2026',
    title: 'Sangeet Night',
    description: 'An Evening of Music and Celebration. A joyful evening filled with music, dance, and togetherness.',
    startDateTime: new Date('2026-01-03T18:00:00'),
    endDateTime: new Date('2026-01-03T22:00:00'),
    timezone: 'Asia/Kolkata',
    venue: 'At Home',
    locationUrl: 'https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA',
    mapLink: 'https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA',
    dresscode: 'Colourful Celebratory',
    image: '/sangeeth-background.jpg',
    category: 'celebration',
    status: 'upcoming',
    isRecurring: false,
    lastModified: new Date(),
    created: new Date()
  },
  {
    id: 'wedding-2026',
    title: 'Wedding Ceremony',
    description: 'The groom is welcomed to the venue by the bride\'s family. Traditional wedding rituals including Thalikettu, Kanyadaanam, and Circumambulation.',
    startDateTime: new Date('2026-01-04T09:00:00'),
    endDateTime: new Date('2026-01-04T10:00:00'),
    timezone: 'Asia/Kolkata',
    venue: 'Thiruvanchikuzhi Mahadeva Kshetram',
    locationUrl: 'https://maps.app.goo.gl/ZPL5QhMWg58t33h2A',
    mapLink: 'https://maps.app.goo.gl/ZPL5QhMWg58t33h2A',
    dresscode: 'Elegant Festive',
    image: '/wedding.jpg',
    category: 'ceremony',
    status: 'upcoming',
    isRecurring: false,
    lastModified: new Date(),
    created: new Date()
  },
  {
    id: 'reception-2026',
    title: 'Reception',
    description: 'The couple\'s first celebration together with the groom\'s family and loved ones. Includes cake-cutting ceremony and dinner.',
    startDateTime: new Date('2026-01-04T17:00:00'),
    endDateTime: new Date('2026-01-04T20:00:00'),
    timezone: 'Asia/Kolkata',
    venue: 'Bhagavathy auditorium',
    locationUrl: 'https://maps.app.goo.gl/FsGRCevEVZYPCuFk6',
    mapLink: 'https://maps.app.goo.gl/FsGRCevEVZYPCuFk6',
    dresscode: 'Cocktail',
    image: '/reception-background.jpg',
    category: 'reception',
    status: 'upcoming',
    isRecurring: false,
    lastModified: new Date(),
    created: new Date()
  },
  // Past events for testing (using recent dates so they appear as past)
  {
    id: 'past-event-1',
    title: 'Pre-Wedding Meeting',
    description: 'Initial family meeting to discuss wedding arrangements.',
    startDateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 7 days ago + 2 hours
    timezone: 'Asia/Kolkata',
    venue: 'Family Home',
    locationUrl: '',
    mapLink: '',
    dresscode: 'Casual',
    image: '/wedding.jpg',
    category: 'other',
    status: 'past', // Will be automatically updated by EventService
    isRecurring: false,
    lastModified: new Date(),
    created: new Date()
  },
  {
    id: 'past-event-2',
    title: 'Venue Booking',
    description: 'Finalizing venue bookings for all ceremonies.',
    startDateTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    endDateTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 14 days ago + 2 hours
    timezone: 'Asia/Kolkata',
    venue: 'Various Locations',
    locationUrl: '',
    mapLink: '',
    dresscode: 'Formal',
    image: '/wedding.jpg',
    category: 'other',
    status: 'past', // Will be automatically updated by EventService
    isRecurring: false,
    lastModified: new Date(),
    created: new Date()
  },
  {
    id: 'past-event-3',
    title: 'Invitation Design Meeting',
    description: 'Meeting with designers to finalize wedding invitation design.',
    startDateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000), // 30 days ago + 1.5 hours
    timezone: 'Asia/Kolkata',
    venue: 'Design Studio',
    locationUrl: '',
    mapLink: '',
    dresscode: 'Business Casual',
    image: '/wedding.jpg',
    category: 'other',
    status: 'past', // Will be automatically updated by EventService
    isRecurring: false,
    lastModified: new Date(),
    created: new Date()
  },
  {
    id: 'past-event-4',
    title: 'Catering Tasting',
    description: 'Tasting session to select menu for wedding reception.',
    startDateTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    endDateTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 21 days ago + 3 hours
    timezone: 'Asia/Kolkata',
    venue: 'Catering Hall',
    locationUrl: '',
    mapLink: '',
    dresscode: 'Smart Casual',
    image: '/wedding.jpg',
    category: 'other',
    status: 'past', // Will be automatically updated by EventService
    isRecurring: false,
    lastModified: new Date(),
    created: new Date()
  },
  // Recurring event example
  {
    id: 'weekly-meeting',
    title: 'Weekly Family Meeting',
    description: 'Weekly family meeting to discuss wedding preparations.',
    startDateTime: new Date('2025-01-01T19:00:00'),
    endDateTime: new Date('2025-01-01T20:00:00'),
    timezone: 'Asia/Kolkata',
    venue: 'Family Home',
    locationUrl: '',
    mapLink: '',
    dresscode: 'Casual',
    image: '/wedding.jpg',
    category: 'other',
    status: 'upcoming',
    isRecurring: true,
    recurringPattern: {
      type: 'weekly',
      interval: 1,
      endDate: new Date('2026-01-31T20:00:00'),
      occurrences: 52
    },
    lastModified: new Date(),
    created: new Date()
  }
];
