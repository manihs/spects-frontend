'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import axios from 'axios'

const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { data: session, status } = useSession()

  // Clear user data on logout
  const handleLogout = async (options = {}) => {
    setUserProfile(null)
    await signOut(options)
  }

  // Fetch user profile data when session changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user || !session?.accessToken) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        let endpoint = '/api/customers/profile'
        
        if (session.user.role) {
          endpoint = '/api/users/profile'
        }

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (res.data.success) {
          setUserProfile(res.data.data)
        } else {
          throw new Error(res.data.message || 'Failed to load user profile')
        }
      } catch (err) {
        console.error('Failed to load user profile:', err)
        setError(err.message || 'Failed to load user profile')
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchUserProfile()
    } else if (status === 'unauthenticated') {
      setUserProfile(null)
      setIsLoading(false)
    }
  }, [session, status])

  const value = {
    userProfile,
    setUserProfile,
    isLoading,
    isAuthenticated: status === 'authenticated',
    error,
    logout: handleLogout,
    isAdmin: session?.user?.role === 'ADMIN'
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => useContext(UserContext)
