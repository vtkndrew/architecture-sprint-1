import React, { lazy } from 'react'

const UsersAppLazy = lazy(() =>
  import('users/UsersApp').catch(() => {
    return {
      default: () => (
        <div className="error">Users component is not available!</div>
      ),
    }
  })
)

const PhotosAppLazy = lazy(() =>
  import('photos/PhotosApp').catch(() => {
    return {
      default: () => (
        <div className="error">Photos component is not available!</div>
      ),
    }
  })
)

function Main({ eventBus }) {
  return (
    <main className="content">
      <UsersAppLazy eventBus={eventBus} />
      <PhotosAppLazy eventBus={eventBus} />
    </main>
  )
}

export default Main
