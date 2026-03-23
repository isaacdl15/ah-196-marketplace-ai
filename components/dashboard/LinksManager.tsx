'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Plus, GripVertical, Link2, Instagram, Youtube, Video, Mail, Globe, MoreVertical, Eye, EyeOff, Pencil, Trash2, X, ExternalLink } from 'lucide-react';

interface Link { id: string; link_type: string; title: string; url: string; visible: boolean; position: number; }

const LINK_TYPES = [
  { value: 'link', label: 'Link', icon: Link2 },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'tiktok', label: 'TikTok', icon: Video },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'other', label: 'Other', icon: Globe },
];

const typeIcon = (t: string) => {
  const found = LINK_TYPES.find(x => x.value === t);
  return found?.icon ?? Link2;
};

export default function LinksManager({ links: initialLinks, creatorId, username }: { links: Link[]; creatorId: string; username: string }) {
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [showModal, setShowModal] = useState(false);
  const [editLink, setEditLink] = useState<Link | null>(null);
  const [form, setForm] = useState({ link_type: 'link', title: '', url: '' });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const openAdd = () => { setEditLink(null); setForm({ link_type: 'link', title: '', url: '' }); setShowModal(true); };
  const openEdit = (l: Link) => { setEditLink(l); setForm({ link_type: l.link_type, title: l.title, url: l.url }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    if (editLink) {
      const { data } = await supabase.from('sirena_links').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editLink.id).select().single();
      if (data) setLinks(links.map(l => l.id === editLink.id ? data : l));
    } else {
      const { data } = await supabase.from('sirena_links').insert({ creator_id: creatorId, ...form, position: links.length, visible: true }).select().single();
      if (data) setLinks([...links, data]);
    }
    setSaving(false);
    setShowModal(false);
  };

  const toggleVisible = async (l: Link) => {
    await supabase.from('sirena_links').update({ visible: !l.visible }).eq('id', l.id);
    setLinks(links.map(x => x.id === l.id ? { ...x, visible: !x.visible } : x));
  };

  const deleteLink = async (id: string) => {
    await supabase.from('sirena_links').delete().eq('id', id);
    setLinks(links.filter(l => l.id !== id));
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '22px', fontWeight: 700, color: '#1A1208' }}>My links</h2>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
          <Plus size={16} /> Add link
        </button>
      </div>

      {/* Preview banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FDF0EC', border: '1px solid rgba(199,91,64,0.20)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px' }}>
        <Globe size={16} color="#C75B40" />
        <span style={{ fontSize: '13px', color: '#5A4839', flex: 1 }}>Your page: </span>
        <a href={`/${username}`} target="_blank" style={{ fontSize: '13px', fontFamily: 'monospace', color: '#1E6B6B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          sirena.fyi/@{username} <ExternalLink size={12} />
        </a>
      </div>

      {/* Links list */}
      {links.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Link2 size={48} strokeWidth={1} color="#9E8B7A" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#5A4839', marginBottom: '8px' }}>No links yet</h3>
          <p style={{ fontSize: '15px', color: '#9E8B7A', marginBottom: '24px' }}>Add your first link to start building your page.</p>
          <button onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#C75B40', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> Add a link
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px' }}>
          {links.map(link => {
            const Icon = typeIcon(link.link_type);
            return (
              <div key={link.id} style={{ background: 'white', border: '1px solid #E8DDD2', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-elev-1)', transition: '180ms ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-elev-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-elev-1)'; }}>
                <GripVertical size={16} color="#9E8B7A" style={{ cursor: 'grab', flexShrink: 0 }} />
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FDF0EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="#C75B40" strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1208' }}>{link.title}</div>
                  <div style={{ fontSize: '12px', color: '#9E8B7A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => toggleVisible(link)} title={link.visible ? 'Hide' : 'Show'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E8B7A', padding: '4px' }}>
                    {link.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => openEdit(link)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E8B7A', padding: '4px' }}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => deleteLink(link.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D94040', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', height: '52px', border: '1.5px dashed #E8DDD2', borderRadius: '12px', background: 'transparent', fontSize: '14px', fontWeight: 500, color: '#9E8B7A', cursor: 'pointer', marginTop: '4px', transition: '120ms ease', fontFamily: 'var(--font-ui)' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#C75B40'; el.style.color = '#C75B40'; el.style.background = '#FDF0EC'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#E8DDD2'; el.style.color = '#9E8B7A'; el.style.background = 'transparent'; }}>
            <Plus size={18} /> Add link
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.50)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} className="modal-overlay-enter">
          <div style={{ background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-elev-3)', padding: '32px', maxWidth: '520px', width: '100%' }} className="modal-content-enter">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1208' }}>{editLink ? 'Edit link' : 'Add link'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E8B7A', borderRadius: '8px', padding: '8px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Type selector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {LINK_TYPES.map(({ value, label, icon: Icon }) => (
                <button key={value} onClick={() => setForm({ ...form, link_type: value })}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9999px', border: form.link_type === value ? '1.5px solid #C75B40' : '1px solid #E8DDD2', background: form.link_type === value ? '#FDF0EC' : 'white', color: form.link_type === value ? '#C75B40' : '#5A4839', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {[{ label: 'Link title', key: 'title', placeholder: 'My Instagram' }, { label: 'URL', key: 'url', placeholder: 'https://' }].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A4839', marginBottom: '5px' }}>{label}</label>
                <input type="text" value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                  style={{ width: '100%', height: '40px', border: '1px solid #E8DDD2', borderRadius: '8px', padding: '0 12px', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-ui)' }}
                  onFocus={e => Object.assign(e.target.style, { borderColor: '#C75B40', boxShadow: '0 0 0 3px rgba(199,91,64,0.15)' })}
                  onBlur={e => Object.assign(e.target.style, { borderColor: '#E8DDD2', boxShadow: 'none' })}
                />
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #E8DDD2', paddingTop: '20px', marginTop: '8px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '9px 16px', border: '1.5px solid #E8DDD2', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#1A1208', fontFamily: 'var(--font-ui)' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.url}
                style={{ padding: '9px 20px', background: saving ? '#E0A090' : '#C75B40', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-ui)' }}>
                {saving ? 'Saving…' : 'Save link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
