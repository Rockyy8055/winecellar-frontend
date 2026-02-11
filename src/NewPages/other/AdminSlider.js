import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../../layouts/Layout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createAdminHeroSlide, deleteAdminHeroSlide, listAdminHeroSlides, updateAdminHeroSlide } from '../../Services/slider-api';

const ADMIN_PAGE_STYLE = {
  paddingTop: 32,
  paddingBottom: 70,
  maxWidth: 1100,
  margin: '0 auto'
};

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: 30,
  padding: 26,
  border: '1px solid rgba(55,4,14,0.08)',
  boxShadow: '0 25px 70px rgba(23,0,8,0.08)'
};

const SECTION_LABEL_STYLE = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: 'rgba(32,4,9,0.6)',
  textTransform: 'uppercase',
  marginBottom: 6
};

const INPUT_STYLE = {
  borderRadius: 14,
  border: '1px solid rgba(93,28,4,0.2)',
  background: '#fffdfb',
  fontWeight: 600,
  padding: '10px 14px'
};

const resolveSlideImage = (slide) => slide?.imageUrl || slide?.image || slide?.imagePath || slide?.url || '';

const normalizeAdminSlides = (payload) => {
  const list = payload?.slides || payload?.items || payload?.rows || payload || [];
  if (!Array.isArray(list)) return [];
  return list.map((s, idx) => ({
    id: s.id ?? s._id ?? `slide-${idx}`,
    title: s.title || '',
    subtitle: s.subtitle || '',
    url: s.url || s.href || '',
    sortOrder: Number.isFinite(Number(s.sortOrder)) ? Number(s.sortOrder) : idx,
    isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
    imageUrl: resolveSlideImage(s)
  })).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
};

