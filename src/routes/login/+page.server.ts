import { fail, redirect } from '@sveltejs/kit';
import { PASSWORD } from '$env/static/private';

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const pw = form.get('password');

    if (pw !== PASSWORD) {
      // Wrong password → redisplay form with error
      return fail(400, { incorrect: true });
    }

    // Right password → set cookie & bounce to the secret page
    cookies.set('auth', 'yes', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 60 * 60 * 24 * 7
    });
    throw redirect(303, '/settings');
  }
};
