import { ref, computed } from 'vue'

interface User {
  id: string
  name: string
  email: string
  phone: string
  address?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
}

// Global auth state
const authState = ref<AuthState>({
  user: null,
  isAuthenticated: false,
  token: null
})

// Load user from localStorage on app initialization
const loadUserFromStorage = () => {
  const storedUser = localStorage.getItem('jester_user')
  const storedToken = localStorage.getItem('jester_token')
  
  if (storedUser && storedToken) {
    try {
      const user = JSON.parse(storedUser)
      authState.value = {
        user,
        isAuthenticated: true,
        token: storedToken
      }
    } catch (error) {
      console.error('Failed to parse stored user data:', error)
      clearAuth()
    }
  }
}

// Computed properties
const user = computed(() => authState.value.user)
const isAuthenticated = computed(() => authState.value.isAuthenticated)

// Sign up function
const signUp = async (userData: {
  name: string
  email: string
  phone: string
  password: string
  address?: string
}) => {
  try {
    // Simulate API call - replace with actual backend call
    const response = await mockAPICall('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    
    if (response.success && response.data) {
      const { user: newUser, token } = response.data
      
      // Store in localStorage
      localStorage.setItem('jester_user', JSON.stringify(newUser))
      localStorage.setItem('jester_token', token)
      
      // Update state
      authState.value = {
        user: newUser,
        isAuthenticated: true,
        token
      }
      
      return { success: true, user: newUser }
    } else {
      return { success: false, error: response.error || 'Sign up failed' }
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

// Sign in function
const signIn = async (credentials: {
  email: string
  password: string
}) => {
  try {
    // Simulate API call - replace with actual backend call
    const response = await mockAPICall('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    
    if (response.success && response.data) {
      const { user: loggedInUser, token } = response.data
      
      // Store in localStorage
      localStorage.setItem('jester_user', JSON.stringify(loggedInUser))
      localStorage.setItem('jester_token', token)
      
      // Update state
      authState.value = {
        user: loggedInUser,
        isAuthenticated: true,
        token
      }
      
      return { success: true, user: loggedInUser }
    } else {
      return { success: false, error: response.error || 'Sign in failed' }
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

// Sign out function
const signOut = () => {
  localStorage.removeItem('jester_user')
  localStorage.removeItem('jester_token')
  authState.value = {
    user: null,
    isAuthenticated: false,
    token: null
  }
}

// Clear auth state
const clearAuth = () => {
  signOut()
}

// Mock API call - replace with actual backend integration
const mockAPICall = async (endpoint: string, options: RequestInit) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock users database (in real app, this would be on the backend)
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+254712345678',
      password: 'password123', // In real app, this would be hashed
      address: 'Nairobi, Kenya'
    }
  ]
  
  if (endpoint === '/api/auth/signup') {
    const userData = JSON.parse(options.body as string)
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email)
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' }
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address
    }
    
    const token = 'mock_token_' + Date.now()
    
    return {
      success: true,
      data: { user: newUser, token }
    }
  }
  
  if (endpoint === '/api/auth/signin') {
    const credentials = JSON.parse(options.body as string)
    
    // Find user
    const user = mockUsers.find(u => u.email === credentials.email)
    if (!user || user.password !== credentials.password) {
      return { success: false, error: 'Invalid email or password' }
    }
    
    const { password, ...userWithoutPassword } = user
    const token = 'mock_token_' + Date.now()
    
    return {
      success: true,
      data: { user: userWithoutPassword, token }
    }
  }
  
  return { success: false, error: 'Unknown endpoint' }
}

// Initialize auth state
loadUserFromStorage()

export {
  authState,
  user,
  isAuthenticated,
  signUp,
  signIn,
  signOut,
  clearAuth,
  loadUserFromStorage
}

export type { User, AuthState }
