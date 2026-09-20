declare module 'daftar-wilayah-indonesia' {
  export interface Wilayah {
    kode: string;
    nama: string;
    kode_provinsi?: string;
    kode_kabupaten?: string;
    kode_kecamatan?: string;
  }

  export function provinsi(): Wilayah[];
  export function kabupaten(kodeProvinsi: string): Wilayah[];
  export function kecamatan(kodeKabupaten: string): Wilayah[];
  export function desa(kodeKecamatan: string): Wilayah[];
  export function kelurahan(kodeKecamatan: string): Wilayah[];
}
