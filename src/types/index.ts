export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  customizable: boolean;
  dimensions?: {
    height: number;
    width: number;
    depth: number;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface PromoCode {
  code: string;
  discount: number;
  validUntil: string;
  minimumPurchase?: number;
  maxUses?: number;
  currentUses: number;
} 