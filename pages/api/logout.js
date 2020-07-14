import cookie from 'cookie'
import { SECRET_COOKIE, panoptesLogout } from '../../utils/panoptes-auth'

export default async function logout(req, res) {
  const { csrfToken } = await req.body
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const sessionSecret = cookies[SECRET_COOKIE]
  if (!sessionSecret) {
    // Already logged out.
    return res.status(200).end()
  }
  const { sessionCookie } = await panoptesLogout(csrfToken)
  res.setHeader('Set-Cookie', sessionCookie)
  res.status(200).end()
}
