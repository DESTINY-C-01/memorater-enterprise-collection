import { Currency, CurrencyCode } from '@/types';

export const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate_to_base: 1, is_active: true },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rate_to_base: 0.011, is_active: true },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc', rate_to_base: 0.85, is_active: true },
];

export function formatMoney(amount: number, currency: Currency): string {
  const rounded = Math.round(amount);
  return `${currency.symbol}${rounded.toLocaleString('en-US')}`;
}

export function getCurrency(code: CurrencyCode, list: Currency[] = DEFAULT_CURRENCIES): Currency {
  return list.find((c) => c.code === code) ?? list[0];
}

interface PricedProduct {
  price_ngn: number;
  price_ghs: number;
  price_xof: number;
  discount_percent?: number;
}

/** The raw, manually-set price for a currency, before any discount. */
export function getRawPrice(product: PricedProduct, code: CurrencyCode): number {
  switch (code) {
    case 'NGN':
      return product.price_ngn;
    case 'GHS':
      return product.price_ghs;
    case 'XOF':
      return product.price_xof;
    default:
      return product.price_ngn;
  }
}

/** The price after applying the product's discount percentage, if any. */
export function getDiscountedPrice(product: PricedProduct, code: CurrencyCode): number {
  const raw = getRawPrice(product, code);
  const discount = product.discount_percent ?? 0;
  return raw * (1 - discount / 100);
}
