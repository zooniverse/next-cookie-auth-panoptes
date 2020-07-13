import { useEffect } from 'react'
import Router from 'next/router'
import { getCSRFToken } from './panoptes-auth'

export const login = ({ email }) => {
  Router.push('/profile')
}

export const logout = async () => {
  const csrfToken = await getCSRFToken()
  await fetch('/api/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csrfToken }),
  })

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
