<template>
  <section id="together" class="together" aria-labelledby="together-title">
    <h2 id="together-title" class="together__heading">Let’s do it together</h2>
    <div class="together__grid">
      <article class="card">
        <h3 class="card__title">Become a rider</h3>
        <p class="card__text">Flexible hours, competitive earnings, and Nairobi routes that fit your day.</p>
        <a class="card__link" href="#partner">Register interest</a>
      </article>
      <article class="card">
        <h3 class="card__title">Become a partner</h3>
        <p class="card__text">Reach more customers with our tech and riders — groceries, pharmacy, and more.</p>
        <a class="card__link" href="#partner">Partner with us</a>
      </article>
      <article class="card">
        <h3 class="card__title">Careers</h3>
        <p class="card__text">Ambitious, humble, and team-oriented? We’d love to hear from you.</p>
        <a class="card__link" href="mailto:careers@jesterspeed.co.ke">View openings</a>
      </article>
    </div>
  </section>
</template>

<style scoped>
.together {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 3rem;
}

.together__heading {
  margin: 0 0 1.5rem;
  font-size: clamp(1.35rem, 3vw, 1.65rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  text-align: center;
}

.together__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .together__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.35rem 1.25rem;
  box-shadow: var(--shadow-card);
}

.card__title {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 800;
}

.card__text {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-ink-muted);
}

.card__link {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-orange);
}

.card__link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
