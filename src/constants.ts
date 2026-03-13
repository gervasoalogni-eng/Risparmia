import { ShoppingCart, Utensils, Repeat, Car, Activity, ShoppingBag, MoreHorizontal } from 'lucide-react';

export const CATEGORIES = [
  { id: 'supermercato', name: 'Supermercato', color: '#FFD60A', icon: ShoppingCart, iconName: 'ShoppingCart' },
  { id: 'ristoranti', name: 'Ristoranti', color: '#FF9F0A', icon: Utensils, iconName: 'Utensils' },
  { id: 'ricorrente', name: 'Ricorrente', color: '#BF5AF2', icon: Repeat, iconName: 'Repeat' },
  { id: 'trasporti', name: 'Trasporti', color: '#0A84FF', icon: Car, iconName: 'Car' },
  { id: 'fitness', name: 'Fitness', color: '#FF453A', icon: Activity, iconName: 'Activity' },
  { id: 'shopping', name: 'Shopping', color: '#FF375F', icon: ShoppingBag, iconName: 'ShoppingBag' },
  { id: 'altro', name: 'Altro', color: '#8E8E93', icon: MoreHorizontal, iconName: 'MoreHorizontal' },
];

export const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};
