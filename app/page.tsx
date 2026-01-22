import { parseCSV } from '@/lib/csvParser';
import GameWrapper from '@/components/game/GameWrapper';

const CSV_URL =
  process.env.NEXT_PUBLIC_DEALS_CSV_URL ||
  'https://files.channable.com/nTIZdHViSnzQAI5crs9heg==.csv';

async function getDeals() {
  try {
    // Try to fetch from the actual CSV URL
    const res = await fetch(CSV_URL, {
      next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch deals: ${res.status}`);
    }

    const csvText = await res.text();
    const deals = parseCSV(csvText);
    return deals;
  } catch (error) {
    console.error('Error fetching deals, using fallback:', error);

    // Fallback mock data for demo
    return [
      {
        id: '1',
        title: 'Sony WH-1000XM5 Wireless Noise Cancelling Koptelefoon',
        short_title: 'Sony WH-1000XM5',
        description: 'Premium wireless koptelefoon met industrie-leidende noise cancelling',
        brand: 'Sony',
        price: '379.00 EUR',
        sale_price: '179.95 EUR',
        price_now_clean: '179,95',
        price_old: '379,00',
        image_link: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Elektronica > Audio > Koptelefoon',
        shortspecs: '<ul><li>30 uur batterijduur</li><li>Hi-Res Audio</li><li>Multipoint</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
      {
        id: '2',
        title: 'Samsung 55" QLED 4K Smart TV',
        short_title: 'Samsung QLED TV',
        description: 'Crystal clear 4K beelden met Quantum Dot technologie',
        brand: 'Samsung',
        price: '899.00 EUR',
        sale_price: '549.00 EUR',
        price_now_clean: '549,00',
        price_old: '899,00',
        image_link: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Elektronica > Video > Televisies',
        shortspecs: '<ul><li>4K Ultra HD</li><li>Smart TV</li><li>HDR10+</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
      {
        id: '3',
        title: 'Philips Espresso Machine 3200',
        short_title: 'Philips Espresso',
        description: 'Volautomatische espressomachine met LatteGo melksysteem',
        brand: 'Philips',
        price: '649.00 EUR',
        sale_price: '399.00 EUR',
        price_now_clean: '399,00',
        price_old: '649,00',
        image_link: 'https://images.unsplash.com/photo-1517353817698-7e87d6c03ff1?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Huis en tuin > Keuken > Koffie',
        shortspecs: '<ul><li>LatteGo melksysteem</li><li>5 koffievariaties</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
      {
        id: '4',
        title: 'Apple MacBook Air M2',
        short_title: 'MacBook Air M2',
        description: 'Dunne en lichte laptop met krachtige M2 chip',
        brand: 'Apple',
        price: '1299.00 EUR',
        sale_price: '1099.00 EUR',
        price_now_clean: '1099,00',
        price_old: '1299,00',
        image_link: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Elektronica > Computers > Laptops',
        shortspecs: '<ul><li>M2 chip</li><li>18 uur batterij</li><li>Retina display</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
      {
        id: '5',
        title: 'Bosch Professional Accuboormachine',
        short_title: 'Bosch Boormachine',
        description: '18V accusysteem met twee accu\'s en lader',
        brand: 'Bosch',
        price: '199.00 EUR',
        sale_price: '129.00 EUR',
        price_now_clean: '129,00',
        price_old: '199,00',
        image_link: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Gereedschap > Elektrisch gereedschap',
        shortspecs: '<ul><li>18V Li-Ion</li><li>2 accu\'s</li><li>L-Boxx koffer</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
      {
        id: '6',
        title: 'Weber Spirit E-310 Gasbarbecue',
        short_title: 'Weber Spirit BBQ',
        description: 'Premium gasbarbecue voor de echte grillmaster',
        brand: 'Weber',
        price: '599.00 EUR',
        sale_price: '449.00 EUR',
        price_now_clean: '449,00',
        price_old: '599,00',
        image_link: 'https://images.unsplash.com/photo-1529690519561-bb05746d8dfb?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Huis en tuin > Tuin > BBQ',
        shortspecs: '<ul><li>3 branders</li><li>GS4 ontstekingssysteem</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
      {
        id: '7',
        title: 'Tommy Hilfiger Badjas Premium Cotton',
        short_title: 'Tommy Hilfiger Badjas',
        description: 'Luxe katoenen badjas in iconisch design',
        brand: 'Tommy Hilfiger',
        price: '89.00 EUR',
        sale_price: '49.00 EUR',
        price_now_clean: '49,00',
        price_old: '89,00',
        image_link: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Kleding > Nachtkleding',
        shortspecs: '<ul><li>100% katoen</li><li>Unisex</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
      {
        id: '8',
        title: 'Philips Sonicare DiamondClean',
        short_title: 'Philips Sonicare',
        description: 'Elektrische tandenborstel met slimme sensoren',
        brand: 'Philips',
        price: '249.00 EUR',
        sale_price: '149.00 EUR',
        price_now_clean: '149,00',
        price_old: '249,00',
        image_link: 'https://images.unsplash.com/photo-1559304787-5e4a5f1a5c3c?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Persoonlijke verzorging > Mondhygiene',
        shortspecs: '<ul><li>5 poetsstanden</li><li>2 weken batterij</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
      {
        id: '9',
        title: 'Nintendo Switch OLED Model',
        short_title: 'Nintendo Switch OLED',
        description: 'Verbeterde Switch met groter OLED scherm',
        brand: 'Nintendo',
        price: '349.00 EUR',
        sale_price: '289.00 EUR',
        price_now_clean: '289,00',
        price_old: '349,00',
        image_link: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Elektronica > Gaming',
        shortspecs: '<ul><li>7 inch OLED</li><li>64GB opslag</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
      {
        id: '10',
        title: 'Logitech MX Master 3S Muis',
        short_title: 'Logitech MX Master',
        description: 'Ergonomische muis voor productiviteit',
        brand: 'Logitech',
        price: '119.00 EUR',
        sale_price: '79.00 EUR',
        price_now_clean: '79,00',
        price_old: '119,00',
        image_link: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Elektronica > Computers > Accessoires',
        shortspecs: '<ul><li>8K DPI sensor</li><li>USB-C oplaadbaar</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
      {
        id: '11',
        title: 'Ooni Koda 16 Pizza Oven',
        short_title: 'Ooni Pizza Oven',
        description: 'Gas-gestookte pizza oven voor authentieke pizza\'s',
        brand: 'Ooni',
        price: '549.00 EUR',
        sale_price: '449.00 EUR',
        price_now_clean: '449,00',
        price_old: '549,00',
        image_link: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Huis en tuin > Keuken > Pizza',
        shortspecs: '<ul><li>500°C in 20 min</li><li>16 inch pizza\'s</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
      {
        id: '12',
        title: 'Dyson V15 Detect Absolute',
        short_title: 'Dyson V15',
        description: 'Krachtige snoerloze stofzuiger met laser stofdectie',
        brand: 'Dyson',
        price: '749.00 EUR',
        sale_price: '549.00 EUR',
        price_now_clean: '549,00',
        price_old: '749,00',
        image_link: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
        link: 'https://www.ibood.com/',
        google_product_category: 'Huis en tuin > Huishouden',
        shortspecs: '<ul><li>Laser stofdetectie</li><li>60 min runtime</li></ul>',
        availability: 'in stock',
        enddatetime: '2024-12-31T23:59:59',
      },
    ];
  }
}

export default async function HomePage() {
  const deals = await getDeals();

  return (
    <main className="w-full h-screen">
      <GameWrapper initialDeals={deals} />
    </main>
  );
}
