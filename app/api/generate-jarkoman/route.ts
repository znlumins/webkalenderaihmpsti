import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
        title, proker, dept, type, date, time, 
        location, pic, status, link_meeting, 
        description, logistics 
    } = body;

    const systemPrompt = `
      Kamu adalah Sekretaris Humas HMPSTI. Tugasmu membuat Jarkoman WhatsApp yang estetik.
      
      ATURAN FORMAT WA:
      - Bold: *teks* (bintang satu)
      - Italic: _teks_ (underscore satu)
      - List: Gunakan angka (1.) atau emoji. DILARANG pakai bintang (*) untuk list.
      - Tone: ${type === 'Hari H (Eksekusi)' ? 'Sangat Bersemangat' : 'Formal & Disiplin'}.
    `;

    const userMessage = `
      Buatkan jarkoman premium:
      *[JARKOMAN - ${title.toUpperCase()}]*

      Halo teman-teman *${dept}*!
      
      📌 *Proker:* ${proker}
      📆 *Hari/Tgl:* ${date}
      🕐 *Waktu:* ${time}
      📍 *Tempat:* ${location}
      👤 *PIC:* ${pic || 'Admin'}
      ⚠️ *Status:* ${status}
      ${link_meeting ? `🔗 *Link:* ${link_meeting}` : ''}

      *Agenda:*
      _${description || '-'}_

      *Bawaan:*
      ${logistics || 'Menyesuaikan'}

      Terima kasih, Semangat!
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
    });

    return NextResponse.json({ jarkoman: completion.choices[0]?.message?.content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}