/**
 * Static category images live in: public/images/categories/
 * They are served at /images/categories/<filename> (Vite public root).
 *
 * Suggested filenames (match slug from categories.ts):
 *   groceries.jpg | supermarket.jpg | alcohol.jpg | cleaning.jpg
 *   packages.jpg  | pharmacy-beauty.jpg
 *
 * Use .webp or .png instead by changing `defaultExt` or passing ext.
 */
export const categoryImagePublicPath = (
  slug: string,
  ext: 'jpg' | 'jpeg' | 'webp' | 'png' = 'jpg',
) => `/images/categories/${slug}.${ext}`
