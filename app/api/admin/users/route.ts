import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Init Supabase dengan Service Role (Bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// --- GET: AMBIL SEMUA USER ---
export async function GET(req: Request) {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('role', { ascending: false });

    if (error) throw error;
    return NextResponse.json(profiles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- POST: BUAT USER BARU ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, department_id } = body;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: email,
            role: role, 
            department_id: role === 'super_admin' ? null : Number(department_id)
          }
        ]);
      
      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }
    }

    return NextResponse.json({ message: "User berhasil dibuat" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- PUT: RESET PASSWORD (BARU) ---
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, newPassword } = body;

    if (!id || !newPassword) {
      return NextResponse.json({ error: "ID dan Password baru wajib diisi" }, { status: 400 });
    }

    if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    // Update password user target
    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: newPassword
    });

    if (error) throw error;

    return NextResponse.json({ message: "Password berhasil diubah" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- DELETE: HAPUS USER ---
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID User diperlukan" }, { status: 400 });

    // Cek dulu jabatannya
    const { data: targetUser, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', id)
        .single();
    
    if (fetchError) throw fetchError;

    // Jangan hapus Bos
    if (targetUser?.role === 'super_admin') {
        return NextResponse.json(
            { error: "DILARANG: Akun Super Admin tidak boleh dihapus!" }, 
            { status: 403 }
        );
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) throw error;

    return NextResponse.json({ message: "User dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}