const AdminSlider = () => {
  const token = useMemo(() => { try { return localStorage.getItem('admin_token') || ''; } catch (_) { return ''; } }, []);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newUrl, setNewUrl] = useState('/shop-grid-standard');
  const [newActive, setNewActive] = useState(true);
  const [newFile, setNewFile] = useState(null);

  const fileInputRef = useRef(null);

  const TOAST_PRESET = {
    style: {
      background: '#fffef1',
      color: '#350008',
      borderRadius: 12,
      border: '1px solid #350008',
      fontWeight: 600
    },
    progressStyle: { background: '#350008' },
    iconTheme: { primary: '#350008', secondary: '#fffef1' }
  };

  const loadSlides = async () => {
    setLoading(true);
    try {
      const payload = await listAdminHeroSlides(token);
      setSlides(normalizeAdminSlides(payload));
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Failed to load slider images', TOAST_PRESET);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetNew = () => {
    setNewTitle('');
    setNewSubtitle('');
    setNewUrl('/shop-grid-standard');
    setNewActive(true);
    setNewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreate = async () => {
    if (!newFile) {
      toast.error('Please choose an image file to upload', TOAST_PRESET);
      return;
    }

    try {
      const maxSort = slides.reduce((m, s) => Math.max(m, Number(s.sortOrder) || 0), 0);
      await createAdminHeroSlide({
        file: newFile,
        title: newTitle,
        subtitle: newSubtitle,
        url: newUrl,
        sortOrder: maxSort + 1,
        isActive: newActive
      }, token);
      toast.success('Slider image uploaded', TOAST_PRESET);
      resetNew();
      await loadSlides();
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Upload failed', TOAST_PRESET);
    }
  };

  const handleToggleActive = async (slide) => {
    try {
      await updateAdminHeroSlide(slide.id, { isActive: !slide.isActive }, token);
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, isActive: !s.isActive } : s)));
      toast.success('Updated', TOAST_PRESET);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Update failed', TOAST_PRESET);
    }
  };

  const handleDelete = async (slide) => {
    try {
      await deleteAdminHeroSlide(slide.id, token);
      setSlides((prev) => prev.filter((s) => s.id !== slide.id));
      toast.success('Deleted', TOAST_PRESET);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Delete failed', TOAST_PRESET);
    }
  };

  const handleMove = async (slide, dir) => {
    const sorted = [...slides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const idx = sorted.findIndex((s) => s.id === slide.id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];

    try {
      await updateAdminHeroSlide(a.id, { sortOrder: b.sortOrder }, token);
      await updateAdminHeroSlide(b.id, { sortOrder: a.sortOrder }, token);
      setSlides((prev) => prev.map((s) => {
        if (s.id === a.id) return { ...s, sortOrder: b.sortOrder };
        if (s.id === b.id) return { ...s, sortOrder: a.sortOrder };
        return s;
      }).sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0)));
    } catch (e) {
      console.error(e);
      toast.error(e?.message || 'Reorder failed', TOAST_PRESET);
    }
  };

  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <div style={ADMIN_PAGE_STYLE}>
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.08em', fontWeight: 700, color: 'rgba(53,0,8,0.6)', textTransform: 'uppercase' }}>Advertising</div>
          <h1 style={{ color:'#2e050b', fontWeight:800, marginBottom: 12 }}>Homepage Slider Images</h1>
          <p style={{ color:'rgba(46,5,11,0.7)', maxWidth: 720 }}>Upload and manage the hero slider images that appear on the Home page. These are used for brand advertisements and promotions.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 0.45fr) minmax(420px, 0.55fr)', gap: 28, alignItems: 'start' }}>
          <div style={CARD_STYLE}>
            <div style={SECTION_LABEL_STYLE}>Upload new slide</div>
            <h4 style={{ fontWeight:800, color:'#2d060b', marginBottom:18 }}>Add an advertisement</h4>

            <div className="mb-3">
              <div style={SECTION_LABEL_STYLE}>Image file</div>
              <input ref={fileInputRef} type="file" accept="image/*" className="form-control" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
            </div>

            <div className="mb-3">
              <div style={SECTION_LABEL_STYLE}>Title (optional)</div>
              <input className="form-control" style={INPUT_STYLE} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>

            <div className="mb-3">
              <div style={SECTION_LABEL_STYLE}>Subtitle (optional)</div>
              <input className="form-control" style={INPUT_STYLE} value={newSubtitle} onChange={(e) => setNewSubtitle(e.target.value)} />
            </div>

            <div className="mb-3">
              <div style={SECTION_LABEL_STYLE}>Click URL</div>
              <input className="form-control" style={INPUT_STYLE} value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="/shop-grid-standard" />
            </div>

            <div className="mb-3" style={{ display:'flex', alignItems:'center', gap:10 }}>
              <input id="slide-active" type="checkbox" checked={newActive} onChange={(e) => setNewActive(e.target.checked)} />
              <label htmlFor="slide-active" style={{ fontWeight:700, margin:0 }}>Active (show on homepage)</label>
            </div>

            <button className="btn btn-dark" style={{ padding:'12px 32px', borderRadius:16, fontWeight:700 }} onClick={handleCreate}>
              Upload
            </button>
          </div>

          <div style={CARD_STYLE}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div style={SECTION_LABEL_STYLE}>Current slides</div>
                <h4 style={{ fontWeight:800, margin:0 }}>Manage</h4>
              </div>
              <button className="btn btn-outline-secondary" style={{ borderRadius: 999, fontWeight: 700 }} onClick={loadSlides} disabled={loading}>
                Refresh
              </button>
            </div>

            {loading ? (
              <div style={{ color:'rgba(46,5,11,0.7)', fontWeight:700 }}>Loading…</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
                {slides.map((s) => (
                  <div key={s.id} style={{ display:'flex', gap: 14, alignItems:'center', padding: 12, borderRadius: 18, border: '1px solid rgba(44,5,10,0.08)', background: '#fffdf8' }}>
                    <img src={s.imageUrl} alt={s.title || 'slide'} style={{ width: 92, height: 56, borderRadius: 14, objectFit:'cover', background:'#f1e6dc' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color:'#2d060b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.title || 'Untitled slide'}</div>
                      <div style={{ fontSize: 13, color:'rgba(46,5,11,0.65)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.url || '—'}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: s.isActive ? '#0b6b2c' : 'rgba(46,5,11,0.45)' }}>{s.isActive ? 'Active' : 'Inactive'}</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
                      <div style={{ display:'flex', gap: 8, justifyContent:'flex-end' }}>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleMove(s, -1)} title="Move up">↑</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleMove(s, 1)} title="Move down">↓</button>
                      </div>
                      <div style={{ display:'flex', gap: 8, justifyContent:'flex-end' }}>
                        <button className={`btn btn-sm ${s.isActive ? 'btn-outline-dark' : 'btn-dark'}`} onClick={() => handleToggleActive(s)}>
                          {s.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!slides.length && (
                  <div style={{ color:'rgba(46,5,11,0.7)', fontWeight:700 }}>No slider images yet. Upload the first advertisement image.</div>
                )}
              </div>
            )}
          </div>
        </div>

        <ToastContainer position="bottom-right" />
      </div>
    </Layout>
  );
};

export default AdminSlider;
