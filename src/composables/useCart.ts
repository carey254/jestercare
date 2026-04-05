import { ref, computed } from 'vue'
import { user } from './useAuth'

interface CartItem {
  id: string
  name: string
  price: number
  unit: string
  quantity: number
  image?: string
  category?: string
}

// Global cart state
const cartItems = ref<CartItem[]>([])

// Computed properties
const cartCount = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})

const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const isInCart = (productId: string) => {
  return cartItems.value.some(item => item.id === productId)
}

// Cart actions
const addToCart = (product: any) => {
  const existingItem = cartItems.value.find(item => item.id === product.id)
  
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cartItems.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity: 1,
      image: product.image,
      category: product.category
    })
  }
}

const removeFromCart = (productId: string) => {
  const index = cartItems.value.findIndex(item => item.id === productId)
  if (index > -1) {
    cartItems.value.splice(index, 1)
  }
}

const updateQuantity = (productId: string, quantity: number) => {
  const item = cartItems.value.find(item => item.id === productId)
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      item.quantity = quantity
    }
  }
}

const clearCart = () => {
  cartItems.value = []
}

const generateWhatsAppMessage = () => {
  if (cartItems.value.length === 0) return ''
  
  let message = '🛒 *ORDER DETAILS*\n\n'
  
  // Add customer information if user is logged in
  if (user.value) {
    message += '*Customer Information:*\n'
    message += `Name: ${user.value.name}\n`
    if (user.value.phone) {
      message += `Phone: ${user.value.phone}\n`
    }
    if (user.value.email) {
      message += `Email: ${user.value.email}\n`
    }
    if (user.value.address) {
      message += `Address: ${user.value.address}\n`
    }
    message += '\n'
  }
  
  message += '*Items:*\n'
  
  cartItems.value.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`
    message += `   Quantity: ${item.quantity} ${item.unit}\n`
    message += `   Price: KSH ${item.price} each\n`
    message += `   Subtotal: KSH ${item.price * item.quantity}\n\n`
  })
  
  const subtotal = cartTotal.value
  const deliveryFee = subtotal > 0 ? 200 : 0
  const total = subtotal + deliveryFee
  
  message += '*Order Summary:*\n'
  message += `Subtotal: KSH ${subtotal}\n`
  message += `Delivery Fee: KSH ${deliveryFee}\n`
  message += `Total: KSH ${total}\n\n`
  message += '*Payment Method:* WhatsApp Pay\n\n'
  
  if (!user.value) {
    message += '📍 *Delivery Information Needed*\n'
    message += 'Please provide your delivery address and contact information.\n\n'
  } else if (!user.value.address) {
    message += '📍 *Delivery Address Needed*\n'
    message += 'Please provide your delivery address.\n\n'
  }
  
  message += 'Thank you for your order! 🎉'
  
  return message
}

export {
  cartItems,
  cartCount,
  cartTotal,
  isInCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  generateWhatsAppMessage
}

export type { CartItem }
