import cookie from 'cookie'
import { SECRET_COOKIE, getCSRFToken, panoptesLogin, serializeCookie, sessionSecret } from '../../utils/panoptes-auth'

export default async function login(req, res) {
  const { login, password } = await req.body

  try {
    if (!login || !password) {
      throw new Error('Email and password must be provided.')
    }

    const loginRes = await panoptesLogin({ login, password })

    const secret = sessionSecret(loginRes)

    res.setHeader('Set-Cookie', serializeCookie(secret))
    res.status(200).end()
  } catch (error) {
    res.status(400).send(error.message)
  }
}
