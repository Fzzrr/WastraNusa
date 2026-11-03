import {
  CHECKOUT_SESSION_KEY,
  type CheckoutSelectedItem,
  type CheckoutSessionData,
} from '@/types/checkout';

// 'Default' is the placeholder for items without a chosen variant; never show it.
export function displayVariant(variant?: string | null) {
  return variant && variant !== 'Default' ? variant : null;
}

let cachedRaw: string | null = null;
let cachedData: CheckoutSessionData | null = null;

const listeners = new Set<() => void>();

export function subscribeToCheckoutSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

function normalizeCheckoutSession(raw: unknown): CheckoutSessionData | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.items) || record.items.length === 0) return null;

  const items: CheckoutSelectedItem[] = record.items
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === 'object',
    )
    .map((item) => ({
      cartItemId: String(item.cartItemId ?? ''),
      productId: String(item.productId ?? ''),
      variantId: item.variantId ? String(item.variantId) : null,
      name: String(item.name ?? '-'),
      variant: String(item.variant ?? 'Default'),
      price: Number(item.price ?? 0),
      quantity: Number(item.quantity ?? 1),
    }))
    .filter((item) => item.cartItemId && item.productId && item.quantity > 0);

  if (items.length === 0) return null;

  const shippingRaw = record.shipping;
  const shipping =
    shippingRaw && typeof shippingRaw === 'object'
      ? {
          id: String((shippingRaw as Record<string, unknown>).id ?? ''),
          courier: String(
            (shippingRaw as Record<string, unknown>).courier ?? '',
          ),
          service: String(
            (shippingRaw as Record<string, unknown>).service ?? '',
          ),
          price: Number((shippingRaw as Record<string, unknown>).price ?? 0),
          description: String(
            (shippingRaw as Record<string, unknown>).description ?? '',
          ),
        }
      : undefined;

  const addressRaw = record.address;
  const address =
    addressRaw && typeof addressRaw === 'object'
      ? {
          id: String((addressRaw as Record<string, unknown>).id ?? ''),
          label: String((addressRaw as Record<string, unknown>).label ?? ''),
          recipientName: String(
            (addressRaw as Record<string, unknown>).recipientName ?? '',
          ),
          phone: String((addressRaw as Record<string, unknown>).phone ?? ''),
          fullAddress: String(
            (addressRaw as Record<string, unknown>).fullAddress ?? '',
          ),
          city: String((addressRaw as Record<string, unknown>).city ?? ''),
          province: String(
            (addressRaw as Record<string, unknown>).province ?? '',
          ),
          postalCode: String(
            (addressRaw as Record<string, unknown>).postalCode ?? '',
          ),
        }
      : undefined;

  return {
    items,
    shipping,
    address,
    createdAt: String(record.createdAt ?? new Date().toISOString()),
  };
}

export function getCheckoutSession(): CheckoutSessionData | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
  if (!raw) {
    cachedRaw = null;
    cachedData = null;
    return null;
  }

  if (raw === cachedRaw) {
    return cachedData;
  }

  try {
    const data = normalizeCheckoutSession(JSON.parse(raw));
    cachedRaw = raw;
    cachedData = data;
    return data;
  } catch {
    cachedRaw = null;
    cachedData = null;
    return null;
  }
}

export function setCheckoutSession(sessionData: CheckoutSessionData) {
  if (typeof window === 'undefined') return;
  const raw = JSON.stringify(sessionData);
  sessionStorage.setItem(CHECKOUT_SESSION_KEY, raw);
  cachedRaw = raw;
  cachedData = sessionData;
  notifyListeners();
}
