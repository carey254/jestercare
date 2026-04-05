<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { user, isAuthenticated, signOut } from '../composables/useAuth'
import SignInModal from './SignInModal.vue'
import SignUpModal from './SignUpModal.vue'

const menuOpen = ref(false)
const showSignInModal = ref(false)
const showSignUpModal = ref(false)
const showUserDropdown = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function toggleUserDropdown() {
  showUserDropdown.value = !showUserDropdown.value
}

function closeUserDropdown() {
  showUserDropdown.value = false
}

// Handle clicks outside dropdowns
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu')) {
    showUserDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function openSignIn() {
  showSignInModal.value = true
  showSignUpModal.value = false
}

function openSignUp() {
  showSignUpModal.value = true
  showSignInModal.value = false
}

function closeModals() {
  showSignInModal.value = false
  showSignUpModal.value = false
}

function handleSignOut() {
  signOut()
  showUserDropdown.value = false
  menuOpen.value = false
}

function switchToSignUp() {
  showSignInModal.value = false
  showSignUpModal.value = true
}

function switchToSignIn() {
  showSignUpModal.value = false
  showSignInModal.value = true
}
</script>

<template>
  <div class="header">
    <div class="header__inner">
      <RouterLink to="/" class="brand" @click="menuOpen = false">
        <img src="/images/logo.png" alt="Jester Speed Delivery" class="brand__logo" />
      </RouterLink>

      <button
        type="button"
        class="nav-toggle"
        :aria-expanded="menuOpen"
        aria-controls="site-nav"
        @click="toggleMenu"
      >
        <span class="nav-toggle__bar" />
        <span class="nav-toggle__bar" />
        <span class="nav-toggle__bar" />
        <span class="visually-hidden">Menu</span>
      </button>

      <nav id="site-nav" class="nav" :class="{ 'nav--open': menuOpen }">
        <a href="#delivery-area" class="nav__link" @click="menuOpen = false">Delivery</a>
        <a href="#categories" class="nav__link" @click="menuOpen = false">Services</a>
        <a href="#together" class="nav__link" @click="menuOpen = false">Work with us</a>
        <a href="#partner" class="nav__link" @click="menuOpen = false">Partners</a>
      </nav>

      <div class="header__actions">
        <div v-if="isAuthenticated && user" class="user-menu">
          <div class="user-dropdown" @click="toggleUserDropdown">
            <span class="user-name">Hi, {{ user.name }}</span>
            <span class="dropdown-arrow">▼</span>
          </div>
          <div v-if="showUserDropdown" class="dropdown-menu">
            <button @click="closeUserDropdown" class="dropdown-item">
              <span class="dropdown-icon">👤</span>
              My Profile
            </button>
            <button @click="closeUserDropdown" class="dropdown-item">
              <span class="dropdown-icon">🔐</span>
              Change Password
            </button>
            <button @click="closeUserDropdown" class="dropdown-item">
              <span class="dropdown-icon">📦</span>
              My Orders
            </button>
            <button @click="closeUserDropdown" class="dropdown-item">
              <span class="dropdown-icon">⚙️</span>
              Settings
            </button>
            <div class="dropdown-divider"></div>
            <button @click="handleSignOut" class="dropdown-item sign-out">
              <span class="dropdown-icon">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
        <div v-else class="auth-buttons">
          <button @click="openSignIn" class="login">Sign In</button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Authentication Modals -->
  <SignInModal 
    v-if="showSignInModal" 
    @close="closeModals" 
    @switch-to-sign-up="switchToSignUp"
  />
  <SignUpModal 
    v-if="showSignUpModal" 
    @close="closeModals" 
    @switch-to-sign-in="switchToSignIn"
  />
</template>

<style scoped>
.header {
  background: var(--color-surface);
}

.header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas: 'brand nav actions';
  align-items: center;
  gap: 1rem 1.5rem;
  min-height: 56px;
}

.brand {
  grid-area: brand;
  display: flex;
  align-items: center;
}

.brand__logo {
  height: 80px;
  width: auto;
  object-fit: contain;
}

.nav-toggle {
  display: none;
  grid-area: toggle;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  padding: 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  justify-self: end;
}

.nav-toggle__bar {
  height: 2px;
  width: 100%;
  background: var(--color-ink);
  border-radius: 1px;
}

.nav {
  grid-area: nav;
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.nav__link {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-ink-muted);
}

.nav__link:hover {
  color: var(--color-ink);
}

.header__actions {
  grid-area: actions;
  justify-self: end;
}

.login {
  border: none;
  background: none;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-orange);
  padding: 0.4rem 0.5rem;
}

.login:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.sign-up {
  background: var(--color-orange);
  color: white;
  border: none;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sign-up:hover {
  background: var(--color-orange-hover);
  text-decoration: none;
}

.user-menu {
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-md);
  transition: background-color 0.2s ease;
}

.user-dropdown:hover {
  background: var(--color-surface);
}

.user-name {
  font-weight: 600;
  color: var(--color-ink);
  font-size: 0.9rem;
}

.dropdown-arrow {
  font-size: 0.7rem;
  color: var(--color-ink-muted);
  transition: transform 0.2s ease;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
  margin-top: 0.5rem;
}

.dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--color-ink);
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: var(--color-surface);
}

.dropdown-item.sign-out {
  color: #dc2626;
}

.dropdown-item.sign-out:hover {
  background: #fef2f2;
}

.dropdown-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .header__inner {
    grid-template-columns: 1fr auto auto;
    grid-template-areas:
      'brand toggle actions'
      'nav nav nav';
  }

  .nav-toggle {
    display: flex;
  }

  .nav {
    flex-direction: column;
    align-items: stretch;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
    transition: max-height 0.3s ease, opacity 0.2s ease, padding 0.2s ease;
    padding-top: 0;
    border-top: 1px solid transparent;
  }

  .nav--open {
    max-height: 200px;
    opacity: 1;
    pointer-events: auto;
    padding-top: 0.75rem;
    margin-top: 0.25rem;
    border-top-color: var(--color-border);
  }

  .auth-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-dropdown {
    padding: 0.5rem;
  }

  .dropdown-menu {
    right: -1rem;
    min-width: 180px;
  }

  .user-name {
    font-size: 0.8rem;
  }
}
</style>
