/**
 * Money utility functions for VND (Vietnamese Dong) handling
 * 
 * VND Policy:
 * - All monetary values are represented as INTEGER dong (smallest unit)
 * - No fractional currency (no cents/xu equivalent used in practice)
 * - All calculations use integer arithmetic
 * - Database stores integers (or numeric with no decimal places)
 */

/**
 * Convert a value to VND integer
 * @param {number|string} value - The value to convert
 * @returns {number} Integer dong amount
 */
function toVND(value) {
  return Math.round(Number(value));
}

/**
 * Format VND amount for display
 * @param {number} value - Integer dong amount
 * @returns {string} Formatted string like "12.345₫" or "12.345 VND"
 */
function formatVND(value) {
  const intValue = toVND(value);
  // Format with thousand separators (dot for VN locale)
  return intValue.toLocaleString('vi-VN') + '₫';
}

/**
 * Format VND amount for display (alternative with VND label)
 * @param {number} value - Integer dong amount
 * @returns {string} Formatted string like "12.345 VND"
 */
function formatVNDWithLabel(value) {
  const intValue = toVND(value);
  return intValue.toLocaleString('vi-VN') + ' VND';
}

module.exports = {
  toVND,
  formatVND,
  formatVNDWithLabel
};
