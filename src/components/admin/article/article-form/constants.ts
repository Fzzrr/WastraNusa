import { provinsi } from 'daftar-wilayah-indonesia';

export const MAJOR_ISLANDS = [
  'Jawa',
  'Sumatera',
  'Kalimantan',
  'Sulawesi',
  'Papua',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Maluku',
  'Maluku Utara',
  'Kepulauan Riau',
  'Bangka Belitung',
];

export const ALL_PROVINCES = provinsi();

export const ISLAND_TO_PROVINCE_CODES: Record<string, string[]> = {
  Jawa: ['31', '32', '33', '34', '35', '36'],
  Sumatera: ['11', '12', '13', '14', '15', '16', '17', '18'],
  Kalimantan: ['61', '62', '63', '64', '65'],
  Sulawesi: ['71', '72', '73', '74', '75', '76'],
  Papua: ['91', '92', '93', '94', '95', '96'],
  Bali: ['51'],
  'Nusa Tenggara Barat': ['52'],
  'Nusa Tenggara Timur': ['53'],
  Maluku: ['81'],
  'Maluku Utara': ['82'],
  'Kepulauan Riau': ['21'],
  'Bangka Belitung': ['19'],
};

export const EXCERPT_SOFT_LIMIT = 160;
