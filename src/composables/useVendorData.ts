// Vendor data management system using localStorage
export interface Vendor {
  id: string
  businessName: string
  businessType: string
  businessCategory: string
  contactPerson: string
  phone: string
  email: string
  location: string
  businessDescription: string
  operatingHours: string
  deliveryRadius: string
  bankName: string
  bankAccount: string
  image?: string
  rating?: number
  totalReviews?: number
  deliveryTime?: string
  deliveryFee?: number
  minOrder?: number
  verified?: boolean
  status?: 'pending' | 'approved' | 'rejected' | 'active'
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  vendorId: string
  name: string
  category: string
  price: number
  stock: number
  description: string
  image?: string
  status: 'active' | 'inactive'
  orders: number
  rating?: number
  originalPrice?: number
  discount?: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  vendorId: string
  customerInfo: {
    name: string
    phone: string
    email: string
    deliveryAddress: string
    deliveryInstructions?: string
    paymentMethod: string
  }
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image?: string
  }>
  totals: {
    subtotal: number
    deliveryFee: number
    total: number
  }
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'
  createdAt: string
  estimatedDelivery?: string
  actualDelivery?: string
}

const STORAGE_KEYS = {
  VENDORS: 'jester_vendors',
  PRODUCTS: 'jester_products',
  ORDERS: 'jester_orders',
  VENDOR_SESSION: 'jester_vendor_session'
}

// Initialize storage with empty arrays if they don't exist
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.VENDORS)) {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]))
  }
}

// Vendor functions
export function saveVendor(vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Vendor {
  initializeStorage()
  
  const vendors = getAllVendors()
  const newVendor: Vendor = {
    ...vendorData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending',
    verified: false,
    rating: 0,
    totalReviews: 0,
    deliveryTime: '30-45 minutes',
    deliveryFee: 150,
    minOrder: 500,
    image: '/api/placeholder/300/200'
  }
  
  vendors.push(newVendor)
  localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors))
  
  return newVendor
}

export function getAllVendors(): Vendor[] {
  initializeStorage()
  const vendors = localStorage.getItem(STORAGE_KEYS.VENDORS)
  return vendors ? JSON.parse(vendors) : []
}

export function getVendorById(id: string): Vendor | null {
  const vendors = getAllVendors()
  return vendors.find(v => v.id === id) || null
}

export function updateVendor(id: string, updates: Partial<Vendor>): Vendor | null {
  const vendors = getAllVendors()
  const index = vendors.findIndex(v => v.id === id)
  
  if (index === -1) return null
  
  vendors[index] = {
    ...vendors[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors))
  return vendors[index]
}

export function getActiveVendors(): Vendor[] {
  return getAllVendors().filter(v => v.status === 'active' && v.verified)
}

export function approveVendor(id: string): boolean {
  return updateVendor(id, { status: 'active', verified: true }) !== null
}

export function rejectVendor(id: string): boolean {
  return updateVendor(id, { status: 'rejected' }) !== null
}

// Product functions
export function saveProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  initializeStorage()
  
  const products = getAllProducts()
  const newProduct: Product = {
    ...productData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orders: 0,
    rating: 0
  }
  
  products.push(newProduct)
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  
  return newProduct
}

export function getAllProducts(): Product[] {
  initializeStorage()
  const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
  return products ? JSON.parse(products) : []
}

export function getProductsByVendor(vendorId: string): Product[] {
  return getAllProducts().filter(p => p.vendorId === vendorId)
}

export function getActiveProductsByVendor(vendorId: string): Product[] {
  return getProductsByVendor(vendorId).filter(p => p.status === 'active')
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getAllProducts()
  const index = products.findIndex(p => p.id === id)
  
  if (index === -1) return null
  
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  return products[index]
}

export function deleteProduct(id: string): boolean {
  const products = getAllProducts()
  const filteredProducts = products.filter(p => p.id !== id)
  
  if (filteredProducts.length === products.length) return false
  
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filteredProducts))
  return true
}

// Order functions
export function saveOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Order {
  initializeStorage()
  
  const orders = getAllOrders()
  const newOrder: Order = {
    ...orderData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: 'pending'
  }
  
  orders.push(newOrder)
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  
  return newOrder
}

export function getAllOrders(): Order[] {
  initializeStorage()
  const orders = localStorage.getItem(STORAGE_KEYS.ORDERS)
  return orders ? JSON.parse(orders) : []
}

export function getOrdersByVendor(vendorId: string): Order[] {
  return getAllOrders().filter(o => o.vendorId === vendorId)
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = getAllOrders()
  const index = orders.findIndex(o => o.id === id)
  
  if (index === -1) return null
  
  orders[index] = {
    ...orders[index],
    ...updates
  }
  
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  return orders[index]
}

// Vendor session management
export function setVendorSession(vendor: Vendor) {
  localStorage.setItem(STORAGE_KEYS.VENDOR_SESSION, JSON.stringify(vendor))
}

export function getVendorSession(): Vendor | null {
  const session = localStorage.getItem(STORAGE_KEYS.VENDOR_SESSION)
  return session ? JSON.parse(session) : null
}

export function clearVendorSession() {
  localStorage.removeItem(STORAGE_KEYS.VENDOR_SESSION)
}

// Utility functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function getVendorStats(vendorId: string) {
  const products = getProductsByVendor(vendorId)
  const orders = getOrdersByVendor(vendorId)
  const activeProducts = products.filter(p => p.status === 'active')
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  
  const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totals.total, 0)
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt).toDateString()
    const today = new Date().toDateString()
    return orderDate === today
  })
  
  return {
    totalProducts: products.length,
    activeProducts: activeProducts.length,
    totalOrders: orders.length,
    pendingOrders: pendingOrders.length,
    deliveredOrders: deliveredOrders.length,
    totalRevenue,
    todayOrders: todayOrders.length
  }
}

// Search and filter functions
export function searchVendors(query: string, filters?: {
  category?: string
  location?: string
  businessType?: string
}): Vendor[] {
  let vendors = getActiveVendors()
  
  if (query) {
    const searchTerm = query.toLowerCase()
    vendors = vendors.filter(v => 
      v.businessName.toLowerCase().includes(searchTerm) ||
      v.businessDescription.toLowerCase().includes(searchTerm) ||
      v.businessType.toLowerCase().includes(searchTerm) ||
      v.location.toLowerCase().includes(searchTerm)
    )
  }
  
  if (filters?.category) {
    vendors = vendors.filter(v => v.businessCategory === filters.category)
  }
  
  if (filters?.location) {
    vendors = vendors.filter(v => v.location.toLowerCase().includes(filters.location!.toLowerCase()))
  }
  
  if (filters?.businessType) {
    vendors = vendors.filter(v => v.businessType === filters.businessType)
  }
  
  return vendors
}
