'use client'
import { useToast } from 'aspect-ui'
import React from 'react'

const Notify = () => {
  const { ToastContainer } = useToast()
  return (
    <ToastContainer />
  )
}

export default Notify