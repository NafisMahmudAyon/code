import React, { Suspense } from 'react'
import SearchPage from './pageClient'

const page = () => {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  )
}

export default page