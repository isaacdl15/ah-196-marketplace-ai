'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Users, Clock } from 'lucide-react';

interface Seller {
  id: string;
  user_id: string;
  display_name: string;
  username: string | null;
  bio: string | null;
  kyc_status: string;
  is_seller: boolean;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    pending:  { bg: '#FEF3C7', text: '#D97706' },
    approved: { bg: '#F0FDF4', text: '#16A34A' },
    rejected: { bg: '#FEF2F2', text: '#DC2626' },
  };
  const s = styles[status] ?? { bg: '#F5F5F4', text: '#57534E' };
  return (
    <span style={{ padding: '3px 10px', background: s.bg, color: s.text, borderRadius: '6px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' as const }}>
      {status}
    </span>
  );
}

export default function AdminSellersClient({ sellers: initialSellers }: { sellers: Seller[] }) {
  const [sellers, setSellers] = useState(initialSellers);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const updateKyc = async (sellerId: string, action: 'approve' | 'reject') => {
    setLoading(sellerId + action);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/${action}`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');

      setSellers(prev => prev.map(s =>
        s.id === sellerId ? { ...s, kyc_status: action === 'approve' ? 'approved' : 'rejected' } : s
      ));
      showToast(action === 'approve' ? 'Seller approved' : 'Seller rejected');
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setLoading(null);
    }
  };

  const pending = sellers.filter(s => s.kyc_status === 'pending');
  const others = sellers.filter(s => s.kyc_status !== 'pending');

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '10px',
          padding: '14px 18px', boxShadow: '0 10px 40px rgba(28,25,23,0.10)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '14px', fontWeight: 500, color: '#1C1917',
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={18} color="#16A34A" />
            : <XCircle size={18} color="#DC2626" />}
          {toast.message}
        </div>
      )}

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', fontFamily: 'var(--font-family-display)' }}>Seller Approvals</h2>
          <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '2px' }}>
            {pending.length} pending review
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ padding: '8px 14px', background: '#FEF3C7', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="#D97706" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>{pending.length} pending</span>
          </div>
        </div>
      </div>

      {/* Pending sellers table */}
      {pending.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E7E5E4', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#D97706" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>Pending Review</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F5F4' }}>
                  {['Seller', 'Username', 'Bio', 'Applied', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#A8A29E' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((seller, i) => (
                  <tr key={seller.id} data-kyc-status={seller.kyc_status} style={{ borderBottom: i < pending.length - 1 ? '1px solid #E7E5E4' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '9999px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#4F46E5', flexShrink: 0 }}>
                          {(seller.display_name ?? 'U').slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>{seller.display_name}</div>
                          <div style={{ fontSize: '11px', color: '#A8A29E' }}>{seller.user_id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#57534E' }}>@{seller.username ?? '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#57534E', maxWidth: '200px' }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                        {seller.bio ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#A8A29E' }}>{formatDate(seller.created_at)}</td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={seller.kyc_status} /></td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => updateKyc(seller.id, 'approve')}
                          disabled={!!loading}
                          style={{
                            padding: '6px 14px', background: '#F0FDF4', color: '#16A34A',
                            border: '1px solid #BBF7D0', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-family-ui)',
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}
                        >
                          <CheckCircle size={13} />
                          Approve
                        </button>
                        <button
                          onClick={() => updateKyc(seller.id, 'reject')}
                          disabled={!!loading}
                          style={{
                            padding: '6px 14px', background: '#FEF2F2', color: '#DC2626',
                            border: '1px solid #FECACA', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-family-ui)',
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All sellers table */}
      {others.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E7E5E4', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="#57534E" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>All Sellers</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F5F5F4' }}>
                  {['Seller', 'Username', 'Status', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#A8A29E' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {others.map((seller, i) => (
                  <tr key={seller.id} data-kyc-status={seller.kyc_status} style={{ borderBottom: i < others.length - 1 ? '1px solid #E7E5E4' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '9999px', background: '#F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#57534E' }}>
                          {(seller.display_name ?? 'U').slice(0, 1).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>{seller.display_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#57534E' }}>@{seller.username ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={seller.kyc_status} /></td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#A8A29E' }}>{formatDate(seller.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sellers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px', background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px' }}>
          <Users size={32} color="#E7E5E4" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', color: '#A8A29E' }}>No seller applications yet.</p>
        </div>
      )}
    </div>
  );
}
