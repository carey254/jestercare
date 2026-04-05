export type CategoryIcon = 'cart' | 'store' | 'wine' | 'sparkle' | 'box' | 'cross'

export interface CategoryDef {
  slug: string
  title: string
  bubble: string
  icon: CategoryIcon
}

export const categories: CategoryDef[] = [
  { slug: 'groceries', title: 'Groceries', bubble: '#e8f5e9', icon: 'cart' },
  { slug: 'supermarket', title: 'Supermarket', bubble: '#fff3e0', icon: 'store' },
  { slug: 'drinks', title: 'Drinks', bubble: '#f3e5f5', icon: 'wine' },
  { slug: 'cleaning', title: 'Cleaning', bubble: '#e3f2fd', icon: 'sparkle' },
  { slug: 'packages', title: 'Package delivery', bubble: '#fce4ec', icon: 'box' },
  { slug: 'pharmacy-beauty', title: 'Pharmacy & beauty', bubble: '#e8f5e9', icon: 'cross' },
]
