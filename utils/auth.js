import { useEffect } from 'react'
import Router from 'next/router'

export async function getCSRFToken() {
  const CSRFresponse = await fetch(`https://www.zooniverse.org/users/sign_in?now=${Date.now()}`, {
    method: 'head',
    withCredentials: true
  })
  const csrfToken = CSRFresponse.headers['x-csrf-token']
  return csrfToken
}

export const login = ({ email }) => {
  Router.push('/profile')
}

export const logout = async () => {
  await fetch('/api/logout')

  window.localStorage.setItem('logout', Date.now())

  Router.push('/login')
}

export const withAuthSync = (Component) => {
  const Wrapper = (props) => {
    const syncLogout = (event) => {
      if (event.key === 'logout') {
        console.log('logged out from storage!')
        Router.push('/login')
      }
    }

    useEffect(() => {
      window.addEventListener('storage', syncLogout)

      return () => {
        window.removeEventListener('storage', syncLogout)
        window.localStorage.removeItem('logout')
      }
    }, [])

    return <Component {...props} />
  }

  return Wrapper
}
