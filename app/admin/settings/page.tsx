'use client';

import { useState } from 'react';
import { Settings, Bell, Shield, Palette, Save, Check } from 'lucide-react';

type Tab = 'notifications' | 'platform' | 'security' | 'appearance';

const TAB_ITEMS: { id: Tab; label: string; icon: React.FC<{ size: number; color?: string }> }[] = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'platform', label: 'Platform', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

interface ToggleRow {
  label: string;
  description: string;
  key: string;
}

const NOTIFICATION_TOGGLES: ToggleRow[] = [
  { label: 'New user signups', description: 'Get notified when a new user creates an account', key: 'new_signup' },
  { label: 'New template submission', description: 'Alert when a creator submits a template for review', key: 'new_template' },
  { label: 'New purchase', description: 'Get notified on each completed purchase', key: 'new_purchase' },
  { label: 'Payout request', description: 'Alert when a seller requests a payout', key: 'payout_request' },
  { label: 'Weekly digest', description: 'Receive a weekly summary of platform activity', key: 'weekly_digest' },
];

const PLATFORM_TOGGLES: ToggleRow[] = [
  { label: 'Maintenance mode', description: 'Take the site offline for maintenance (admins still have access)', key: 'maintenance' },
  { label: 'Open registration', description: 'Allow new users to create accounts', key: 'open_registration' },
  { label: 'Template submissions', description: 'Allow sellers to submit new templates for review', key: 'template_submissions' },
  { label: 'Public browse page', description: 'Make the template catalog visible to the public', key: 'public_browse' },
];

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: '44px', height: '24px', borderRadius: '9999px',
        background: checked ? '#4F46E5' : '#E7E5E4',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 200ms ease', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '2px',
        left: checked ? '22px' : '2px',
        width: '20px', height: '20px', borderRadius: '9999px',
        background: 'white', transition: 'left 200ms ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: '16px', marginBottom: '16px', overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #E7E5E4' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>{title}</h3>
      </div>
      <div style={{ padding: '0 24px' }}>{children}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('notifications');
  const [saved, setSaved] = useState(false);
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>({
    new_signup: true,
    new_template: true,
    new_purchase: false,
    payout_request: true,
    weekly_digest: true,
  });
  const [platformToggles, setPlatformToggles] = useState<Record<string, boolean>>({
    maintenance: false,
    open_registration: true,
    template_submissions: true,
    public_browse: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>Admin Settings</h2>
          <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>Manage platform-wide settings and configuration.</p>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: saved ? '#16A34A' : '#4F46E5',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-family-ui)',
            transition: 'background 200ms ease',
          }}
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E7E5E4', marginBottom: '24px', gap: '0' }}>
        {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '12px 16px', background: 'none', border: 'none',
              borderBottom: activeTab === id ? '2px solid #4F46E5' : '2px solid transparent',
              color: activeTab === id ? '#4F46E5' : '#A8A29E',
              fontWeight: activeTab === id ? 600 : 500,
              fontSize: '14px', cursor: 'pointer',
              fontFamily: 'var(--font-family-ui)',
              marginBottom: '-1px',
            }}
          >
            <Icon size={15} color={activeTab === id ? '#4F46E5' : '#A8A29E'} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'notifications' && (
        <SettingCard title="Notification Preferences">
          {NOTIFICATION_TOGGLES.map((row, i) => (
            <div key={row.key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 0',
              borderBottom: i < NOTIFICATION_TOGGLES.length - 1 ? '1px solid #F5F5F4' : 'none',
            }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: '#1C1917' }}>{row.label}</p>
                <p style={{ fontSize: '13px', color: '#57534E', marginTop: '2px' }}>{row.description}</p>
              </div>
              <ToggleSwitch
                checked={notifToggles[row.key] ?? false}
                onChange={v => setNotifToggles(prev => ({ ...prev, [row.key]: v }))}
              />
            </div>
          ))}
        </SettingCard>
      )}

      {activeTab === 'platform' && (
        <>
          <SettingCard title="Platform Settings">
            {PLATFORM_TOGGLES.map((row, i) => (
              <div key={row.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 0',
                borderBottom: i < PLATFORM_TOGGLES.length - 1 ? '1px solid #F5F5F4' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 500, color: '#1C1917' }}>{row.label}</p>
                  <p style={{ fontSize: '13px', color: '#57534E', marginTop: '2px' }}>{row.description}</p>
                </div>
                <ToggleSwitch
                  checked={platformToggles[row.key] ?? false}
                  onChange={v => setPlatformToggles(prev => ({ ...prev, [row.key]: v }))}
                />
              </div>
            ))}
          </SettingCard>
          <SettingCard title="Revenue Share">
            <div style={{ padding: '16px 0' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>
                Platform fee (%)
              </label>
              <input
                type="number"
                defaultValue={20}
                min={0}
                max={50}
                style={{
                  width: '120px', height: '44px', padding: '0 12px',
                  border: '1px solid #E7E5E4', borderRadius: '10px',
                  fontSize: '15px', color: '#1C1917', background: '#FAFAF9',
                  fontFamily: 'var(--font-family-ui)',
                }}
              />
              <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '6px' }}>
                Sellers receive the remaining percentage after the platform fee.
              </p>
            </div>
          </SettingCard>
        </>
      )}

      {activeTab === 'security' && (
        <>
          <SettingCard title="Authentication">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Require email verification', description: 'Users must verify their email before accessing the platform', key: 'email_verify', checked: true },
                { label: 'Allow GitHub OAuth', description: 'Users can sign in with their GitHub account', key: 'github_oauth', checked: true },
                { label: 'Two-factor authentication', description: 'Require 2FA for admin accounts', key: 'admin_2fa', checked: false },
              ].map((row, i, arr) => (
                <div key={row.key} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid #F5F5F4' : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 500, color: '#1C1917' }}>{row.label}</p>
                    <p style={{ fontSize: '13px', color: '#57534E', marginTop: '2px' }}>{row.description}</p>
                  </div>
                  <ToggleSwitch checked={row.checked} onChange={() => {}} />
                </div>
              ))}
            </div>
          </SettingCard>
          <SettingCard title="Rate Limiting">
            <div style={{ padding: '16px 0' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>
                API requests per minute (per IP)
              </label>
              <input
                type="number"
                defaultValue={60}
                style={{
                  width: '120px', height: '44px', padding: '0 12px',
                  border: '1px solid #E7E5E4', borderRadius: '10px',
                  fontSize: '15px', color: '#1C1917', background: '#FAFAF9',
                  fontFamily: 'var(--font-family-ui)',
                }}
              />
            </div>
          </SettingCard>
        </>
      )}

      {activeTab === 'appearance' && (
        <SettingCard title="Theme & Branding">
          <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>
                Primary color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  defaultValue="#4F46E5"
                  style={{ width: '44px', height: '44px', border: '1px solid #E7E5E4', borderRadius: '10px', cursor: 'pointer', padding: '4px' }}
                />
                <span style={{ fontSize: '14px', fontFamily: 'monospace', color: '#57534E' }}>#4F46E5</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>
                Marketplace name
              </label>
              <input
                type="text"
                defaultValue="marketplace.ai"
                style={{
                  width: '300px', height: '44px', padding: '0 12px',
                  border: '1px solid #E7E5E4', borderRadius: '10px',
                  fontSize: '15px', color: '#1C1917', background: '#FAFAF9',
                  fontFamily: 'var(--font-family-ui)',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#57534E', marginBottom: '6px' }}>
                Marketplace tagline
              </label>
              <input
                type="text"
                defaultValue="Production-ready templates for developers"
                style={{
                  width: '400px', height: '44px', padding: '0 12px',
                  border: '1px solid #E7E5E4', borderRadius: '10px',
                  fontSize: '15px', color: '#1C1917', background: '#FAFAF9',
                  fontFamily: 'var(--font-family-ui)',
                }}
              />
            </div>
          </div>
        </SettingCard>
      )}
    </div>
  );
}
