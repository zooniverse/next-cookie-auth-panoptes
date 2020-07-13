import cookie from 'cookie'
import { panoptes } from '@zooniverse/panoptes-js'

const CLIENT_ID = "535759b966935c297be11913acee7a9ca17c025f9f15520e7504728e71110a27"
const API_HOST = "https://panoptes-staging.zooniverse.org"
export const SECRET_COOKIE = '_Panoptes_session'

export async function getCSRFToken() {
  const CSRFresponse = await fetch(`${API_HOST}/users/sign_in?now=${Date.now()}`, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json'
    },
    method: 'head',
    withCredentials: true
  })
  const csrfToken = CSRFresponse.headers.get('x-csrf-token')
  return csrfToken
}

export function serializeCookie(userSecret) {
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
    client_id: CLIENT_ID
  }
  const config = {
    body: JSON.stringify(body),
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      cookie: `${SECRET_COOKIE}=${sessionSecret}`
    },
    method: 'post',
    withCredentials: true
  }
  const response = await fetch(`${API_HOST}/oauth/token`, config)
  return await response.json()
}

export async function panoptesLogin({ login, password, csrfToken }) {
  const body = {
    'authenticity_token': csrfToken,
    user: {
      login,
      password,
      remember_me: true
    }
  }
  const config = {
    body: JSON.stringify(body),
    headers: {
      accept: 'application/json',
      'content-type': 'application/json'
    },
    method: 'post'
  }
  const response = await fetch(`${API_HOST}/users/sign_in`, config)
  const session = sessionSecret(response)
  const sessionCookie = serializeCookie(session)
  return { response, sessionCookie }
}

export async function panoptesLogout(csrfToken) {
  const config = {
    headers: {
      'x-csrf-token': csrfToken
    },
    method: 'delete'
  }
  return await fetch(`${API_HOST}/users/sign_out`, config)
}

export async function api(url, sessionSecret) {
  const { access_token } = await tokenFromSession(sessionSecret)
  const headers = {
    authorization: `Bearer ${access_token}`
  }
  const response = await panoptes.get(`/api${url}`, {}, headers, API_HOST)
  return response.body
}

export async function profileApi(sessionSecret) {
  const { users } = await api('/me', sessionSecret)
  const [ user ] = users
  console.log(user.id, user.login)
  return user
}
