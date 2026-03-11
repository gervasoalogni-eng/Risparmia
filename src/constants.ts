import { ShoppingCart, Utensils, Repeat, Car, Activity, ShoppingBag, MoreHorizontal } from 'lucide-react';

export const CATEGORIES = [
  { id: 'supermercato', name: 'Supermercato', color: '#FFD60A', icon: ShoppingCart },
  { id: 'ristoranti', name: 'Ristoranti', color: '#FF9F0A', icon: Utensils },
  { id: 'abbonamenti', name: 'Abbonamenti', color: '#BF5AF2', icon: Repeat },
  { id: 'trasporti', name: 'Trasporti', color: '#0A84FF', icon: Car },
  { id: 'fitness', name: 'Fitness', color: '#FF453A', icon: Activity },
  { id: 'shopping', name: 'Shopping', color: '#FF375F', icon: ShoppingBag },
  { id: 'altro', name: 'Altro', color: '#8E8E93', icon: MoreHorizontal },
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};
