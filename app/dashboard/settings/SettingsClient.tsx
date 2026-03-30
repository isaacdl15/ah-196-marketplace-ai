'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Lock, Bell, Check } from 'lucide-react';

type Tab = 'profile' | 'account' | 'notifications';

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  username: string | null;
  bio: string | null;
  website: string | null;
  avatar_url: string | null;
  is_seller: boolean;
  categories: string[] | null;
}

export default function SettingsClient({ profile, userEmail }: { profile: Profile | null; userEmail: string }) {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    display_name: profile?.display_name ?? '',
    username: profile?.username ?? '',
    bio: profile?.bio ?? '',
    website: profile?.website ?? '',
  });

  const [notifications, setNotifications] = useState({
    new_sale: true,
    review_submitted: true,
    payout_processed: true,
    weekly_summary: false,
    marketing: false,
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    await supabase
      .from('mp_profiles')
      .update({
        display_name: form.display_name,
        username: form.username,
        bio: form.bio,
        website: form.website,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', profile?.user_id ?? '');

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 13px',
    border: '1px solid #E7E5E4',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1C1917',
    background: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'var(--font-family-ui)',
  };

  const labelStyle = { display: 'block' as const, fontSize: '13px', fontWeight: 600 as const, color: '#1C1917', marginBottom: '6px' };

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>
          Settings
        </h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E7E5E4', marginBottom: '28px', gap: '0' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === id ? '#4F46E5' : 'transparent'}`,
              color: tab === id ? '#4F46E5' : '#57534E',
              fontSize: '14px',
              fontWeight: tab === id ? 600 : 500,
              cursor: 'pointer',
              marginBottom: '-1px',
              fontFamily: 'var(--font-family-ui)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '28px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '9999px',
              background: '#EEF2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 700, color: '#4F46E5',
            }}>
              {(form.display_name || userEmail).slice(0, 1).toUpperCase()}
            </div>
            <div>
              <button style={{
                padding: '7px 14px', border: '1px solid #E7E5E4', borderRadius: '8px',
                background: '#FFFFFF', color: '#57534E', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'var(--font-family-ui)',
              }}>
                Change photo
              </button>
              <p style={{ fontSize: '11px', color: '#A8A29E', marginTop: '4px' }}>JPG, PNG max 2MB</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Display name</label>
              <input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#4F46E5')} onBlur={e => (e.target.style.borderColor = '#E7E5E4')} />
            </div>
            <div>
              <label style={labelStyle}>Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#A8A29E' }}>@</span>
                <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={{ ...inputStyle, paddingLeft: '26px' }}
                  onFocus={e => (e.target.style.borderColor = '#4F46E5')} onBlur={e => (e.target.style.borderColor = '#E7E5E4')} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
              style={{ ...inputStyle, resize: 'vertical' as const }}
              onFocus={e => (e.target.style.borderColor = '#4F46E5')} onBlur={e => (e.target.style.borderColor = '#E7E5E4')} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Website</label>
            <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://yoursite.com" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#4F46E5')} onBlur={e => (e.target.style.borderColor = '#E7E5E4')} />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            style={{
              padding: '10px 24px',
              background: saved ? '#16A34A' : saving ? '#A8A29E' : '#4F46E5',
              color: '#FFFFFF', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-family-ui)',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: '200ms ease',
            }}
          >
            {saved ? <><Check size={14} /> Saved!</> : saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}

      {/* Account tab */}
      {tab === 'account' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '28px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Email</label>
            <input value={userEmail} disabled style={{ ...inputStyle, background: '#F5F5F4', color: '#A8A29E' }} />
            <p style={{ fontSize: '12px', color: '#A8A29E', marginTop: '4px' }}>Contact support to change your email.</p>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #E7E5E4' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '8px' }}>Change Password</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <input type="password" placeholder="Current password" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#4F46E5')} onBlur={e => (e.target.style.borderColor = '#E7E5E4')} />
              <input type="password" placeholder="New password" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#4F46E5')} onBlur={e => (e.target.style.borderColor = '#E7E5E4')} />
              <input type="password" placeholder="Confirm new password" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#4F46E5')} onBlur={e => (e.target.style.borderColor = '#E7E5E4')} />
            </div>
            <button style={{
              padding: '10px 20px', background: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family-ui)',
            }}>
              Update password
            </button>
          </div>

          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #E7E5E4' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626', marginBottom: '8px' }}>Danger Zone</h4>
            <p style={{ fontSize: '13px', color: '#57534E', marginBottom: '12px' }}>
              Permanently delete your account and all associated data.
            </p>
            <button style={{
              padding: '8px 16px', background: '#FEF2F2', color: '#DC2626',
              border: '1px solid #FECACA', borderRadius: '8px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-family-ui)',
            }}>
              Delete account
            </button>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {tab === 'notifications' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', padding: '28px' }}>
          <p style={{ fontSize: '14px', color: '#57534E', marginBottom: '20px' }}>
            Choose which notifications you want to receive via email.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { key: 'new_sale', label: 'New sale', desc: 'When someone purchases your template' },
              { key: 'review_submitted', label: 'New review', desc: 'When a buyer leaves a review' },
              { key: 'payout_processed', label: 'Payout processed', desc: 'When a payout is sent to your account' },
              { key: 'weekly_summary', label: 'Weekly summary', desc: 'Weekly overview of your sales and earnings' },
              { key: 'marketing', label: 'Tips & updates', desc: 'Product updates and seller tips' },
            ].map(({ key, label, desc }) => {
              const checked = notifications[key as keyof typeof notifications];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof notifications] }))}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '14px', background: checked ? '#F9F9FF' : '#FFFFFF',
                    border: `1px solid ${checked ? '#C7D2FE' : '#E7E5E4'}`,
                    borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                    transition: '120ms ease',
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '1px',
                    border: `2px solid ${checked ? '#4F46E5' : '#D6D3D1'}`,
                    background: checked ? '#4F46E5' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '120ms ease',
                  }}>
                    {checked && <Check size={11} color="white" strokeWidth={2.5} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#57534E', marginTop: '2px' }}>{desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            style={{
              marginTop: '20px', padding: '10px 24px', background: '#4F46E5', color: '#FFFFFF',
              border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-family-ui)',
            }}
          >
            Save preferences
          </button>
        </div>
      )}
    </div>
  );
}
