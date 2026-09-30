import { z } from 'zod';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'model'], {
    error: 'Role harus bernilai "user" atau "model"',
  }),
  text: z
    .string()
    .trim()
    .min(1, 'Isi riwayat pesan tidak boleh kosong')
    .max(1000, 'Riwayat pesan maksimal 1000 karakter'),
});

export const chatRequestSchema = z.object({
  articleId: z
    .string()
    .trim()
    .min(1, 'articleId wajib diisi')
    .max(100, 'articleId tidak valid'),
  message: z
    .string()
    .trim()
    .min(1, 'Pertanyaan tidak boleh kosong')
    .max(1000, 'Pertanyaan maksimal 1000 karakter'),
  history: z
    .array(chatMessageSchema)
    .max(10, 'Riwayat percakapan maksimal 10 pesan')
    .optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type ChatHistoryMessage = z.infer<typeof chatMessageSchema>;
