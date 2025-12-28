export interface Proker {
    id: string; // UBAH KE STRING (karena UUID)
    name: string;
    department_id: number; // Ini tetap number (1-7)
    logo_url?: string;
}

export interface EventData {
    id: string; // UBAH KE STRING (karena UUID)
    title: string;
    activity_type: string;
    start_time: string;
    end_time: string;
    location: string;
    description: string;
    proker_id: string; // UUID
    participants: string;
    logistics: string;
    file_url?: string;
    prokers: Proker; // Relasi
    pic?: string;
    link_meeting?: string;
    status?: string;
}

export interface UserProfile {
    id: string; // UUID
    email: string;
    role: string; // 'super_admin' atau 'dept_admin'
    department_id: number; // 1-7
}