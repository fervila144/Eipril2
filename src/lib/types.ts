
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string; // Main image
  images?: string[]; // Up to 4 images including the main one
  category?: string;
  isHidden?: boolean;
  isOffer?: boolean;
  mpLink?: string; // Mercado Pago Link
  createdAt: number;
  updatedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  createdAt: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  order: number;
  createdAt: number;
}

export interface AppearanceSettings {
  primaryColor: string;
  fontFamily: string;
  logoText: string;
  catalogTitle?: string;
  catalogSubtitle?: string;
  logoUrl?: string;
  faviconUrl?: string;
  whatsappNumber: string;
  hideCarouselOnMobile?: boolean;
}

export interface Order {
  id: string;
  purchaseCode: string;
  customerName: string;
  customerSurname: string;
  customerDni: string;
  customerPhone: string;
  customerZipCode: string;
  customerAddress: string;
  customerHouseNumber: string;
  totalPrice: number;
  items: any[];
  status: 'pending' | 'confirmed';
  shippingLink?: string;
  createdAt: any;
}
