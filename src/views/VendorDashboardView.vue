<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeTab = ref('products')
const showAddProductModal = ref(false)
const showEditProductModal = ref(false)
const selectedProduct = ref(null)

// Sample data - in real app this would come from API
const vendorInfo = ref({
  businessName: 'Fresh Groceries Nairobi',
  businessType: 'Grocery Store',
  email: 'fresh@nairobi.com',
  phone: '0712345678',
  location: 'Westlands, Nairobi',
  status: 'verified',
  totalOrders: 156,
  totalRevenue: 245680,
  commissionRate: 15
})

const products = ref([
  {
    id: 1,
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    price: 120,
    stock: 50,
    description: 'Fresh locally grown tomatoes',
    image: '/api/placeholder/200/200',
    status: 'active',
    orders: 23
  },
  {
    id: 2,
    name: 'White Bread',
    category: 'Bakery',
    price: 55,
    stock: 30,
    description: 'Soft white bread, daily fresh',
    image: '/api/placeholder/200/200',
    status: 'active',
    orders: 45
  },
  {
    id: 3,
    name: 'Cooking Oil 5L',
    category: 'Cooking Essentials',
    price: 850,
    stock: 15,
    description: 'Pure cooking oil, 5 liters',
    image: '/api/placeholder/200/200',
    status: 'active',
    orders: 12
  }
])

const orders = ref([
  {
    id: 'ORD-001',
    customer: 'John Kamau',
    items: 3,
    total: 1250,
    status: 'pending',
    time: '2 hours ago',
    deliveryAddress: 'Kilimani, Nairobi'
  },
  {
    id: 'ORD-002',
    customer: 'Mary Wanjiku',
    items: 5,
    total: 2350,
    status: 'preparing',
    time: '4 hours ago',
    deliveryAddress: 'Lavington, Nairobi'
  },
  {
    id: 'ORD-003',
    customer: 'David Ochieng',
    items: 2,
    total: 875,
    status: 'delivered',
    time: '1 day ago',
    deliveryAddress: 'Kileleshwa, Nairobi'
  }
])

const newProduct = ref({
  name: '',
  category: '',
  price: 0,
  stock: 0,
  description: '',
  image: ''
})

const categories = [
  'Vegetables',
  'Fruits',
  'Bakery',
  'Dairy',
  'Meat',
  'Cooking Essentials',
  'Beverages',
  'Snacks',
  'Cleaning Supplies',
  'Personal Care',
  'Other'
]

const activeProducts = computed(() => 
  products.value.filter(p => p.status === 'active')
)

const pendingOrders = computed(() =>
  orders.value.filter(o => o.status === 'pending' || o.status === 'preparing')
)

const todayRevenue = computed(() => {
  // In real app, calculate from today's orders
  return 12500
})

function openAddProductModal() {
  showAddProductModal.value = true
}

function openEditProductModal(product) {
  selectedProduct.value = product
  newProduct.value = { ...product }
  showEditProductModal.value = true
}

function closeModals() {
  showAddProductModal.value = false
  showEditProductModal.value = false
  selectedProduct.value = null
  newProduct.value = {
    name: '',
    category: '',
    price: 0,
    stock: 0,
    description: '',
    image: ''
  }
}

function addProduct() {
  const product = {
    id: Date.now(),
    ...newProduct.value,
    status: 'active',
    orders: 0,
    image: newProduct.value.image || '/api/placeholder/200/200'
  }
  products.value.push(product)
  closeModals()
}

function updateProduct() {
  const index = products.value.findIndex(p => p.id === selectedProduct.value.id)
  if (index !== -1) {
    products.value[index] = { ...products.value[index], ...newProduct.value }
  }
  closeModals()
}

function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    products.value = products.value.filter(p => p.id !== productId)
  }
}

function toggleProductStatus(productId) {
  const product = products.value.find(p => p.id === productId)
  if (product) {
    product.status = product.status === 'active' ? 'inactive' : 'active'
  }
}

function updateOrderStatus(orderId, newStatus) {
  const order = orders.value.find(o => o.id === orderId)
  if (order) {
    order.status = newStatus
  }
}

function logout() {
  // Clear vendor session
  router.push('/')
}
</script>

