import { RoomType, Deal } from '@/types';

// Map Google product categories to rooms
const categoryPatterns: Array<{ pattern: RegExp; room: RoomType }> = [
  // Woonkamer (Living Room)
  { pattern: /televisies|tv|television/i, room: 'woonkamer' },
  { pattern: /audio|speaker|koptelefoon|headphone|soundbar/i, room: 'woonkamer' },
  { pattern: /meubels|furniture|bank|sofa|stoel/i, room: 'woonkamer' },
  { pattern: /gaming|console|playstation|xbox/i, room: 'woonkamer' },

  // Keuken (Kitchen)
  { pattern: /keuken|kitchen|koken|cooking/i, room: 'keuken' },
  { pattern: /oven|magnetron|microwave|blender|mixer/i, room: 'keuken' },
  { pattern: /koffie|coffee|espresso/i, room: 'keuken' },
  { pattern: /koelkast|refrigerator|vriezer|freezer/i, room: 'keuken' },
  { pattern: /pannen|pots|cookware/i, room: 'keuken' },
  { pattern: /pizza/i, room: 'keuken' },

  // Slaapkamer (Bedroom)
  { pattern: /kleding|clothing|fashion|mode/i, room: 'slaapkamer' },
  { pattern: /bed|matras|mattress|bedding|dekbed/i, room: 'slaapkamer' },
  { pattern: /ondergoed|underwear|lingerie/i, room: 'slaapkamer' },
  { pattern: /badjas|robe|pyjama/i, room: 'slaapkamer' },
  { pattern: /horloge|watch|sieraden|jewelry/i, room: 'slaapkamer' },

  // Badkamer (Bathroom)
  { pattern: /badkamer|bathroom/i, room: 'badkamer' },
  { pattern: /wellness|spa|massage/i, room: 'badkamer' },
  { pattern: /personal care|verzorging|beauty/i, room: 'badkamer' },
  { pattern: /scheerapparaat|shaver|razor/i, room: 'badkamer' },
  { pattern: /tandenborstel|toothbrush/i, room: 'badkamer' },
  { pattern: /haardroger|hairdryer|föhn/i, room: 'badkamer' },

  // Home Office
  { pattern: /computer|laptop|pc|monitor/i, room: 'home_office' },
  { pattern: /printer|scanner/i, room: 'home_office' },
  { pattern: /tablet|ipad/i, room: 'home_office' },
  { pattern: /telefoon|phone|smartphone/i, room: 'home_office' },
  { pattern: /bureau|desk|office/i, room: 'home_office' },
  { pattern: /keyboard|toetsenbord|muis|mouse/i, room: 'home_office' },

  // Garage
  { pattern: /gereedschap|tools/i, room: 'garage' },
  { pattern: /auto|car|automotive/i, room: 'garage' },
  { pattern: /fiets|bike|bicycle/i, room: 'garage' },
  { pattern: /boor|drill|zaag|saw/i, room: 'garage' },
  { pattern: /compressor|werkbank/i, room: 'garage' },

  // Tuin (Garden)
  { pattern: /tuin|garden/i, room: 'tuin' },
  { pattern: /bbq|barbecue|grill/i, room: 'tuin' },
  { pattern: /outdoor|buiten/i, room: 'tuin' },
  { pattern: /grasmaaier|lawn/i, room: 'tuin' },
  { pattern: /tuinmeubel|patio/i, room: 'tuin' },
  { pattern: /zwembad|pool/i, room: 'tuin' },
];

export function mapDealToRoom(deal: Deal): RoomType {
  const textToSearch = `${deal.google_product_category} ${deal.title} ${deal.description}`.toLowerCase();

  for (const { pattern, room } of categoryPatterns) {
    if (pattern.test(textToSearch)) {
      return room;
    }
  }

  // Default room based on random distribution to fill all rooms
  const rooms: RoomType[] = ['woonkamer', 'keuken', 'slaapkamer', 'home_office'];
  const hash = deal.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return rooms[hash % rooms.length];
}

export function groupDealsByRoom(deals: Deal[]): Record<RoomType, Deal[]> {
  const grouped: Record<RoomType, Deal[]> = {
    entree: [],
    woonkamer: [],
    keuken: [],
    slaapkamer: [],
    badkamer: [],
    home_office: [],
    garage: [],
    tuin: [],
  };

  for (const deal of deals) {
    const room = mapDealToRoom(deal);
    grouped[room].push(deal);
  }

  return grouped;
}

// Get room display name
export function getRoomDisplayName(room: RoomType): string {
  const names: Record<RoomType, string> = {
    entree: 'Entree',
    woonkamer: 'Woonkamer',
    keuken: 'Keuken',
    slaapkamer: 'Slaapkamer',
    badkamer: 'Badkamer',
    home_office: 'Home Office',
    garage: 'Garage',
    tuin: 'Tuin',
  };
  return names[room];
}

// Get room emoji
export function getRoomEmoji(room: RoomType): string {
  const emojis: Record<RoomType, string> = {
    entree: '🚪',
    woonkamer: '🛋️',
    keuken: '🍳',
    slaapkamer: '🛏️',
    badkamer: '🛁',
    home_office: '💻',
    garage: '🔧',
    tuin: '🌿',
  };
  return emojis[room];
}
