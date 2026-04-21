# IT Support AI — Gemini Flash (Gratis)

Aplikasi AI untuk tim IT Support menggunakan Google Gemini Flash (gratis).

---

## Cara Deploy

### Langkah 1 — Upload ke GitHub
1. Buka https://github.com → login
2. Klik **New repository** → nama: `it-support-ai` → **Create repository**
3. Upload semua file ini ke repository (drag & drop via web GitHub)

### Langkah 2 — Deploy ke Vercel
1. Buka https://vercel.com → login dengan akun GitHub
2. Klik **Add New Project** → pilih repo `it-support-ai` → **Import**
3. Di bagian **Environment Variables**, tambahkan:
   - Key: `GEMINI_API_KEY`
   - Value: API key dari https://aistudio.google.com
4. Klik **Deploy** — tunggu 1-2 menit
5. Vercel memberi URL → bagikan ke seluruh tim!

---

## Cara Update Knowledge Base

1. Buka repo di GitHub → masuk folder `knowledge`
2. Edit file `.txt` yang ada, atau klik **Add file** untuk file baru
3. **Commit changes** — Vercel otomatis rebuild dalam ~1 menit

### Format file TXT:
```
=== ERROR: [NAMA ERROR] ===
DESKRIPSI: ...
PENYEBAB:
- penyebab 1

SOLUSI:
1. langkah 1

=== TUTORIAL: [NAMA TUTORIAL] ===
LANGKAH-LANGKAH:
1. langkah 1
```

---

## Struktur Folder

```
it-support-ai/
├── knowledge/            ← Taruh semua file TXT di sini
│   ├── error-codes.txt
│   └── tutorials.txt
├── pages/
│   ├── index.js          ← Halaman utama (UI)
│   └── api/
│       └── chat.js       ← Backend (baca TXT + panggil Gemini)
├── .env.example
├── .gitignore
├── next.config.js
└── package.json
```

---

## Limit Gratis Gemini Flash

| | Limit |
|---|---|
| Request per menit | 15 |
| Request per hari | 1.500 |

Untuk tim 2-5 orang, limit ini lebih dari cukup.