<template>
  <div class="vendor-dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="vendor-info">
          <h1>{{ vendorInfo.businessName }}</h1>
          <p class="vendor-meta">{{ vendorInfo.businessType }} • {{ vendorInfo.location }}</p>
        </div>
        <div class="header-actions">
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <h3>{{ activeProducts.length }}</h3>
          <p>Active Products</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-content">
          <h3>{{ pendingOrders.length }}</h3>
          <p>Pending Orders</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Ksh {{ todayRevenue.toLocaleString() }}</h3>
          <p>Today's Revenue</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>{{ vendorInfo.totalOrders }}</h3>
          <p>Total Orders</p>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="dashboard-tabs">
      <button 
        @click="activeTab = 'products'" 
        :class="{ active: activeTab === 'products' }"
        class="tab-btn"
      >
        Products
      </button>
      <button 
        @click="activeTab = 'orders'" 
        :class="{ active: activeTab === 'orders' }"
        class="tab-btn"
      >
        Orders
      </button>
      <button 
        @click="activeTab = 'analytics'" 
        :class="{ active: activeTab === 'analytics' }"
        class="tab-btn"
      >
        Analytics
      </button>
      <button 
        @click="activeTab = 'settings'" 
        :class="{ active: activeTab === 'settings' }"
        class="tab-btn"
      >
        Settings
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Products Tab -->
      <div v-if="activeTab === 'products'" class="products-section">
        <div class="section-header">
          <h2>My Products</h2>
          <button @click="openAddProductModal" class="add-btn">+ Add Product</button>
        </div>

        <div class="products-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <span :class="['status-badge', product.status]">
                {{ product.status }}
              </span>
            </div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p class="product-category">{{ product.category }}</p>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-meta">
                <span class="price">Ksh {{ product.price }}</span>
                <span class="stock">{{ product.stock }} in stock</span>
              </div>
              <div class="product-stats">
                <span>📦 {{ product.orders }} orders</span>
              </div>
            </div>
            <div class="product-actions">
              <button @click="openEditProductModal(product)" class="edit-btn">Edit</button>
              <button @click="toggleProductStatus(product.id)" class="status-btn">
                {{ product.status === 'active' ? 'Deactivate' : 'Activate' }}
              </button>
              <button @click="deleteProduct(product.id)" class="delete-btn">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Tab -->
      <div v-if="activeTab === 'orders'" class="orders-section">
        <div class="section-header">
          <h2>Recent Orders</h2>
        </div>

        <div class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-header">
              <div class="order-info">
                <h3>{{ order.id }}</h3>
                <p>Customer: {{ order.customer }}</p>
                <p>{{ order.items }} items • Ksh {{ order.total }}</p>
              </div>
              <div class="order-status">
                <span :class="['status-badge', order.status]">{{ order.status }}</span>
                <p class="order-time">{{ order.time }}</p>
              </div>
            </div>
            <div class="order-details">
              <p>📍 {{ order.deliveryAddress }}</p>
            </div>
            <div class="order-actions">
              <button 
                v-if="order.status === 'pending'" 
                @click="updateOrderStatus(order.id, 'preparing')"
                class="action-btn"
              >
                Accept Order
              </button>
              <button 
                v-if="order.status === 'preparing'" 
                @click="updateOrderStatus(order.id, 'ready')"
                class="action-btn"
              >
                Mark Ready
              </button>
              <button 
                v-if="order.status === 'ready'" 
                @click="updateOrderStatus(order.id, 'delivered')"
                class="action-btn"
              >
                Mark Delivered
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Tab -->
      <div v-if="activeTab === 'analytics'" class="analytics-section">
        <div class="section-header">
          <h2>Business Analytics</h2>
        </div>

        <div class="analytics-grid">
          <div class="analytics-card">
            <h3>Revenue Overview</h3>
            <div class="revenue-stats">
              <div class="stat-item">
                <span class="label">Today</span>
                <span class="value">Ksh {{ todayRevenue.toLocaleString() }}</span>
              </div>
              <div class="stat-item">
                <span class="label">This Week</span>
                <span class="value">Ksh 87,500</span>
              </div>
              <div class="stat-item">
                <span class="label">This Month</span>
                <span class="value">Ksh {{ vendorInfo.totalRevenue.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <div class="analytics-card">
            <h3>Top Products</h3>
            <div class="top-products">
              <div v-for="product in products.slice(0, 5)" :key="product.id" class="product-rank">
                <span>{{ product.name }}</span>
                <span>{{ product.orders }} orders</span>
              </div>
            </div>
          </div>

          <div class="analytics-card">
            <h3>Commission Summary</h3>
            <div class="commission-info">
              <p><strong>Commission Rate:</strong> {{ vendorInfo.commissionRate }}%</p>
              <p><strong>Total Commission Paid:</strong> Ksh 36,852</p>
              <p><strong>Net Earnings:</strong> Ksh {{ (vendorInfo.totalRevenue * 0.85).toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="settings-section">
        <div class="section-header">
          <h2>Business Settings</h2>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <label>Business Name</label>
            <input type="text" :value="vendorInfo.businessName" readonly />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" :value="vendorInfo.email" readonly />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" :value="vendorInfo.phone" readonly />
          </div>
          <div class="form-group">
            <label>Location</label>
            <input type="text" :value="vendorInfo.location" readonly />
          </div>
          <div class="form-group">
            <label>Business Type</label>
            <input type="text" :value="vendorInfo.businessType" readonly />
          </div>
          
          <div class="account-status">
            <h3>Account Status</h3>
            <span class="status-badge verified">Verified ✅</span>
            <p>Your account is verified and active. You can receive orders and manage your products.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddProductModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Add New Product</h2>
          <button @click="closeModals" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Product Name *</label>
            <input v-model="newProduct.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Category *</label>
            <select v-model="newProduct.category" required>
              <option value="">Select category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Price (Ksh) *</label>
            <input v-model.number="newProduct.price" type="number" required />
          </div>
          <div class="form-group">
            <label>Stock Quantity *</label>
            <input v-model.number="newProduct.stock" type="number" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newProduct.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Image URL</label>
            <input v-model="newProduct.image" type="url" placeholder="Optional" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="cancel-btn">Cancel</button>
          <button @click="addProduct" class="submit-btn">Add Product</button>
        </div>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div v-if="showEditProductModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Edit Product</h2>
          <button @click="closeModals" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Product Name *</label>
            <input v-model="newProduct.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Category *</label>
            <select v-model="newProduct.category" required>
              <option value="">Select category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Price (Ksh) *</label>
            <input v-model.number="newProduct.price" type="number" required />
          </div>
          <div class="form-group">
            <label>Stock Quantity *</label>
            <input v-model.number="newProduct.stock" type="number" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newProduct.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Image URL</label>
            <input v-model="newProduct.image" type="url" placeholder="Optional" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="cancel-btn">Cancel</button>
          <button @click="updateProduct" class="submit-btn">Update Product</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vendor-dashboard {
  min-height: 100vh;
  background: var(--color-surface);
  padding: 1.5rem;
}

.dashboard-header {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-card);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vendor-info h1 {
  margin: 0 0 0.5rem;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-ink);
}

.vendor-meta {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: 1rem;
}

.logout-btn {
  background: var(--color-red);
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-ink);
}

.stat-content p {
  margin: 0;
  color: var(--color-ink-muted);
}

.dashboard-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--color-border);
  overflow-x: auto;
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: var(--color-ink-muted);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s ease;
}

