const EMPTY_ADDRESS = {
  recipientName: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  street: '',
};

export function mapUserToAuth(user) {
  if (!user) return null;
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'Member',
    avatar: user.avatar || '',
    phone: user.phone || '',
    points: user.points ?? 0,
    memberRank: user.memberRank ?? 'Silver',
    shippingAddress: {
      ...EMPTY_ADDRESS,
      ...(user.shippingAddress || {}),
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function buildFormFromUser(user) {
  const addr = user?.shippingAddress || {};
  return {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    shippingAddress: {
      recipientName: addr.recipientName || user?.name || '',
      phone: addr.phone || user?.phone || '',
      province: addr.province || '',
      district: addr.district || '',
      ward: addr.ward || '',
      street: addr.street || '',
    },
    changePassword: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
}

export function formatShippingAddress(addr) {
  if (!addr) return '';
  const parts = [addr.street, addr.ward, addr.district, addr.province].filter(Boolean);
  return parts.join(', ') || '—';
}

const PHONE_RE = /^(0|\+84)[0-9]{8,10}$/;

export function validateProfileForm(form) {
  const errors = {};

  const name = form.name?.trim();
  if (!name) errors.name = 'Vui lòng nhập họ tên';
  else if (name.length < 2) errors.name = 'Họ tên ít nhất 2 ký tự';

  const email = form.email?.trim();
  if (!email) errors.email = 'Vui lòng nhập email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ';

  const phone = form.phone?.replace(/\s/g, '').trim();
  if (phone && !PHONE_RE.test(phone)) errors.phone = 'Số điện thoại không hợp lệ';

  const ship = form.shippingAddress || {};
  const hasAddress =
    ship.recipientName || ship.phone || ship.province || ship.district || ship.ward || ship.street;

  if (hasAddress) {
    if (!ship.recipientName?.trim()) errors['shippingAddress.recipientName'] = 'Nhập tên người nhận';
    const shipPhone = ship.phone?.replace(/\s/g, '').trim();
    if (!shipPhone) errors['shippingAddress.phone'] = 'Nhập SĐT nhận hàng';
    else if (!PHONE_RE.test(shipPhone)) errors['shippingAddress.phone'] = 'SĐT nhận hàng không hợp lệ';
    if (!ship.province?.trim()) errors['shippingAddress.province'] = 'Nhập tỉnh/thành phố';
    if (!ship.district?.trim()) errors['shippingAddress.district'] = 'Nhập quận/huyện';
    if (!ship.ward?.trim()) errors['shippingAddress.ward'] = 'Nhập phường/xã';
    if (!ship.street?.trim()) errors['shippingAddress.street'] = 'Nhập địa chỉ chi tiết';
  }

  if (form.changePassword) {
    if (!form.currentPassword) errors.currentPassword = 'Nhập mật khẩu hiện tại';
    if (!form.newPassword) errors.newPassword = 'Nhập mật khẩu mới';
    else if (form.newPassword.length < 6) errors.newPassword = 'Mật khẩu mới ít nhất 6 ký tự';
    if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu không khớp';
    }
  }

  return errors;
}
