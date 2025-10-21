interface Event {
  id: string;
  title: string;
  date?: string;
  time: string;
  dresscode?: string;
  venue: string;
  locationUrl: string;
  image: string;
  description: string;
  mapLink: string;
}

interface Schedule {
  date: string;
  events: Event[];
}

export const parvathySchedule: Schedule[] = [
  {
    date: "October 19, 2025",
    events: [
      {
        id: "engagement-a",
        title: "Engagement",
        date: "October 19, 2025",
        time: "10:00 AM",
        dresscode: "Traditional",
        venue: "Thayankavu Bhagavathy Temple",
        locationUrl: "https://maps.app.goo.gl/vKkmhnzw3V1T9eu48",
        image: "/engagement-background.jpg",
        description: "A warm and intimate gathering of close family and loved ones. This occasion gives both families a chance to come together, share joyful moments, and grow closer in celebration.The highlight of the evening is the exchange of rings, where the couple makes a heartfelt promise of love and commitment to one another. With blessings, laughter, and togetherness, this marks the beginning of a lifetime of cherished memories.",
        mapLink: "https://maps.app.goo.gl/vKkmhnzw3V1T9eu48"
      },
    ],
  },
  {
    date: "January 3, 2026",
    events: [
      {
        id: "ganapathykidal-a",
        title: "Ganapathykidal",
        date: "Saturday, January 3, 2026",
        time: "8:00 am to 12:00 pm",
        dresscode: "Ladies: Set Mundu",
        venue: "At Home",
        locationUrl: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA",
        image: "/ganapathy.jpg",
        description: "A traditional ritual dedicated to Lord Ganesha, performed to invoke His blessings before the wedding. This ceremony marks an auspicious beginning, seeking the removal of all obstacles and the smooth conduct of the marriage celebrations. With offerings of flowers, coconuts, and sweets, the families come together in prayer for prosperity, harmony, and a blessed union.",
        mapLink: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA"
      },
      {
        id: "kaikottikali-a",
        title: "Kaikottikali",
        date: "Saturday, January 3, 2026",
        time: "12:00 pm",
        dresscode: "Ladies: Set Mundu",
        venue: "At Home",
        locationUrl: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA",
        image: "/thiruvathirakali-background.jpg",
        description: "Staged by the bride’s female relatives and friends as a way of celebrating the occasion with joy and grace. Women, form a circle around a lit lamp and dance in rhythmic steps, clapping hands in unison to the tune of melodious folk songs. The songs usually narrate themes of devotion, love and marriage.",
        mapLink: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA"
      },
      {
        id: "sangeet-a",
        title: "Sangeet",
        time: "6 to 10pm",
        dresscode: "Colourful Celebratory",
        venue: "At Home",
        locationUrl: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA",
        image: "/sangeeth-background.jpg",
        description: "An Evening of Music and Celebration 🎶✨A joyful evening filled with music, dance, and togetherness. This is the time for families to come together, share performances, sing, and dance in celebration of love and new beginnings.It’s a night of laughter, melodies, and cherished memories, where everyone—family and friends alike—joins in the fun.💃🕺🌸",
        mapLink: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA"
      },
    ],
  },
  {
    date: "January 4, 2026",
    events: [
      {
        id: "wedding-a",
        time: "9 to 10 Am",
        title: "Wedding",
        dresscode: "Elegant Festive",
        venue: "Thiruvanchikuzhi Mahadeva Kshetram",
        locationUrl: "https://maps.app.goo.gl/ZPL5QhMWg58t33h2A",
        image: "/wedding.jpg",
        description: `The groom is welcomed to the venue by the bride's family, the bride's brother wash the groom's feet. 
<strong>Thalikettu</strong>: The groom ties the thaali around the bride's neck. The couple exchanges flower garlands after the Thalikettu, symbolizing their mutual acceptance and respect.
<strong>Kanyadaanam</strong>: The bride's Parents place her right hand into the groom's right hand, formally giving her away to him. 
<strong>Enappudava</strong>: The groom gives the bride a new saree called an Enappudava. By accepting the saree, the bride agrees to be his wife. 
<strong>Circumambulation</strong>: The couple walks around a sacred lamp (Vilakku) three times to formalize their vows.
<strong>Blessings and feasting</strong>: After the main rituals, the couple takes photos with family members, followed by a vegetarian feast (sadhya) for all guests.`,
        mapLink: "https://maps.app.goo.gl/ZPL5QhMWg58t33h2A"
      },
      {
        id: "reception-a",
        title: "Reception",
        time: "5 to 8pm",
        dresscode: "Cocktail",
        venue: "Bhagavathy auditorium",
        locationUrl: "https://maps.app.goo.gl/FsGRCevEVZYPCuFk6",
        image: "/reception-background.jpg",
        description: "The couple’s first celebration together with the groom’s family and loved ones. This special gathering is a time for family and friends to come together, to bless the newlyweds, share in their happiness. This tradition symbolizes the bride’s grand welcome into her new family and home, while also giving everyone an opportunity to come together in love, laughter, and celebration. The evening will include a delightful cake-cutting ceremony, followed by a splendid dinner prepared with love to celebrate the occasion in true festive spirit. 💕🍰🍽️",
        mapLink: "https://maps.app.goo.gl/FsGRCevEVZYPCuFk6"
      },
    ],
  },
];

