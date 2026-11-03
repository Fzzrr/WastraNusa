'use client';

import { cn } from '@/lib/utils';
import { Bot, CornerDownLeft, Headset, RotateCcw, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Faq = { question: string; keywords: string[]; answer: string };

const FAQS: Faq[] = [
  {
    question: 'Bagaimana cara berbelanja?',
    keywords: ['belanja', 'beli', 'pesan', 'order', 'keranjang', 'checkout'],
    answer:
      'Buka Katalog, pilih produk, tentukan varian dan jumlah, lalu klik "Tambah ke Keranjang" atau "Beli Langsung". Di halaman checkout pilih alamat pengiriman, lalu lanjutkan ke pembayaran.',
  },
  {
    question: 'Metode pembayaran apa saja?',
    keywords: ['bayar', 'pembayaran', 'midtrans', 'transfer', 'qris'],
    answer:
      'Pembayaran diproses melalui Midtrans, dan metode yang tersedia tampil di halaman pembayaran. Selesaikan pembayaran sebelum batas waktunya habis, karena pesanan yang melewati batas waktu akan dibatalkan otomatis.',
  },
  {
    question: 'Berapa ongkos kirimnya?',
    keywords: ['ongkir', 'ongkos', 'kirim', 'pengiriman', 'biaya'],
    answer:
      'Ongkos kirim dan biaya layanan dihitung otomatis saat checkout, jadi totalnya sudah terlihat sebelum Anda membayar.',
  },
  {
    question: 'Bagaimana melacak pesanan saya?',
    keywords: ['lacak', 'status', 'pesanan', 'resi', 'sampai'],
    answer:
      'Buka Profil → Pesanan Saya untuk melihat status setiap pesanan, mulai dari menunggu pembayaran hingga dikirim dan diterima.',
  },
  {
    question: 'Bagaimana bertanya langsung ke penjual?',
    keywords: ['penjual', 'seller', 'tanya', 'chat', 'hubungi'],
    answer:
      'Buka halaman produk di Katalog lalu klik "Tanya Penjual". Produk tersebut otomatis disisipkan ke chat supaya penjual tahu produk mana yang Anda tanyakan.',
  },
  {
    question: 'Bagaimana cara membuka toko?',
    keywords: ['buka toko', 'jadi penjual', 'daftar', 'jualan', 'mitra'],
    answer:
      'Masuk ke akun Anda, lalu buka Profil → Buka Toko dan isi formulir pengajuan. Admin akan meninjau pengajuan sebelum toko Anda aktif.',
  },
  {
    question: 'Apa itu Ensiklopedia Wastra?',
    keywords: ['ensiklopedia', 'artikel', 'motif', 'sejarah', 'budaya'],
    answer:
      'Ensiklopedia berisi artikel tentang kain dan busana Nusantara. Di setiap artikel tersedia Asisten AI yang bisa menjawab pertanyaan seputar isi artikel itu.',
  },
  {
    question: 'Saya lupa kata sandi',
    keywords: ['sandi', 'password', 'lupa', 'login', 'masuk', 'akun'],
    answer:
      'Klik "Lupa kata sandi" di halaman masuk, lalu ikuti tautan reset yang dikirim ke email Anda.',
  },
];

const FALLBACK =
  'Maaf, saya belum punya jawaban untuk pertanyaan itu. Silakan pilih salah satu topik di bawah, atau tanyakan langsung ke penjual lewat tombol "Tanya Penjual" di halaman produk.';

// ponytail: keyword-hit scoring, swap for an LLM endpoint if FAQs outgrow it.
export function findFaqAnswer(text: string): string {
  const query = text.toLowerCase();
  let best: Faq | undefined;
  let bestScore = 0;
  for (const faq of FAQS) {
    const score = faq.keywords.filter((k) => query.includes(k)).length;
    if (score > bestScore) {
      best = faq;
      bestScore = score;
    }
  }
  return best?.answer ?? FALLBACK;
}

type Message = { id: number; role: 'user' | 'bot'; text: string };

/** Landing-page help bot answering common platform questions from a fixed FAQ. */
export function AdminChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const ask = (question: string, answer = findFaqAnswer(question)) => {
    const text = question.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length, role: 'user', text },
      { id: prev.length + 1, role: 'bot', text: answer },
    ]);
    setInput('');
  };

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
              Tanya admin WastraNusa
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
      className="fixed inset-x-3 top-20 bottom-3 z-50 flex animate-in flex-col overflow-hidden rounded-3xl border border-[#e4d9c7] bg-[#fbf8f2] shadow-[0_20px_45px_-10px_rgba(47,91,73,0.35)] duration-200 fade-in slide-in-from-bottom-4 sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[580px] sm:max-h-[calc(100dvh-3rem)] sm:w-[400px]"
    >
      <header className="flex items-center justify-between gap-3 bg-[#274c3d] px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#376352] ring-1 ring-[#caa86a]/60">
            <Headset className="size-5 text-[#f5ead3]" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-[#fbf8f2]">
              Admin WastraNusa
            </h2>
            <p className="truncate text-xs text-white/70">
              Tanya jawab seputar belanja di WastraNusa
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/75">
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={() => setMessages([])}
              title="Mulai ulang"
              aria-label="Mulai ulang percakapan"
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="size-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            title="Tutup"
            aria-label="Tutup bantuan"
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-[#faf6ee] p-4 text-sm leading-relaxed">
        <BotBubble text="Halo! Saya asisten admin WastraNusa. Pilih pertanyaan di bawah atau ketik pertanyaan Anda." />

        {messages.map((message) =>
          message.role === 'bot' ? (
            <BotBubble key={message.id} text={message.text} />
          ) : (
            <div key={message.id} className="flex justify-end">
              <p className="max-w-[84%] rounded-2xl rounded-tr-xs bg-[#2f5b49] px-3.5 py-2.5 whitespace-pre-wrap text-white">
                {message.text}
              </p>
            </div>
          ),
        )}

        <div className="flex flex-col gap-1.5 pt-1">
          {FAQS.map((faq) => (
            <button
              key={faq.question}
              type="button"
              onClick={() => ask(faq.question, faq.answer)}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-[#e5dcce] bg-[#fdfbf7] p-2.5 text-left text-xs font-medium text-[#463f35] transition-colors hover:border-[#caa86a] hover:text-[#2f5b49]"
            >
              <span>{faq.question}</span>
              <CornerDownLeft className="size-3 shrink-0 text-[#b3a896]" />
            </button>
          ))}
        </div>
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2 border-t border-[#e6dbc8] bg-[#fbf8f2] p-3"
      >
        <label htmlFor="admin-chatbot-input" className="sr-only">
          Tulis pertanyaan
        </label>
        <input
          id="admin-chatbot-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={500}
          placeholder="Tulis pertanyaan..."
          className="min-w-0 flex-1 rounded-2xl border border-[#d6cbba] bg-white px-3.5 py-2.5 text-sm text-[#2c2823] placeholder:text-[#998f80] focus:border-[#2f5b49] focus:ring-2 focus:ring-[#2f5b49]/20 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Kirim pertanyaan"
          className={cn(
            'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-[#2f5b49] text-white transition-colors hover:bg-[#254b3c]',
            'disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          <Send className="size-4" />
        </button>
      </form>
    </aside>
  );
}

function BotBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2f5b49] text-white">
        <Bot className="size-3.5" />
      </span>
      <p className="max-w-[84%] rounded-2xl rounded-tl-xs border border-[#e8ddcb] bg-white px-3.5 py-2.5 text-[#332f28]">
        {text}
      </p>
    </div>
  );
}
