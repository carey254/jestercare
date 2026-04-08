import { ref, computed, watch } from 'vue'
import { user } from './useAuth'
import { calculateDelivery, calculateServiceFee, calculateOrderTotal, getPriceDisclaimer, getDeliveryTimeMessage } from './useDelivery'

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

const CART_STORAGE_KEY = 'jester_cart_items'

function safeParseCart(raw: string | null): CartItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((x) => x && typeof x === 'object')
      .map((x: any) => ({
        id: String(x.id ?? ''),
        name: String(x.name ?? ''),
        price: Number(x.price ?? 0),
        unit: String(x.unit ?? 'pcs'),
        quantity: Math.max(1, Number(x.quantity ?? 1)),
        image: typeof x.image === 'string' ? x.image : undefined,
        category: typeof x.category === 'string' ? x.category : undefined,
      }))
      .filter((x) => x.id && x.name && Number.isFinite(x.price) && x.price >= 0 && x.quantity >= 1)
  } catch {
    return []
  }
}

if (typeof window !== 'undefined') {
  cartItems.value = safeParseCart(window.localStorage.getItem(CART_STORAGE_KEY))

  watch(
    cartItems,
    (items) => {
      try {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch {
        // ignore storage failures (private mode / quota)
      }
    },
    { deep: true },
  )
}

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
  const id = String(product?.id ?? '')
  if (!id) return

  const name = String(product?.name ?? '').trim()
  const price = Number(product?.price ?? 0)
  const unit = String(product?.unit ?? 'pcs').trim() || 'pcs'
  const image = typeof product?.image === 'string' ? product.image : undefined
  const category = typeof product?.category === 'string' ? product.category : undefined

  const existingItem = cartItems.value.find(item => item.id === id)
  
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cartItems.value.push({
      id,
      name: name || 'Item',
      price: Number.isFinite(price) && price >= 0 ? price : 0,
      unit,
      quantity: 1,
      image,
      category
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

const generateWhatsAppMessage = async () => {
  if (cartItems.value.length === 0) return ''
  
  let message = '🛒 *ORDER DETAILS*\n\n'
  
  // Add price disclaimer
  message += getPriceDisclaimer() + '\n\n'
  
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
      
      // Calculate delivery if address is available
      try {
        const delivery = await calculateDelivery(user.value.address)
        message += `\n${getDeliveryTimeMessage(delivery.distance)}\n`
        message += `Distance: ${delivery.distance.toFixed(1)} km\n`
      } catch (error) {
        console.error('Delivery calculation failed:', error)
      }
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
  const serviceFee = calculateServiceFee(subtotal)
  
  // Default delivery charge (will be updated if address is available)
  let deliveryCharge = 40
  let deliveryTimeMessage = ''
  
  if (user.value?.address) {
    try {
      const delivery = await calculateDelivery(user.value.address)
      deliveryCharge = delivery.deliveryCharge
      deliveryTimeMessage = getDeliveryTimeMessage(delivery.distance)
    } catch (error) {
      console.error('Delivery calculation failed:', error)
      deliveryCharge = 40 // fallback
    }
  }
  
  const total = calculateOrderTotal(subtotal, deliveryCharge, serviceFee)
  
  message += '*Order Summary:*\n'
  message += `Subtotal: KSH ${subtotal}\n`
  message += `Service Fee (13%): KSH ${serviceFee}\n`
  message += `Delivery Charge: KSH ${deliveryCharge}\n`
  message += `Total: KSH ${total}\n\n`
  
  if (deliveryTimeMessage) {
    message += `${deliveryTimeMessage}\n\n`
  }
  
  message += '*Payment Method:* WhatsApp Pay\n\n'
  message += '*Service Information:*\n'
  message += 'Delivery service includes professional rider handling\n\n'
  
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
