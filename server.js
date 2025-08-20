require("dotenv").config();
const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3000;

// Inisialisasi Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validasi variabel lingkungan Supabase saat startup
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "FATAL ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in your .env file."
  );
  process.exit(1); // Hentikan server jika konfigurasi tidak ada
}
if (supabaseUrl.startsWith("postgres")) {
  console.error(
    'FATAL ERROR: Your SUPABASE_URL in .env is incorrect. It should be the Project URL (e.g., "https://<project-ref>.supabase.co"), not the database connection string.'
  );
  process.exit(1); // Hentikan server jika URL salah format
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware to serve static files from the 'public' directory for local development
app.use(express.static(path.join(__dirname, "public")));

// Middleware untuk membaca body JSON dari request
app.use(express.json());

// Endpoint API untuk MENYIMPAN janji temu baru
app.post("/api/janji-temu", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("janji_temu")
      .insert([req.body]) // req.body berisi data dari form
      .select();

    if (error) throw error;

    res.status(201).json(data); // 201 = Created
  } catch (error) {
    res.status(500).json({ error: `Gagal menyimpan data: ${error.message}` });
  }
});

// Endpoint API untuk MENGAMBIL SEMUA janji temu
app.get("/api/janji-temu", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("janji_temu")
      .select("*")
      .order("created_at", { ascending: false }); // Tampilkan yang terbaru dulu

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: `Gagal mengambil data: ${error.message}` });
  }
});

// Endpoint API untuk MENGHAPUS janji temu
app.delete("/api/janji-temu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("janji_temu").delete().eq("id", id);

    if (error) {
      throw error;
    }

    res.status(204).send(); // 204 No Content -> sukses, tidak ada body balasan
  } catch (error) {
    res.status(500).json({ error: `Gagal menghapus data: ${error.message}` });
  }
});

// Jalankan server hanya jika file ini dieksekusi secara langsung (untuk pengembangan lokal)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}/index.html`);
  });
}

// Ekspor aplikasi Express agar Vercel dapat menggunakannya
module.exports = app;