.tab-btn.active {
  color: var(--color-orange);
  border-bottom-color: var(--color-orange);
}

.tab-btn:hover {
  color: var(--color-ink);
}

.tab-content {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-card);
  min-height: 500px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-ink);
}

.add-btn {
  background: var(--color-orange);
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.product-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.product-image {
  position: relative;
  height: 200px;
  background: var(--color-surface);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--color-mint);
  color: white;
}

.status-badge.inactive {
  background: var(--color-red);
}

.product-info {
  padding: 1rem;
}

.product-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-ink);
}

.product-category {
  margin: 0 0 0.5rem;
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}

.product-description {
  margin: 0 0 1rem;
  color: var(--color-ink);
  font-size: 0.9rem;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.price {
  font-weight: 700;
  color: var(--color-orange);
}

.stock {
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}

.product-stats {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--color-ink-muted);
}

.product-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

.edit-btn, .status-btn, .delete-btn {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  background: #fff;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.edit-btn:hover {
  background: var(--color-mint-soft);
  border-color: var(--color-mint);
}

.status-btn:hover {
  background: var(--color-orange-soft);
  border-color: var(--color-orange);
}

.delete-btn:hover {
  background: var(--color-red-soft);
  border-color: var(--color-red);
  color: var(--color-red);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-ink);
}

.order-info p {
  margin: 0.25rem 0;
  color: var(--color-ink-muted);
}

.order-status {
  text-align: right;
}

.status-badge.pending {
  background: #fbbf24;
  color: #78350f;
}

.status-badge.preparing {
  background: #60a5fa;
  color: #1e3a8a;
}

.status-badge.ready {
  background: #a78bfa;
  color: #4c1d95;
}

.status-badge.delivered {
  background: var(--color-mint);
  color: white;
}

.order-time {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: var(--color-ink-muted);
}

.order-details {
  margin-bottom: 1rem;
  color: var(--color-ink);
}

.order-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: var(--color-orange);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.analytics-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.analytics-card h3 {
  margin: 0 0 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-ink);
}

.revenue-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--color-surface);
  border-radius: var(--radius-sm);
}

.stat-item .label {
  color: var(--color-ink-muted);
}

.stat-item .value {
  font-weight: 700;
  color: var(--color-ink);
}

.top-products {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-rank {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.commission-info p {
  margin: 0.75rem 0;
  color: var(--color-ink);
}

.settings-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-ink);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
}

.account-status {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--color-mint-soft);
  border-radius: var(--radius-md);
}

.account-status h3 {
  margin: 0 0 1rem;
  color: #166534;
}

.account-status p {
  margin: 0.5rem 0;
  color: #166534;
}

.status-badge.verified {
  background: var(--color-mint);
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-ink);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-ink-muted);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.cancel-btn {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  background: #fff;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}

.submit-btn {
  flex: 1;
  padding: 0.75rem;
  background: var(--color-orange);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 768px) {
  .vendor-dashboard {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .order-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
