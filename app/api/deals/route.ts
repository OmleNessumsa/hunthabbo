import { NextResponse } from 'next/server';

const CSV_URL =
  process.env.NEXT_PUBLIC_DEALS_CSV_URL ||
  'https://files.channable.com/nTIZdHViSnzQAI5crs9heg==.csv';

export async function GET() {
  try {
    const response = await fetch(CSV_URL, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }

    const csvText = await response.text();

    return new NextResponse(csvText, {
      headers: {
        'Content-Type': 'text/csv',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching deals:', error);

    // Return mock data for development/demo if CSV fetch fails
    const mockCSV = `id,title,short_title,description,brand,price,sale_price,price_now_clean,price_old,image_link,link,google_product_category,shortspecs,availability,enddatetime
1,Sony WH-1000XM5 Wireless Noise Cancelling Koptelefoon,Sony WH-1000XM5,Premium wireless koptelefoon met industrie-leidende noise cancelling,Sony,379.00 EUR,179.95 EUR,179.95,379.00,https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400,https://www.ibood.com/,Elektronica > Audio > Koptelefoon,<ul><li>30 uur batterijduur</li><li>Hi-Res Audio</li><li>Multipoint verbinding</li></ul>,in stock,2024-12-31T23:59:59
2,Samsung 55" QLED 4K Smart TV,Samsung QLED TV,Crystal clear 4K beelden met Quantum Dot technologie,Samsung,899.00 EUR,549.00 EUR,549.00,899.00,https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400,https://www.ibood.com/,Elektronica > Video > Televisies,<ul><li>4K Ultra HD</li><li>Smart TV</li><li>HDR10+</li></ul>,in stock,2024-12-31T23:59:59
3,Philips Espresso Machine 3200,Philips Espresso,Volautomatische espressomachine met LatteGo melksysteem,Philips,649.00 EUR,399.00 EUR,399.00,649.00,https://images.unsplash.com/photo-1517353817698-7e87d6c03ff1?w=400,https://www.ibood.com/,Huis en tuin > Keuken > Koffie,<ul><li>LatteGo melksysteem</li><li>5 koffievariaties</li><li>Keramische maalschijven</li></ul>,in stock,2024-12-31T23:59:59
4,Apple MacBook Air M2,MacBook Air M2,Dunne en lichte laptop met krachtige M2 chip,Apple,1299.00 EUR,1099.00 EUR,1099.00,1299.00,https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400,https://www.ibood.com/,Elektronica > Computers > Laptops,<ul><li>M2 chip</li><li>18 uur batterij</li><li>Retina display</li></ul>,in stock,2024-12-31T23:59:59
5,Dyson V15 Detect Absolute,Dyson V15,Krachtige snoerloze stofzuiger met laser stofdectie,Dyson,749.00 EUR,549.00 EUR,549.00,749.00,https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400,https://www.ibood.com/,Huis en tuin > Huishouden,<ul><li>Laser stofdetectie</li><li>60 min runtime</li><li>HEPA filter</li></ul>,in stock,2024-12-31T23:59:59
6,Nintendo Switch OLED Model,Nintendo Switch OLED,Verbeterde Switch met groter OLED scherm,Nintendo,349.00 EUR,289.00 EUR,289.00,349.00,https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400,https://www.ibood.com/,Elektronica > Gaming,<ul><li>7 inch OLED</li><li>64GB opslag</li><li>Verbeterde audio</li></ul>,in stock,2024-12-31T23:59:59
7,Bosch Professional Accuboormachine,Bosch Boormachine,18V accusysteem met twee accu's en lader,Bosch,199.00 EUR,129.00 EUR,129.00,199.00,https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400,https://www.ibood.com/,Gereedschap > Elektrisch gereedschap,<ul><li>18V Li-Ion</li><li>2 accu's</li><li>L-Boxx koffer</li></ul>,in stock,2024-12-31T23:59:59
8,Weber Spirit E-310 Gasbarbecue,Weber Spirit BBQ,Premium gasbarbecue voor de echte grillmaster,Weber,599.00 EUR,449.00 EUR,449.00,599.00,https://images.unsplash.com/photo-1529690519561-bb05746d8dfb?w=400,https://www.ibood.com/,Huis en tuin > Tuin > BBQ,<ul><li>3 branders</li><li>GS4 ontstekingssysteem</li><li>513 cm2 grilloppervlak</li></ul>,in stock,2024-12-31T23:59:59
9,Tommy Hilfiger Badjas Premium Cotton,Tommy Hilfiger Badjas,Luxe katoenen badjas in iconisch design,Tommy Hilfiger,89.00 EUR,49.00 EUR,49.00,89.00,https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400,https://www.ibood.com/,Kleding > Nachtkleding,<ul><li>100% katoen</li><li>Unisex</li><li>Diverse maten</li></ul>,in stock,2024-12-31T23:59:59
10,Philips Sonicare DiamondClean,Philips Sonicare,Elektrische tandenborstel met slimme sensoren,Philips,249.00 EUR,149.00 EUR,149.00,249.00,https://images.unsplash.com/photo-1559304787-5e4a5f1a5c3c?w=400,https://www.ibood.com/,Persoonlijke verzorging > Mondhygiene,<ul><li>5 poetsstanden</li><li>2 weken batterij</li><li>Slimme timer</li></ul>,in stock,2024-12-31T23:59:59
11,Logitech MX Master 3S Muis,Logitech MX Master,Ergonomische muis voor productiviteit,Logitech,119.00 EUR,79.00 EUR,79.00,119.00,https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400,https://www.ibood.com/,Elektronica > Computers > Accessoires,<ul><li>8K DPI sensor</li><li>USB-C oplaadbaar</li><li>Multi-device</li></ul>,in stock,2024-12-31T23:59:59
12,Ooni Koda 16 Pizza Oven,Ooni Pizza Oven,Gas-gestookte pizza oven voor authentieke pizza's,Ooni,549.00 EUR,449.00 EUR,449.00,549.00,https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400,https://www.ibood.com/,Huis en tuin > Keuken > Pizza,<ul><li>500°C in 20 min</li><li>16 inch pizza's</li><li>Gas aansluiting</li></ul>,in stock,2024-12-31T23:59:59`;

    return new NextResponse(mockCSV, {
      headers: {
        'Content-Type': 'text/csv',
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  }
}
