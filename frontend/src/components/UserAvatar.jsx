import React from 'react';
import { userAvatar } from '../utils/imageUrl';

export default function UserAvatar({ user, size = 40, className = '', ring = false }) {
  const src = userAvatar(user);
  const initial = user?.name?.[0]?.toUpperCase() || 'U';
  const ringClass = ring ? ' user-avatar--ring' : '';

  if (src) {
    return (
      <img
        src={src}
        alt={user?.name || 'Avatar'}
        className={`user-avatar user-avatar--img${ringClass} ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`user-avatar user-avatar--fallback${ringClass} ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.38) }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
