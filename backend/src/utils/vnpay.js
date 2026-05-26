const crypto = require('crypto');

// Load configuration from environment variables (fallback to sandbox defaults)
const VNP_TMN_CODE = process.env.VNP_TMN_CODE || 'B6MXNQPO';
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || 'BWPI0J4GAHSGY5832X5P8B3YVTD7ZPP4';
const VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
// Return URL: VNPAY redirects user back here after payment
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result`;

/**
 * Format a Date to yyyyMMddHHmmss in Vietnam timezone (UTC+7)
 */
function formatVnDate(date) {
  const offset = 7 * 60; // UTC+7 in minutes
  const localDate = new Date(date.getTime() + offset * 60 * 1000);
  return localDate.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
}

/**
 * Generate a VNPAY payment URL.
 * @param {string} txnRef   - Unique transaction reference (max 20 chars, alphanumeric).
 * @param {number} amount   - Total amount in VND (plain integer, e.g. 1200000).
 * @param {string} clientIp - IPv4 of the client.
 * @returns {string} Redirect URL to VNPAY sandbox.
 */
function generateVnpayUrl(txnRef, amount, clientIp) {
  const now = new Date();

  // Amount: VNPAY expects VND * 100 (no decimals)
  const vnpAmount = Math.round(Math.max(0, amount)) * 100;

  // Clean IP – strip IPv6 prefix (::ffff:), fallback to 127.0.0.1
  let cleanIp = clientIp || '127.0.0.1';
  if (cleanIp.startsWith('::ffff:')) {
    cleanIp = cleanIp.replace('::ffff:', '');
  }
  if (cleanIp === '::1') {
    cleanIp = '127.0.0.1';
  }

  // All required VNPAY parameters (no Unicode values in OrderInfo)
  const params = {
    vnp_Version:    '2.1.0',
    vnp_Command:    'pay',
    vnp_TmnCode:    VNP_TMN_CODE,
    vnp_Amount:     String(vnpAmount),
    vnp_CurrCode:   'VND',
    vnp_TxnRef:     String(txnRef).substring(0, 20),
    vnp_OrderInfo:  `Thanh toan don hang ${txnRef}`.substring(0, 255),
    vnp_OrderType:  'other',
    vnp_Locale:     'vn',
    vnp_ReturnUrl:  VNP_RETURN_URL,
    vnp_IpAddr:     cleanIp,
    vnp_CreateDate: formatVnDate(now),
    vnp_ExpireDate: formatVnDate(new Date(now.getTime() + 15 * 60 * 1000)),
  };

  // Sort parameters alphabetically by key and URL encode
  let sorted = {};
  let str = [];
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = encodeURIComponent(params[str[i]]).replace(/%20/g, "+");
  }

  const qs = require('qs');
  const signData = qs.stringify(sorted, { encode: false });

  // Compute HMAC-SHA512 signature (VNPAY v2.1.0 uses SHA512)
  const secureHash = crypto
    .createHmac('sha512', VNP_HASH_SECRET)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

  // Build query string (URL-encoded values)
  const paymentUrl = `${VNP_URL}?${signData}&vnp_SecureHash=${secureHash}`;

  console.log('[VNPAY] Params:', params);
  console.log('[VNPAY] HashData:', signData);
  console.log('[VNPAY] URL:', paymentUrl);

  return paymentUrl;
}

module.exports = { generateVnpayUrl };
