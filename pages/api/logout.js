import cookie from 'cookie'
import { SECRET_COOKIE } from '../../utils/panoptes-auth'
import { getCSRFToken } from '../../utils/auth'

async function signOut() {
  const csrfToken = await getCSRFToken()
  const config = {
    headers: {
      'x-csrf-token': csrfToken
    },
    method: 'delete'
  }
  return await fetch('https://www.zooniverse.org/users/sign_out', config)
}

export default async function logout(req, res) {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const sessionSecret = cookies[SECRET_COOKIE]
  if (!sessionSecret) {
    // Already logged out.
    return res.status(200).end()
  }
  // Invalidate secret (ie. logout from Fauna).
  await signOut()
  // Clear cookie.
  const cookieSerialized = cookie.serialize(SECRET_COOKIE, '', {
    sameSite: 'lax',
    // secure: process.env.NODE_ENV === 'production',
    maxAge: -1,
    httpOnly: true,
    path: '/',
  })
  res.setHeader('Set-Cookie', cookieSerialized)
  res.status(200).end()
}
