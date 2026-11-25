const formatMoney = (amount, currency = 'MMK') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
};

export default formatMoney;