import { supabase } from "../lib/supabaseClient";
import { EventData, Proker } from "../lib/types";

export class EventService {
  
  // ==========================================
  // 1. MANAJEMEN EVENT (JADWAL)
  // ==========================================

  // Ambil semua event lengkap dengan data prokernya
  static async getAllEvents() {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        prokers (
          id,
          name,
          department_id,
          logo_url
        )
      `)
      .order('start_time', { ascending: true });

    if (error) {
      console.error("Error fetching events:", error.message);
      throw error;
    }
    return data as EventData[];
  }

  // Buat Event Baru
  static async createEvent(payload: any) {
    const { data, error } = await supabase
      .from("events")
      .insert([payload])
      .select();
    
    if (error) throw error;
    return data;
  }

  // Update Event yang Sudah Ada
  static async updateEvent(id: string, payload: any) {
    const { data, error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  }

  // Hapus Event
  static async deleteEvent(id: string) {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }


  // ==========================================
  // 2. MANAJEMEN PROKER (PROGRAM KERJA)
  // ==========================================

  // Ambil semua daftar proker
  static async getAllProkers() {
    const { data, error } = await supabase
      .from("prokers")
      .select("*")
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching prokers:", error.message);
      throw error;
    }
    return data as Proker[];
  }

  // Buat Proker Baru
  static async createProker(payload: any) {
    const { data, error } = await supabase
      .from("prokers")
      .insert([payload])
      .select();

    if (error) throw error;
    return data;
  }

  // Update Proker
  static async updateProker(id: string, payload: any) {
    const { data, error } = await supabase
      .from("prokers")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  }

  // Hapus Proker (Catatan: Ini akan menghapus semua event terkait karena CASCADE)
  static async deleteProker(id: string) {
    const { error } = await supabase
      .from("prokers")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }


  // ==========================================
  // 3. FUNGSI PEMBANTU (STORAGE)
  // ==========================================

  // Upload file ke Supabase Storage (Materi/Logo)
  static async uploadFile(bucket: string, file: File, prefix: string): Promise<string> {
    // Bersihkan nama file dari karakter aneh/spasi
    const cleanFileName = file.name.replace(/[^\w.-]/g, '_');
    const fileName = `${prefix}_${Date.now()}_${cleanFileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error("Storage Upload Error:", error.message);
      throw error;
    }
    
    // Ambil URL publik file yang baru diupload
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
}