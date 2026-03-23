'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Package, Pencil, Share2, MoreHorizontal, X, BookOpen, Video, Music, Layers, GraduationCap, Sliders } from 'lucide-react';

interface Product { id: string; name: string; description: string | null; product_type: string; price_cents: number; is_free: boolean; status: string; cover_image_url: string | null; }

const PRODUCT_TYPES = [
  { value: 'pdf', label: 'PDF/E-book', icon: BookOpen },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'audio', label: 'Audio', icon: Music },
  { value: 'bundle', label: 'Bundle', icon: Layers },
  { value: 'course', label: 'Course', icon: GraduationCap },
  { value: 'preset', label: 'Preset', icon: Sliders },
];

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: '#D1F2E4', color: '#1A6B45', label: 'Active' },
  draft:  { bg: '#F5EEE6', color: '#5A4839', label: 'Draft' },
  paused: { bg: '#F5EEE6', color: '#9E8B7A', label: 'Paused' },
};

function typeIcon(t: string) {
  return PRODUCT_TYPES.find(x => x.value === t)?.icon ?? Package;
}

function formatMoney(cents: number, isFree: boolean) {
  if (isFree) return 'Free';
  return '$' + (cents / 100).toFixed(2);
}

export default function ProductsManager({ products: initial, creatorId }: { products: Product[]; creatorId: string }) {
  const [products, setProducts] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', product_type: 'pdf', price_cents: 0, is_free: false, access: 'everyone', status: 'draft' as string });
  const [priceStr, setPriceStr] = useState('0.00');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', product_type: 'pdf', price_cents: 0, is_free: false, access: 'everyone', status: 'draft' });
    setPriceStr('0.00');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description ?? '', product_type: p.product_type, price_cents: p.price_cents, is_free: p.is_free, access: 'everyone', status: p.status });
    setPriceStr((p.price_cents / 100).toFixed(2));
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const priceCents = form.is_free ? 0 : Math.round(parseFloat(priceStr) * 100);
    const payload = { ...form, price_cents: priceCents };
    if (editProduct) {
      const { data } = await supabase.from('sirena_products').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editProduct.id).select().single();
      if (data) setProducts(products.map(p => p.id === editProduct.id ? data : p));
    } else {
      const { data } = await supabase.from('sirena_products').insert({ creator_id: creatorId, ...payload }).select().single();
      if (data) setProducts([data, ...products]);
    }
    setSaving(false);
    setShowModal(false);
  };

  const statusCycle = async (p: Product) => {
    const next = p.status === 'draft' ? 'active' : p.status === 'active' ? 'paused' : 'draft';
    await supabase.from('sirena_products').update({ status: next }).eq('id', p.id);
    setProducts(products.map(x => x.id === p.id ? { ...x, status: next } : x));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1208' }}>My products</h2>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
          <Plus size={16} /> New product
        </button>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Package size={48} strokeWidth={1} color="#9E8B7A" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>No products yet</h3>
          <p style={{ fontSize: '15px', color: '#9E8B7A', marginBottom: '24px' }}>Add a digital product to start selling.</p>
          <button onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> Add product
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {products.map(p => {
            const Icon = typeIcon(p.product_type);
            const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE.draft;
            return (
              <div key={p.id} style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-elev-1)', transition: '180ms ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-elev-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-elev-1)'; }}>
                {/* Cover */}
                <div style={{ height: '180px', background: '#F5EEE6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Icon size={48} color="#9E8B7A" strokeWidth={1} />
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '9999px' }}>
                    {badge.label}
                  </span>
                </div>
                {/* Body */}
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A1208', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9E8B7A', marginBottom: '12px' }}>
                    {PRODUCT_TYPES.find(t => t.value === p.product_type)?.label ?? p.product_type}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#C75B40' }}>{formatMoney(p.price_cents, p.is_free)}</div>
                  <div style={{ borderTop: '1px solid #E8DDD2', margin: '14px 0' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(p)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#5A4839', padding: '4px 8px', borderRadius: '6px', fontFamily: 'var(--font-ui)' }}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#5A4839', padding: '4px 8px', borderRadius: '6px', fontFamily: 'var(--font-ui)' }}>
                      <Share2 size={14} /> Share
                    </button>
                    <button onClick={() => statusCycle(p)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#9E8B7A', padding: '4px 8px', borderRadius: '6px', marginLeft: 'auto', fontFamily: 'var(--font-ui)' }}>
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.50)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} className="modal-overlay-enter">
          <div style={{ background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-elev-3)', padding: '32px', maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} className="modal-content-enter">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1208' }}>{editProduct ? 'Edit product' : 'New product'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E8B7A', borderRadius: '8px', padding: '8px' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left */}
              <div>
                {[{ label: 'Product name', key: 'name', placeholder: 'Fitness Guide Vol. 1' }, { label: 'Description', key: 'description', placeholder: 'Tell buyers what they\'ll get…', textarea: true }].map(({ label, key, placeholder, textarea }) => (
                  <div key={key} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>{label}</label>
                    {textarea ? (
                      <textarea value={form[key as keyof typeof form] as string} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} rows={3}
                        style={{ width: '100%', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-ui)', resize: 'vertical' }} />
                    ) : (
                      <input type="text" value={form[key as keyof typeof form] as string} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                        style={{ width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 12px', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-ui)' }} />
                    )}
                  </div>
                ))}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>Product type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {PRODUCT_TYPES.map(({ value, label, icon: Icon }) => (
                      <button key={value} onClick={() => setForm({ ...form, product_type: value })}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 6px', border: form.product_type === value ? '1.5px solid #C75B40' : '1px solid #E8DDD2', borderRadius: '8px', background: form.product_type === value ? '#FDF0EC' : 'white', cursor: 'pointer' }}>
                        <Icon size={16} color={form.product_type === value ? '#C75B40' : '#9E8B7A'} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: form.product_type === value ? '#C75B40' : '#5A4839' }}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Right */}
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>Price</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#9E8B7A' }}>$</span>
                    <input type="number" value={priceStr} onChange={e => setPriceStr(e.target.value)} disabled={form.is_free} min="0" step="0.01"
                      style={{ width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 12px 0 24px', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-ui)', opacity: form.is_free ? 0.5 : 1 }} />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', cursor: 'pointer' }}>
                  <div style={{ width: '40px', height: '22px', borderRadius: '9999px', background: form.is_free ? '#C75B40' : '#E8DDD2', position: 'relative', transition: '150ms', flexShrink: 0 }} onClick={() => setForm({ ...form, is_free: !form.is_free })}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '9999px', background: 'white', position: 'absolute', top: '2px', left: form.is_free ? '20px' : '2px', transition: '150ms cubic-bezier(0.16,1,0.3,1)' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#1A1208' }}>Free</span>
                </label>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>Status</label>
                  <div style={{ position: 'relative' }}>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                      style={{ width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 36px 0 12px', fontSize: '14px', outline: 'none', appearance: 'none', fontFamily: 'var(--font-ui)' }}>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                    <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9E8B7A" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
                <div style={{ background: '#F5EEE6', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <Package size={32} color="#9E8B7A" strokeWidth={1} style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#5A4839' }}>{form.name || 'Product name'}</div>
                  <div style={{ fontSize: '12px', color: '#9E8B7A', marginTop: '4px' }}>{form.is_free ? 'Free' : `$${priceStr}`}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #E8DDD2', paddingTop: '20px', marginTop: '16px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '9px 16px', border: '1.5px solid #E8DDD2', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#1A1208', fontFamily: 'var(--font-ui)' }}>Cancel</button>
              <button onClick={() => { void (async () => { setForm({ ...form, status: 'draft' }); await handleSave(); })(); }} style={{ padding: '9px 16px', border: '1.5px solid #E8DDD2', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#1A1208', fontFamily: 'var(--font-ui)' }}>Save draft</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                style={{ padding: '9px 20px', background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-ui)', opacity: !form.name ? 0.6 : 1 }}>
                {saving ? 'Saving…' : 'Publish product'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1023px) { .product-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 639px)  { .product-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
