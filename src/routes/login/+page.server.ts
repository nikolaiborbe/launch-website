import { fail, redirect } from '@sveltejs/kit';
import { PASSWORD } from '$env/static/private';

export const actions = {
  default: async ({ request, cookies, url }) => {
    const data = await request.formData();
    const pw = data.get('password');

    if (pw !== PASSWORD) {
      return fail(400, { incorrect: true });
    }

    cookies.set('auth', 'yes', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60 * 24 * 7
    });

    // send them where they originally wanted to go, or default to /
    const next = url.searchParams.get('next') || '/';
    throw redirect(303, next);
  }
};
