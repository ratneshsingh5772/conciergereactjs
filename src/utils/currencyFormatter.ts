export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error(`Error formatting currency: ${currencyCode}`, error);
    // Fallback to USD if the currency code is invalid
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
};

export const getCurrencySymbol = (currencyCode: string = 'USD'): string => {
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).formatToParts(0);
    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart ? symbolPart.value : '$';
  } catch {
    return '$';
  }
};

export const formatMessageContent = (content: string, currencyCode: string = 'USD'): string => {
  if (currencyCode === 'USD') return content;
  
  const symbol = getCurrencySymbol(currencyCode);
  // Matches $ followed by numbers, optionally negative, allowing for commas and decimals
  return content.replaceAll(/\$(-?\d+(?:,\d{3})*(?:\.\d+)?)/g, `${symbol}$1`);
};
