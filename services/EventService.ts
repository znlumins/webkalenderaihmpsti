import { supabase } from "../lib/supabaseClient";
import { EventData, Proker } from "../lib/types";

export class EventService {
  static async getAllEvents() {
    const { data, error } = await supabase
      .from("events")
      .select(`*, prokers (id, name, department_id, logo_url)`)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data as EventData[];
  }

  static async getAllProkers() {
    const { data, error } = await supabase.from("prokers").select("*").order('name');
    if (error) throw error;
    return data as Proker[];
  }

  static async createEvent(payload: any) {
    const { error } = await supabase.from("events").insert([payload]);
    if (error) throw error;
  }

  // UBAH TIPE ID JADI STRING (UUID)
  static async deleteEvent(id: string) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
  }

  static async createProker(payload: any) {
    const { error } = await supabase.from("prokers").insert([payload]);
    if (error) throw error;
  }

  static async uploadFile(bucket: string, file: File, prefix: string): Promise<string> {
    const fileName = `${prefix}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }
}