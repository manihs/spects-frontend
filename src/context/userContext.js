'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null)
  const { data: session, status } = useSession()

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user || !session?.accessToken) return

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
        setUserProfile(res.data.data)
      } catch (err) {
        console.error('Failed to load user profile:', err)
      }
    }

    if (status === 'authenticated' && !userProfile) {
      fetchUserProfile()
    }
  }, [session, status, userProfile])

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => useContext(UserContext)
