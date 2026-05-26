const { userAvatarUrl } = require('./imageStorage');

const toPublicUser = (user) => {
  if (!user) return null;
  const doc = user.toObject ? user.toObject() : user;
  const id = doc._id?.toString() || doc.id;
  const hasAvatar =
    Boolean(doc.avatarImage?.contentType) ||
    Boolean(doc.avatar?.startsWith('/v1/api/media/users/'));

  return {
    id,
    _id: id,
    name: doc.name,
    email: doc.email,
    avatar: hasAvatar ? userAvatarUrl(id) : doc.avatar || '',
    phone: doc.phone || '',
    role: doc.role || 'Customer',
    points: doc.points ?? 0,
    memberRank: doc.memberRank ?? 'Silver',
    shippingAddress: {
      recipientName: doc.shippingAddress?.recipientName || '',
      phone: doc.shippingAddress?.phone || '',
      province: doc.shippingAddress?.province || '',
      district: doc.shippingAddress?.district || '',
      ward: doc.shippingAddress?.ward || '',
      street: doc.shippingAddress?.street || '',
    },
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

module.exports = { toPublicUser };
