'use client';

import { ChevronDown, CircleHelp, X } from 'lucide-react';
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
          aria-label="Bantuan"
          title="Bantuan"
          aria-haspopup="dialog"
          className="grid size-14 cursor-pointer place-items-center rounded-full bg-brand text-on-field transition hover:bg-brand-strong active:scale-95"
        >
          <CircleHelp className="size-6" strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <aside
      role="dialog"
      aria-label="Bantuan WastraNusa"
      className="fixed inset-x-3 top-20 bottom-3 z-50 flex animate-in flex-col overflow-hidden rounded-xl bg-card shadow-[0_24px_48px_-16px_rgba(31,53,43,0.4)] duration-200 fade-in slide-in-from-bottom-4 sm:inset-auto sm:right-6 sm:bottom-6 sm:max-h-[calc(100dvh-3rem)] sm:w-[400px]"
    >
      <header className="flex items-center justify-between gap-3 bg-field py-2 pr-2 pl-5 text-on-field">
        <h2 className="text-lg font-semibold">Bantuan</h2>
        <button
          ref={closeRef}
          type="button"
          onClick={() => setIsOpen(false)}
          title="Tutup"
          aria-label="Tutup bantuan"
          className="grid size-11 cursor-pointer place-items-center rounded-full text-on-field-soft transition-colors hover:bg-white/10 hover:text-on-field"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl transition-colors open:bg-surface"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-surface [&::-webkit-details-marker]:hidden">
              {faq.question}
              <ChevronDown className="size-4 shrink-0 text-ink-soft transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-3 pb-4 text-[15px] leading-relaxed text-ink">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </aside>
  );
}
