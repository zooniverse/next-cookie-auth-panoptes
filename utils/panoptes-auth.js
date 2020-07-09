import cookie from 'cookie'
import { getCSRFToken } from './auth'

export const SECRET_COOKIE = '_Panoptes_session'

export const serializeCookie = (userSecret) => {
  return cookie.serialize(SECRET_COOKIE, userSecret, {
    sameSite: 'lax',
    // secure: process.env.NODE_ENV === 'production',
    maxAge: 72576000,
    httpOnly: true,
    path: '/',
  })
}

export function sessionSecret(response) {
  const setCookie = response.headers.get('set-cookie')
  const cookies = setCookie.split(',');
  return cookies.reduce((jwt, cookieString) => {
    if (jwt) {
      return jwt
    }
    const parsed = cookie.parse(cookieString)
    return parsed[SECRET_COOKIE] || null
  }, null)
}

export async function tokenFromSession(sessionSecret) {
  const body = {
    grant_type: "password",
    client_id: "f79cf5ea821bb161d8cbb52d061ab9a2321d7cb169007003af66b43f7b79ce2a"
  }
  let config = {
    body: JSON.stringify(body),
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      cookie: `${SECRET_COOKIE}=${sessionSecret}`
    },
    method: 'post',
    withCredentials: true
  }
  const response = await fetch('https://www.zooniverse.org/oauth/token', config)
  return await response.json()
}

export async function panoptesLogin({ login, password}) {
  const csrfToken = await getCSRFToken()
  const body = {
    'authenticity_token': csrfToken,
    user: {
      login,
      password,
      remember_me: true
    }
  }
  let config = {
    body: JSON.stringify(body),
    headers: {
      accept: 'application/json',
      'content-type': 'application/json'
    },
    method: 'post'
  }
  const response = await fetch('https://www.zooniverse.org/users/sign_in', config)
  return response
}

export async function profileApi(sessionSecret) {
  const { access_token } = await tokenFromSession(sessionSecret)
  config = {
    headers: {
      authorization: `Bearer ${access_token}`,
      accept: 'application/vnd.api+json; version=1',
      'content-type': 'application/json',
      cookie: serializeCookie(sessionSecret)
    },
    method: 'get'
  }
  const userResponse = await fetch('https://www.zooniverse.org/api/me', config);
  const { users } = await userResponse.json()
  const [ user ] = users
  console.log(user.id, user.login)
  return user
}
