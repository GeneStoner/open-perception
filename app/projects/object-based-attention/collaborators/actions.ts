'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkPassword(_prevState: { error: string }, formData: FormData) {
  const entered = formData.get('password') as string;
  const correct = process.env.COLLAB_PASSWORD;

  if (!correct) throw new Error('COLLAB_PASSWORD env variable not set');

  if (entered === correct) {
    (await cookies()).set('collab_auth', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    redirect('/projects/object-based-attention/collaborators/data');
  }

  return { error: 'Incorrect password.' };
}
