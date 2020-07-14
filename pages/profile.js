import cookie from 'cookie'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { withAuthSync } from '../utils/auth'
import { SECRET_COOKIE, api } from '../utils/panoptes-auth'
import Layout from '../components/layout'

const Profile = ({ user, error }) => {
  const router = useRouter()

  useEffect(() => {
    if (error) {
      console.log(error.message)
      router.push('/')
    }
  }, [error, router])

  return (
    <Layout>
      {error ? (
        <h1>An error has ocurred: {error.message}</h1>
      ) : user ? (
        <>
          <h1>{user.display_name}</h1>
          <dl>
            <dt>ID</dt>
            <dd>{user.id}</dd>
            <dt>email</dt>
            <dd>{user.email}</dd>
          </dl>
        </>
      ) : (
        <h1>Loading...</h1>
      )}
      <style jsx>{`
        h1 {
          margin-bottom: 0;
        }
      `}</style>
    </Layout>
  )
}

export async function getServerSideProps({ req, res }) {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const sessionSecret = cookies[SECRET_COOKIE]

  let error = null
  let user = null

  if (!sessionSecret) {
    error = { message: 'Not logged-in' }
  } else {
    const { users } = await api('/me', sessionSecret)
    user = users[0]
  }

  const props = { error, user }
  return({ props })
}

export default withAuthSync(Profile)
