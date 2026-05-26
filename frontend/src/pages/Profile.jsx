import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import { userAvatar } from '../utils/imageUrl';
import {
  buildFormFromUser,
  formatShippingAddress,
  mapUserToAuth,
  validateProfileForm,
} from '../utils/userProfile';

const MAX_AVATAR_MB = 2;

function FormField({ label, error, children, hint }) {
  return (
    <div className="profile-form-field">
      {label && <label className="profile-form-label">{label}</label>}
      {children}
      {hint && !error && <p className="profile-form-hint">{hint}</p>}
      {error && <p className="profile-form-error">{error}</p>}
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="profile-field">
      <p className="profile-field__label">{label}</p>
      <p className="profile-field__value">{value || '—'}</p>
    </div>
  );
}

export default function Profile() {
  const { auth, setAuth } = useContext(AuthContext);
  const nav = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('view');
  const [form, setForm] = useState(buildFormFromUser(null));
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [banner, setBanner] = useState({ type: '', text: '' });

  const showBanner = (type, text) => {
    setBanner({ type, text });
    window.setTimeout(() => setBanner({ type: '', text: '' }), 5000);
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      nav('/login');
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get('/auth/profile');
        if (!cancelled && res.EC === 0) {
          setUser(res.DT);
          setForm(buildFormFromUser(res.DT));
        } else if (!cancelled) {
          showBanner('error', 'Không tải được hồ sơ');
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) showBanner('error', 'Không tải được hồ sơ. Vui lòng thử lại.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, nav]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const displayUser = user || auth.user;
  const isEditing = mode === 'edit';
  const previewSrc = avatarPreview || userAvatar(displayUser);

  const startEdit = () => {
    setForm(buildFormFromUser(displayUser));
    setFieldErrors({});
    setMode('edit');
    setBanner({ type: '', text: '' });
  };

  const cancelEdit = () => {
    setForm(buildFormFromUser(displayUser));
    setFieldErrors({});
    setAvatarPreview(null);
    setMode('view');
  };

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const updateAddress = (patch) =>
    setForm((prev) => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, ...patch },
    }));

  const applyUser = (updated) => {
    setUser(updated);
    setForm(buildFormFromUser(updated));
    setAuth((prev) => ({ ...prev, user: mapUserToAuth(updated) }));
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showBanner('error', 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)');
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      showBanner('error', `Ảnh tối đa ${MAX_AVATAR_MB}MB`);
      return;
    }

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await axios.post('/auth/upload-avatar', formData);
      if (res.EC === 0) {
        applyUser(res.DT);
        setAvatarPreview(null);
        showBanner('success', res.EM || 'Cập nhật ảnh đại diện thành công');
      } else {
        setAvatarPreview(null);
        showBanner('error', res.EM || 'Upload ảnh thất bại');
      }
    } catch (err) {
      setAvatarPreview(null);
      showBanner('error', err?.EM || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!displayUser?.avatar) return;
    if (!window.confirm('Xóa ảnh đại diện hiện tại?')) return;

    setUploadingAvatar(true);
    try {
      const res = await axios.delete('/auth/avatar');
      if (res.EC === 0) {
        applyUser(res.DT);
        setAvatarPreview(null);
        showBanner('success', res.EM || 'Đã xóa ảnh đại diện');
      } else {
        showBanner('error', res.EM || 'Không thể xóa ảnh');
      }
    } catch {
      showBanner('error', 'Lỗi kết nối');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner({ type: '', text: '' });

    const errors = validateProfileForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      showBanner('error', 'Vui lòng kiểm tra lại các trường được đánh dấu');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.replace(/\s/g, '').trim(),
      shippingAddress: {
        recipientName: form.shippingAddress.recipientName.trim(),
        phone: form.shippingAddress.phone.replace(/\s/g, '').trim(),
        province: form.shippingAddress.province.trim(),
        district: form.shippingAddress.district.trim(),
        ward: form.shippingAddress.ward.trim(),
        street: form.shippingAddress.street.trim(),
      },
    };

    if (form.changePassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
      payload.confirmPassword = form.confirmPassword;
    }

    setSaving(true);
    try {
      const res = await axios.put('/auth/profile', payload);
      if (res.EC === 0) {
        applyUser(res.DT);
        setMode('view');
        setFieldErrors({});
        showBanner('success', res.EM || 'Cập nhật hồ sơ thành công');
      } else {
        showBanner('error', res.EM || 'Cập nhật thất bại');
      }
    } catch (err) {
      showBanner('error', err?.EM || 'Lỗi kết nối. Vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <nav className="text-sm mb-6" style={{ color: 'var(--ink-3)' }}>
        <Link to="/" className="hover:text-[var(--accent)]">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <span style={{ color: 'var(--ink)' }}>Tài khoản của tôi</span>
      </nav>

      {banner.text && (
        <div className={`alert alert--${banner.type === 'error' ? 'error' : 'success'} mb-6`}>
          {banner.text}
        </div>
      )}

      <div className="profile-card">
        <div className="profile-card__hero" />
        <div className="profile-card__header">
          <div className="profile-avatar-block">
            <div className="profile-avatar-wrap">
              {previewSrc ? (
                <img src={previewSrc} alt={displayUser?.name} className="profile-avatar-img" />
              ) : (
                <UserAvatar user={displayUser} size={112} ring />
              )}
              {uploadingAvatar && (
                <div className="profile-avatar-overlay">
                  <div className="spinner profile-avatar-spinner" />
                </div>
              )}
            </div>
            {isEditing && !uploadingAvatar && (
              <div className="profile-avatar-actions">
                <button
                  type="button"
                  className="profile-avatar-btn profile-avatar-btn--primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Tải ảnh lên
                </button>
                {displayUser?.avatar && (
                  <button
                    type="button"
                    className="profile-avatar-btn profile-avatar-btn--ghost"
                    onClick={handleRemoveAvatar}
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleAvatarSelect}
            />
            {isEditing && (
              <p className="profile-avatar-hint">JPG, PNG, WEBP · Tối đa {MAX_AVATAR_MB}MB</p>
            )}
          </div>

          <div className="profile-card__identity">
            <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--ink)' }}>
              {displayUser?.name}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--ink-3)' }}>
              {displayUser?.email}
            </p>
            {displayUser?.role === 'Customer' && (
              <div className="profile-badges">
                <span className="profile-badge">{displayUser?.role || 'Member'}</span>
                <span className="profile-badge profile-badge--gold">
                  {displayUser?.memberRank || 'Silver'}
                </span>
                <span className="profile-badge">
                  {(displayUser?.points || 0).toLocaleString('vi-VN')} điểm
                </span>
              </div>
            )}
          </div>

          <div className="profile-header-actions">
            {!isEditing ? (
              <button type="button" onClick={startEdit} className="btn-primary px-6 py-2.5">
                Chỉnh sửa hồ sơ
              </button>
            ) : (
              <span className="profile-edit-badge">Đang chỉnh sửa</span>
            )}
          </div>
        </div>

        <div className="profile-card__body">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-edit-form" noValidate>
              <section className="profile-form-section">
                <h2 className="profile-form-section__title">Thông tin cá nhân</h2>
                <p className="profile-form-section__desc">
                  Thông tin dùng để xác thực tài khoản và liên hệ khi đặt hàng.
                </p>
                <div className="profile-form-grid">
                  <FormField label="Họ và tên *" error={fieldErrors.name}>
                    <input
                      type="text"
                      className={`form-input${fieldErrors.name ? ' form-input--error' : ''}`}
                      value={form.name}
                      onChange={(e) => updateForm({ name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      autoComplete="name"
                    />
                  </FormField>
                  <FormField label="Email *" error={fieldErrors.email}>
                    <input
                      type="email"
                      className={`form-input${fieldErrors.email ? ' form-input--error' : ''}`}
                      value={form.email}
                      onChange={(e) => updateForm({ email: e.target.value })}
                      placeholder="email@example.com"
                      autoComplete="email"
                    />
                  </FormField>
                  <FormField
                    label="Số điện thoại"
                    error={fieldErrors.phone}
                    hint="Dùng khi shop cần liên hệ về đơn hàng"
                  >
                    <input
                      type="tel"
                      className={`form-input${fieldErrors.phone ? ' form-input--error' : ''}`}
                      value={form.phone}
                      onChange={(e) => updateForm({ phone: e.target.value })}
                      placeholder="0901234567"
                      autoComplete="tel"
                    />
                  </FormField>
                </div>
              </section>

              {displayUser?.role === 'Customer' && (
                <section className="profile-form-section">
                  <h2 className="profile-form-section__title">Địa chỉ giao hàng mặc định</h2>
                  <p className="profile-form-section__desc">
                    Điền đầy đủ để thanh toán nhanh hơn ở lần mua sau (có thể bỏ trống nếu chưa cần).
                  </p>
                  <div className="profile-form-grid">
                    <FormField
                      label="Tên người nhận"
                      error={fieldErrors['shippingAddress.recipientName']}
                    >
                      <input
                        type="text"
                        className={`form-input${fieldErrors['shippingAddress.recipientName'] ? ' form-input--error' : ''}`}
                        value={form.shippingAddress.recipientName}
                        onChange={(e) => updateAddress({ recipientName: e.target.value })}
                        placeholder="Họ tên người nhận"
                      />
                    </FormField>
                    <FormField label="SĐT người nhận" error={fieldErrors['shippingAddress.phone']}>
                      <input
                        type="tel"
                        className={`form-input${fieldErrors['shippingAddress.phone'] ? ' form-input--error' : ''}`}
                        value={form.shippingAddress.phone}
                        onChange={(e) => updateAddress({ phone: e.target.value })}
                        placeholder="0901234567"
                      />
                    </FormField>
                    <FormField label="Tỉnh / Thành phố" error={fieldErrors['shippingAddress.province']}>
                      <input
                        type="text"
                        className={`form-input${fieldErrors['shippingAddress.province'] ? ' form-input--error' : ''}`}
                        value={form.shippingAddress.province}
                        onChange={(e) => updateAddress({ province: e.target.value })}
                        placeholder="VD: TP. Hồ Chí Minh"
                      />
                    </FormField>
                    <FormField label="Quận / Huyện" error={fieldErrors['shippingAddress.district']}>
                      <input
                        type="text"
                        className={`form-input${fieldErrors['shippingAddress.district'] ? ' form-input--error' : ''}`}
                        value={form.shippingAddress.district}
                        onChange={(e) => updateAddress({ district: e.target.value })}
                        placeholder="VD: Quận 1"
                      />
                    </FormField>
                    <FormField label="Phường / Xã" error={fieldErrors['shippingAddress.ward']}>
                      <input
                        type="text"
                        className={`form-input${fieldErrors['shippingAddress.ward'] ? ' form-input--error' : ''}`}
                        value={form.shippingAddress.ward}
                        onChange={(e) => updateAddress({ ward: e.target.value })}
                        placeholder="VD: Phường Bến Nghé"
                      />
                    </FormField>
                    <FormField
                      label="Địa chỉ chi tiết"
                      error={fieldErrors['shippingAddress.street']}
                    >
                      <input
                        type="text"
                        className={`form-input${fieldErrors['shippingAddress.street'] ? ' form-input--error' : ''}`}
                        value={form.shippingAddress.street}
                        onChange={(e) => updateAddress({ street: e.target.value })}
                        placeholder="Số nhà, tên đường..."
                      />
                    </FormField>
                  </div>
                </section>
              )}

              <section className="profile-form-section profile-form-section--security">
                <label className="profile-checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.changePassword}
                    onChange={(e) =>
                      updateForm({
                        changePassword: e.target.checked,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      })
                    }
                  />
                  <span>Tôi muốn đổi mật khẩu</span>
                </label>

                {form.changePassword && (
                  <div className="profile-form-grid mt-4">
                    <FormField label="Mật khẩu hiện tại *" error={fieldErrors.currentPassword}>
                      <input
                        type="password"
                        className={`form-input${fieldErrors.currentPassword ? ' form-input--error' : ''}`}
                        value={form.currentPassword}
                        onChange={(e) => updateForm({ currentPassword: e.target.value })}
                        autoComplete="current-password"
                      />
                    </FormField>
                    <FormField label="Mật khẩu mới *" error={fieldErrors.newPassword}>
                      <input
                        type="password"
                        className={`form-input${fieldErrors.newPassword ? ' form-input--error' : ''}`}
                        value={form.newPassword}
                        onChange={(e) => updateForm({ newPassword: e.target.value })}
                        autoComplete="new-password"
                      />
                    </FormField>
                    <FormField label="Xác nhận mật khẩu mới *" error={fieldErrors.confirmPassword}>
                      <input
                        type="password"
                        className={`form-input${fieldErrors.confirmPassword ? ' form-input--error' : ''}`}
                        value={form.confirmPassword}
                        onChange={(e) => updateForm({ confirmPassword: e.target.value })}
                        autoComplete="new-password"
                      />
                    </FormField>
                  </div>
                )}
              </section>

              <div className="profile-form-actions">
                <button type="submit" disabled={saving || uploadingAvatar} className="btn-primary px-8 py-3">
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  disabled={saving || uploadingAvatar}
                  onClick={cancelEdit}
                  className="btn-ghost px-8 py-3"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-view-grid">
              <div className="profile-info-panel">
                <h3 className="profile-panel-title">Thông tin cá nhân</h3>
                <ReadOnlyField label="Họ và tên" value={displayUser?.name} />
                <ReadOnlyField label="Email" value={displayUser?.email} />
                <ReadOnlyField label="Số điện thoại" value={displayUser?.phone} />
                <ReadOnlyField
                  label="Cập nhật lần cuối"
                  value={
                    displayUser?.updatedAt
                      ? new Date(displayUser.updatedAt).toLocaleString('vi-VN')
                      : '—'
                  }
                />
              </div>

              {displayUser?.role === 'Customer' && (
                <>
                  <div className="profile-info-panel">
                    <h3 className="profile-panel-title">Địa chỉ giao hàng</h3>
                    {formatShippingAddress(displayUser?.shippingAddress) !== '—' ? (
                      <>
                        <ReadOnlyField
                          label="Người nhận"
                          value={displayUser?.shippingAddress?.recipientName}
                        />
                        <ReadOnlyField
                          label="SĐT nhận hàng"
                          value={displayUser?.shippingAddress?.phone}
                        />
                        <ReadOnlyField
                          label="Địa chỉ"
                          value={formatShippingAddress(displayUser?.shippingAddress)}
                        />
                      </>
                    ) : (
                      <p className="profile-empty-hint">
                        Chưa có địa chỉ mặc định. Bấm «Chỉnh sửa hồ sơ» để thêm địa chỉ giao hàng.
                      </p>
                    )}
                  </div>

                  <div className="profile-info-panel">
                    <h3 className="profile-panel-title">Thành viên & ưu đãi</h3>
                    <ReadOnlyField
                      label="Điểm tích lũy"
                      value={(displayUser?.points || 0).toLocaleString('vi-VN')}
                    />
                    <ReadOnlyField label="Hạng thành viên" value={displayUser?.memberRank} />
                    <ReadOnlyField
                      label="Ngày tham gia"
                      value={
                        displayUser?.createdAt
                          ? new Date(displayUser.createdAt).toLocaleDateString('vi-VN')
                          : '—'
                      }
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--sand-2)' }}>
            <Link to="/" className="btn-ghost inline-flex">
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
