import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { title, date, time, location, description, type, proker, dept, logistics } = await request.json();

    // Data Logistik (Barang Bawaan)
    const items = logistics && logistics !== "-" ? logistics : "Menyesuaikan";

    const systemPrompt = `
      Kamu adalah Sekretaris Organisasi. Tugasmu membuat Broadcast WhatsApp (Jarkoman) yang RAPI dan BERSIH.

      ATURAN FORMATTING WHATSAPP (STRICT):
      1. BOLD: Gunakan SATU BINTANG (*Teks*). JANGAN gunakan dua bintang (**Teks**).
      2. ITALIC: Gunakan SATU UNDERSCORE (_Teks_).
      3. LIST/POIN: Gunakan Angka (1.) atau Strip (-). DILARANG menggunakan bintang (*) untuk bullet point.
      4. SPASI: Jangan ada spasi antara simbol formatting dan teks. (Benar: *Halo*, Salah: * Halo *).
      
      STRUKTUR JARKOMAN:
      1. Judul Jarkoman (Bold & Uppercase) di dalam kurung siku.
      2. Salam pembuka singkat.
      3. Detail Acara (Gunakan emoji ikonik 📆 🕐 📍 sebagai bullet).
      4. Note/Catatan (Italic).
      5. Barang Bawaan (Jika ada, gunakan list angka).
      6. Syarat/Info Penting (Bold).

      CONTOH OUTPUT SEMPURNA (Tiru format ini):
      
      *[JARKOMAN RAPAT PLENO]*

      Halo teman-teman *KOMINFO!*
      Mau info nih terkait agenda Rapat Pleno 1.

      📆 Tanggal: Senin, 12 Agustus 2024
      🕐 Jam: 13.00 WIB
      📍 Tempat: _Sekre Utama_
      📍 Tikum: Depan Musholla

      _note: Harap datang tepat waktu, materi padat._

      *Barang bawaan yang wajib dibawa:*
      1. Laptop
      2. Kabel Roll
      3. Uang Kas

      ⚠️ *Penting:*
      Wajib hadir full team dan lunas kas!
    `;

    const userMessage = `
      Buatkan jarkoman bersih dengan data ini:
      - Departemen: ${dept}
      - Judul Acara: ${title}
      - Waktu: ${date}, Jam ${time}
      - Tempat: ${location}
      - Note/Deskripsi: ${description}
      - Barang Bawaan: ${items}
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.3, // Sangat rendah agar patuh aturan format
    });

    const text = completion.choices[0]?.message?.content || "Gagal membuat teks.";

    return NextResponse.json({ jarkoman: text });
  } catch (error) {
    console.error("Groq Error:", error);
    return NextResponse.json({ error: "Gagal memanggil AI" }, { status: 500 });
  }
}