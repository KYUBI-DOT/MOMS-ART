module.exports = {
  multiply: (a, b) => (a * b).toFixed(2),
  add: (a, b) => (parseFloat(a) + parseFloat(b)).toFixed(2),
  subtract: (a, b) => (parseFloat(a) - parseFloat(b)).toFixed(2),
  divide: (a, b) => (parseFloat(a) / parseFloat(b)).toFixed(2),
  eq: (a, b) => a == b,
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  increment: value => value + 1,
  decrement: value => value - 1,
  unless: (value, options) => !value ? options.fn(this) : options.inverse(this),
  ifEquals: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  },
  range: function (start, end) {
    let range = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  },
  calculateWeekly: price => (price / 10).toFixed(2),
  calculateAfterpay: price => (price / 4).toFixed(2),
  calculateTotal: cart => {
    let total = 0;
    cart.forEach(item => total += item.product_price * item.quantity);
    return total.toFixed(2);
  },
  calculateFinalTotal: function (price) {
  return price < 150 ? (price + 10).toFixed(2) : price.toFixed(2);
},
afterpayAmount: function (price) {
  return (price / 4).toFixed(2);
},
calculateFinalTotal: function (price) {
  return price < 150 ? (price + 10).toFixed(2) : price.toFixed(2);
},
calculateFinalTotal: function (price) {
  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice)) return '0.00'; // fallback to avoid crash
  const total = numericPrice < 150 ? numericPrice + 10 : numericPrice;
  return total.toFixed(2);
},



};
