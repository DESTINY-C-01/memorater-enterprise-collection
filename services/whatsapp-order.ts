import { CartItem, CheckoutDetails, Currency } from '@/types';
import { formatMoney } from '@/lib/currency';

interface BuildOrderMessageArgs {
  orderNumber: string;
  customer: CheckoutDetails;
  items: CartItem[];
  currency: Currency;
}

export function buildWhatsAppOrderMessage({
  orderNumber,
  customer,
  items,
  currency,
}: BuildOrderMessageArgs) {
  const lines: string[] = [];

  lines.push(`*New Order — Memorater Enterprise Collection*`);
  lines.push(`Order #: ${orderNumber}`);
  lines.push('');
  lines.push(`*Customer:* ${customer.fullName}`);
  lines.push(`*Phone:* ${customer.phoneNumber}`);
  lines.push(`*Delivery Location:* ${customer.deliveryLocation}`);
  lines.push('');
  lines.push('*Items:*');

  let subtotal = 0;

  items.forEach((item, idx) => {
    const unitPrice = item.prices[currency.code];
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    const variant = [item.size ? `Size: ${item.size}` : null, item.color ? `Color: ${item.color}` : null]
      .filter(Boolean)
      .join(', ');

    lines.push(
      `${idx + 1}. ${item.name}${variant ? ` (${variant})` : ''} — Qty: ${item.quantity} × ${formatMoney(
        unitPrice,
        currency
      )} = ${formatMoney(lineTotal, currency)}`
    );
  });

  lines.push('');
  lines.push(`*Total: ${formatMoney(subtotal, currency)} (${currency.code})*`);

  if (customer.notes) {
    lines.push('');
    lines.push(`*Notes:* ${customer.notes}`);
  }

  lines.push('');
  lines.push('Please confirm availability and send payment instructions. Thank you!');

  const plainText = lines.join('\n');
  const encoded = encodeURIComponent(plainText);

  return { plainText, encoded, subtotal };
}

export function buildWhatsAppLink(phoneNumber: string, encodedMessage: string): string {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${digitsOnly}?text=${encodedMessage}`;
}
