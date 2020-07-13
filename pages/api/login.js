import cookie from 'cookie'
import { panoptesLogin } from '../../utils/panoptes-auth'

export default async function login(req, res) {
  const { login, password } = await req.body

  try {
    if (!login || !password) {
      throw new Error('Email and password must be provided.')
    }

    const { sessionCookie } = await panoptesLogin({ login, password })

    res.setHeader('Set-Cookie', sessionCookie)
    res.status(200).end()
  } catch (error) {
    res.status(400).send(error.message)
  }
}
