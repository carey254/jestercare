<template>
  <section class="delivery-showcase" aria-labelledby="delivery-heading">
    <h2 id="delivery-heading" class="delivery-showcase__heading">Place Your Order</h2>
    <p class="delivery-showcase__subtext">We deliver right to your doorstep! Fast, reliable service across Nairobi.</p>
    
    <div class="delivery-showcase__images">
      <div class="delivery-showcase__image-wrapper">
        <img 
          src="/images/delivery1.jpeg" 
          alt="Jester delivery in action" 
          class="delivery-showcase__image"
          loading="lazy"
        />
      </div>
      <div class="delivery-showcase__image-wrapper">
        <img 
          src="/images/jester.jpeg" 
          alt="Jester delivery service" 
          class="delivery-showcase__image"
          loading="lazy"
        />
      </div>
    </div>
    
    <div class="delivery-showcase__cta">
      <a href="https://wa.me/254703735924?text=Hi%20Jester%20%E2%80%94%20I'd%20like%20to%20place%20an%20order" 
         class="delivery-showcase__btn primary" 
         target="_blank" 
         rel="noopener noreferrer">
        Order Now
      </a>
    </div>
  </section>
</template>

<style scoped>
.delivery-showcase {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.25rem;
  text-align: center;
}

.delivery-showcase__heading {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-ink);
}

.delivery-showcase__subtext {
  margin: 0 0 2.5rem;
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-ink-muted);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.delivery-showcase__images {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

@media (min-width: 768px) {
  .delivery-showcase__images {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}

.delivery-showcase__image-wrapper {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  aspect-ratio: 16/9;
}

.delivery-showcase__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.delivery-showcase__image-wrapper:hover .delivery-showcase__image {
  transform: scale(1.05);
}

.delivery-showcase__cta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

@media (min-width: 640px) {
  .delivery-showcase__cta {
    flex-direction: row;
    justify-content: center;
  }
}

.delivery-showcase__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
  min-width: 160px;
}

.delivery-showcase__btn.primary {
  background: var(--color-orange);
  color: #fff;
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
}

.delivery-showcase__btn.primary:hover {
  background: var(--color-orange-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.delivery-showcase__btn.secondary {
  background: var(--color-surface);
  color: var(--color-ink);
  border: 2px solid var(--color-border);
}

.delivery-showcase__btn.secondary:hover {
  border-color: var(--color-orange);
  color: var(--color-orange);
  transform: translateY(-2px);
}
</style>
