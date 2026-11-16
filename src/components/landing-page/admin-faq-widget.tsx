'use client';

import { ChevronDown, Headset, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const FAQS = [
  {
    question: 'Bagaimana cara berbelanja?',
    answer:
      'Buka Katalog, pilih produk, tentukan varian dan jumlah, lalu klik "Tambah ke Keranjang" atau "Beli Langsung". Di halaman checkout pilih alamat pengiriman, lalu lanjutkan ke pembayaran.',
  },
  {
    question: 'Metode pembayaran apa saja?',
    answer:
      'Pembayaran diproses melalui Midtrans, dan metode yang tersedia tampil di halaman pembayaran. Selesaikan pembayaran sebelum batas waktunya habis, karena pesanan yang melewati batas waktu akan dibatalkan otomatis.',
  },
  {
    question: 'Berapa ongkos kirimnya?',
    answer:
      'Ongkos kirim dan biaya layanan dihitung otomatis saat checkout, jadi totalnya sudah terlihat sebelum Anda membayar.',
  },
  {
    question: 'Bagaimana melacak pesanan saya?',
    answer:
      'Buka Profil → Pesanan Saya untuk melihat status setiap pesanan, mulai dari menunggu pembayaran hingga dikirim dan diterima.',
  },
  {
    question: 'Bagaimana bertanya langsung ke penjual?',
    answer:
      'Buka halaman produk di Katalog lalu klik "Tanya Penjual". Produk dan varian yang Anda pilih otomatis disisipkan ke chat supaya penjual tahu apa yang Anda tanyakan.',
  },
  {
    question: 'Bagaimana cara membuka toko?',
    answer:
      'Masuk ke akun Anda, lalu buka Profil → Buka Toko dan isi formulir pengajuan. Admin akan meninjau pengajuan sebelum toko Anda aktif.',
  },
  {
    question: 'Apa itu Ensiklopedia Wastra?',
    answer:
      'Ensiklopedia berisi artikel tentang kain dan busana Nusantara. Di setiap artikel tersedia Asisten AI yang bisa menjawab pertanyaan seputar isi artikel itu.',
  },
  {
    question: 'Saya lupa kata sandi',
    answer:
      'Klik "Lupa kata sandi" di halaman masuk, lalu ikuti tautan reset yang dikirim ke email Anda.',
  },
];

/** Landing-page help panel listing common platform questions (FAQ only). */
export function AdminFaqWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Buka bantuan WastraNusa"
          aria-haspopup="dialog"
          className="group flex cursor-pointer items-center gap-2.5 rounded-full bg-[#2f5b49] p-2 text-white shadow-[0_10px_25px_-5px_rgba(47,91,73,0.5)] ring-2 ring-[#caa86a]/40 transition-all duration-300 hover:-translate-y-1 hover:bg-[#254b3c] hover:ring-[#caa86a] active:scale-95 sm:pr-4"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-[#f5ead3] transition-transform duration-300 group-hover:-rotate-12">
            <Headset className="size-[18px] text-[#2f5b49]" />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs leading-tight font-bold tracking-wide text-[#f5ead3]">
              Bantuan
            </span>
            <span className="block text-xs font-medium text-white/80">
              Pertanyaan umum (FAQ)
            </span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside
      role="dialog"
      aria-label="Bantuan WastraNusa"
      className="fixed inset-x-3 top-20 bottom-3 z-50 flex animate-in flex-col overflow-hidden rounded-3xl border border-[#e4d9c7] bg-[#fbf8f2] shadow-[0_20px_45px_-10px_rgba(47,91,73,0.35)] duration-200 fade-in slide-in-from-bottom-4 sm:inset-auto sm:right-6 sm:bottom-6 sm:max-h-[calc(100dvh-3rem)] sm:w-[400px]"
    >
      <header className="flex items-center justify-between gap-3 bg-[#274c3d] px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#376352] ring-1 ring-[#caa86a]/60">
            <Headset className="size-5 text-[#f5ead3]" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-[#fbf8f2]">
              Bantuan WastraNusa
            </h2>
            <p className="truncate text-xs text-white/70">
              Pertanyaan yang sering diajukan
            </p>
          </div>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={() => setIsOpen(false)}
          title="Tutup"
          aria-label="Tutup bantuan"
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl border border-[#e5dcce] bg-white open:border-[#caa86a]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 text-sm font-semibold text-[#2f5b49] [&::-webkit-details-marker]:hidden">
              {faq.question}
              <ChevronDown className="size-4 shrink-0 text-[#a07a2c] transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-3 pb-3 text-sm leading-relaxed text-[#463f35]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </aside>
  );
}
