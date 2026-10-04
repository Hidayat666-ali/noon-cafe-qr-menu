import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MenuData } from '@/lib/types';

const dataFilePath = path.join(process.cwd(), 'data', 'menu-data.json');

function getMenuData(): MenuData {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileData);
    }
  } catch (error) {
    console.error('Error reading menu-data.json:', error);
  }
  // Fallback default
  return {
    settings: {
      name: "NOON CAFE",
      arabicName: "ن",
      tagline: "Cafe & Eatery",
      welcomeSubtext: "What's your craving?",
      address: "Shop No. 2, Survey No. 25, Near Darga Khaliz Khan, HMBS Colony",
      area: "Kismatpur, Rajendra Nagar",
      city: "Hyderabad",
      instagramUrl: "https://www.instagram.com/noonscafe/",
      contactNumber: "+91 98765 43210",
      googleMapsUrl: "https://maps.google.com/?q=Noon+Cafe+Kismatpur+Hyderabad",
      halalCertified: true,
      currencySymbol: "₹"
    },
    categories: [],
    items: [],
    offers: [],
    version: 1
  };
}

export async function GET() {
  const data = getMenuData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body: MenuData = await request.json();
    body.version = Date.now();
    
    // Ensure directory exists
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(dataFilePath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    console.error('Error writing menu-data.json:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save data' },
      { status: 500 }
    );
  }
}
