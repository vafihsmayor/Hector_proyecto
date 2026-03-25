import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // En una aplicación real, usarías bcrypt para comparar contraseñas hasheadas
    const result = await query(
      'SELECT id, username, email, role FROM users WHERE username = $1 AND password_hash = $2 AND is_active = true',
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      // Aquí podrías generar un JWT, por ahora simulamos el éxito
      return NextResponse.json({
        user: user,
        token: 'azure-session-' + Date.now(),
      });
    } else {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor durante el inicio de sesión' },
      { status: 500 }
    );
  }
}
