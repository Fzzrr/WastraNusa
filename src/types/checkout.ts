export const CHECKOUT_SESSION_KEY = 'checkout_session_v1';

export interface CheckoutSelectedItem {
  cartItemId: string;
  productId: string;
  variantId?: string | null;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  imageURL?: string | null;
}

export interface ShippingOption {
  id: string;
  name: string;
  courier: string;
  price: number;
  desc: string;
  tag?: string;
}

export interface CheckoutShippingSelection {
  id: string;
  courier: string;
  service: string;
  price: number;
  description: string;
}

export interface CheckoutAddressSelection {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface CheckoutSessionData {
  items: CheckoutSelectedItem[];
  shipping?: CheckoutShippingSelection;
  address?: CheckoutAddressSelection;
  createdAt: string;
}
