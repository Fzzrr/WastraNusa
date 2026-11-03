import type { ShippingOption } from '@/types/checkout';

/**
 * Single source of truth for checkout pricing. The client only sends the
 * chosen option id; the server looks the price up here, so a tampered request
 * can't change what Midtrans charges.
 */
export const SERVICE_FEE = 5000;

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'sic',
    name: 'Reguler',
    courier: 'SiCepat',
    price: 16000,
    desc: '2-4 hari kerja',
    tag: 'Hemat',
  },
  {
    id: 'jne-reg',
    name: 'Reguler (REG)',
    courier: 'JNE',
    price: 18000,
    desc: '3-5 hari kerja',
  },
  {
    id: 'jne-yes',
    name: 'YES (1 Hari)',
    courier: 'JNE',
    price: 42000,
    desc: '1 hari kerja',
  },
  {
    id: 'gosend',
    name: 'Same Day',
    courier: 'GoSend',
    price: 56000,
    desc: 'Hari ini (max 8 jam)',
    tag: 'Dalam kota',
  },
];

export function findShippingOption(id: string) {
  return SHIPPING_OPTIONS.find((option) => option.id === id);
}
