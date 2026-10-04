export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  image: string;
  description?: string;
  isNew?: boolean;
  isAvailable?: boolean;
  order?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  description?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  validityText: string;
  isActive: boolean;
  image?: string;
}

export interface CafeSettings {
  name: string;
  arabicName: string;
  tagline: string;
  welcomeSubtext: string;
  address: string;
  area: string;
  city: string;
  instagramUrl: string;
  contactNumber: string;
  googleMapsUrl?: string;
  halalCertified: boolean;
  currencySymbol: string;
}

export interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
  offers: Offer[];
  settings: CafeSettings;
  version: number;
}