export const sreedeviSchedule = [
  {
    date: "January 10, 2026",
    events: [
      {
        id: "ayaniyoonu-b",
        title: "Ayaniyoonu",
        time: "8:00 am to 12:00 pm",
        dresscode: "Ladies Set Mundu",
        venue: "At Home",
        locationUrl: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA",
        image: "/ayinoon-background.jpg",
        description: "The formal beginning of the wedding celebrations. It is a joyous and festive event that reinforces the bonds of family and community as they prepare for the wedding. Ayaniyoonu is a process of having traditional bathing and lunch, at an auspicious time.",
        mapLink: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA"
      },
      {
        id: "kaikottikali-b",
        title: "Kaikottikali",
        date: "Saturday, January 10, 2026",
        time: "12:00 pm",
        dresscode: "Ladies Set Mundu",
        venue: "At Home",
        locationUrl: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA",
        image: "/thiruvathirakali-background.jpg",
        description: "Staged by the bride’s female relatives and friends as a way of celebrating the occasion with joy and grace. Women, form a circle around a lit lamp and dance in rhythmic steps, clapping hands in unison to the tune of melodious folk songs. The songs usually narrate themes of devotion, love and marriage.",
        mapLink: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA"
      },
      {
        id: "1000 thiritirikkal-b",
        title: "1000 Thirittirikkal",
        time: "2 pm",
        dresscode: "Ladies Set Mundu",
        venue: "At Home",
        locationUrl: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA",
        image: "/1000-thirikkal.jpg",
        description: "1000 thiri theliyikkal (or Ayirathiri Uzhiyal) is a traditional ceremony where 1,000 lit wicks are waved before the bride. The wicks are usually prepared by her young female relatives, and other married women. The ritual: As the bride is about to arrive at the wedding venue, a lady of the family (often a married elder) waves a plate containing the 1,000 lit wicks in front of her. This is a symbolic send-off to Vishavasu, a celestial being (Gandharva) who is believed to have protected the girl up until her marriage. The waving of the wicks is a gesture of gratitude and marks the conclusion of Vishavasu's role as her guardian. The ceremony represents the shift of the bride's protection from the celestial guardian to her new husband and family. It emphasizes familial bonds and community support for the newlywed couple.",
        mapLink: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA"
      },
      {
        id: "sangeet-b",
        title: "Sangeet",
        time: "6 to 10 pm",
        dresscode: "Colourful Celebratory",
        venue: "At Home",
        locationUrl: "https://maps.app.goo.gl/eHCvqFew9ZZBjwFTA",
        image: "/sangeeth-background.jpg",
        description: "An Evening of Music and Celebration 🎶✨A joyful evening filled with music, dance, and togetherness. This is the time for families to come together, share performances, sing, and dance in celebration of love and new beginnings. It’s a night of laughter, melodies, and cherished memories, where everyone—family and friends alike—joins in the fun.💃🕺🌸",
      },
    ],
  },
  {
    date: "January 11, 2026",
    events: [
      {
        id: "wedding-b",
        time: "11:00 to 11:30 am",
        title: "Wedding",
        dresscode: "Elegant Festive",
        venue: "The Gazebo Heritage",
        locationUrl: "https://maps.app.goo.gl/tAf9PTfD3WhUrRgNA",
        image: "/wedding.jpg",
        description: `The groom is welcomed to the venue by the bride's family, the bride's brother wash the groom's feet. 
<strong>Thalikettu</strong>: The groom ties the thaali around the bride's neck. The couple exchanges flower garlands after the Thalikettu, symbolizing their mutual acceptance and respect.
<strong>Kanyadaanam</strong>: The bride's Parents place her right hand into the groom's right hand, formally giving her away to him. 
<strong>Enappudava</strong>: The groom gives the bride a new saree called an Enappudava. By accepting the saree, the bride agrees to be his wife. 
<strong>Circumambulation</strong>: The couple walks around a sacred lamp (Vilakku) three times to formalize their vows.
<strong>Blessings and feasting</strong>: After the main rituals, the couple takes photos with family members, followed by a vegetarian feast (sadhya) for all guests.`,
        mapLink: "https://maps.app.goo.gl/tAf9PTfD3WhUrRgNA"
      },
    ],
  },
  {
    date: "January 12, 2026",
    events: [
      {
        id: "reception-b",
        title: "Reception",
        time: "5 to 8 pm",
        dresscode: "Cocktail",
        venue: "Ammu Auditorium",
        locationUrl: "https://maps.app.goo.gl/vMVeHnpiqfVTnUpL6",
        image: "/reception-background.jpg",
        description: "The couple’s first celebration together with the groom’s family and loved ones. This special gathering is a time for family and friends to come together, to bless the newlyweds, share in their happiness. This tradition symbolizes the bride’s grand welcome into her new family and home, while also giving everyone an opportunity to come together in love, laughter, and celebration. The evening will include a delightful cake-cutting ceremony, followed by a splendid dinner prepared with love to celebrate the occasion in true festive spirit. 💕🍰🍽️",
        mapLink: "https://maps.app.goo.gl/vMVeHnpiqfVTnUpL6"
      },
    ],
  },
];
