// src/utils/formatPrice.js

/**
 * Formats a price to two decimal places.
 * If the input is not a valid number, returns 'N/A'.
 *
 * @param {number|string} price - The price to format.
 * @returns {string} - The formatted price.
 */
export const formatPrice = (price) => {
    const num = parseFloat(price);
    return !isNaN(num) ? num.toFixed(2) : 'N/A';
};
