import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Trash2, Settings as SettingsIcon, Save, Camera, Calendar } from 'lucide-react';
import { ImageCropper } from '@/components/ImageCropper';
import { supabase } from '@/lib/supabase';
import type { Settings, Service } from '@/lib/types';
import { uploadImage } from '@/lib/storage';
import { useToast } from '@/components/Toast';
import { LoadingState, ConfirmDialog } from '@/components/Feedback';
import { StudioLogo } from '@/components/Avatar';
import { EVENT_TYPES } from '@/lib/constants';

export function SettingsPage() {
  const { show } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [maxEvents, setMaxEvents] = useState('8');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [rawLogoFile, setRawLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [showAddService, setShowAddService] = useState(false);
  const [svcName, setSvcName] = useState('');
  const [svcVariant, setSvcVariant] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

  const [customEventTypes, setCustomEventTypes] = useState<string[]>([]);
  const [newEventType, setNewEventType] = useState('');

  const fetchAll = useCallback(async () => {
    const [setData, svcData] = await Promise.all([
      supabase.from('settings').select('*').limit(1).maybeSingle(),
      supabase.from('services').select('*').order('sort_order'),
    ]);
    const s = setData.data as Settings | null;
    setSettings(s);
    if (s) {
      setBusinessName(s.business_name);
      setTagline(s.tagline);
      setPhone(s.phone);
      setAddress(s.address);
      setMaxEvents(String(s.max_events_per_day));
      setLogoUrl(s.logo_url || '');
      setLogoPreview(s.logo_url || null);
    }
    setServices((svcData.data || []) as Service[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      show('Logo must be under 5MB.', 'error');
      return;
    }
    setRawLogoFile(file);
  };

  const handleLogoCropConfirm = (cropped: File) => {
    setLogoFile(cropped);
    setLogoPreview(URL.createObjectURL(cropped));
    setRawLogoFile(null);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    let finalLogoUrl = logoUrl;
    if (logoFile) {
      const uploaded = await uploadImage(logoFile, 'logo');
      if (uploaded) finalLogoUrl = uploaded;
    }
    const { error } = await supabase
      .from('settings')
      .update({
        business_name: businessName,
        tagline,
        phone,
        address,
        max_events_per_day: parseInt(maxEvents) || 8,
        logo_url: finalLogoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);
    if (error) {
      show('Something went wrong. Please try again.', 'error');
      setSaving(false);
      return;
    }
    show('Settings saved successfully');
    setSaving(false);
    setLogoFile(null);
    fetchAll();
  };

  const handleAddService = async () => {
    if (!svcName.trim()) {
      show('Please enter a service name.', 'error');
      return;
    }
    const maxSort = services.reduce((m, s) => Math.max(m, s.sort_order), 0);
    const { error } = await supabase.from('services').insert({
      name: svcName.trim(),
      variant: svcVariant.trim(),
      price: parseFloat(svcPrice) || 0,
      sort_order: maxSort + 1,
    });
    if (error) {
      show('Something went wrong. Please try again.', 'error');
      return;
    }
    show('Service added successfully');
    setShowAddService(false);
    setSvcName('');
    setSvcVariant('');
    setSvcPrice('');
    fetchAll();
  };

  const handleUpdateServicePrice = async (id: string, price: string) => {
    const val = parseFloat(price) || 0;
    if (val < 0) return;
    await supabase.from('services').update({ price: val }).eq('id', id);
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, price: val } : s)));
  };

  const handleDeleteService = async () => {
    if (!deleteServiceId) return;
    await supabase.from('services').delete().eq('id', deleteServiceId);
    show('Service removed');
    setDeleteServiceId(null);
    fetchAll();
  };

  const handleAddEventType = () => {
    const trimmed = newEventType.trim();
    if (!trimmed) return;
    if (customEventTypes.includes(trimmed) || (EVENT_TYPES as readonly string[]).includes(trimmed)) {
      show('This event type already exists.', 'error');
      return;
    }
    setCustomEventTypes((prev) => [...prev, trimmed]);
    setNewEventType('');
    show('Event type added');
  };

  const handleRemoveEventType = (type: string) => {
    setCustomEventTypes((prev) => prev.filter((t) => t !== type));
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your studio configuration</p>
      </div>

      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2 mb-5">
          <SettingsIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Business Information
        </h2>

        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <StudioLogo src={logoPreview || null} size="md" />
            <button
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-brand text-white flex items-center justify-center shadow-md hover:shadow-glow transition-all active:scale-90"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium t-secondary">Studio Logo</p>
            <p className="text-xs t-muted">Click the camera icon to upload a logo</p>
            {logoFile && (
              <button
                onClick={() => { setLogoFile(null); setLogoPreview(logoUrl || null); }}
                className="text-xs t-muted hover:text-red-500 mt-1"
              >
                Remove new logo
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Business Name</label>
            <input className="input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input className="input" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <label className="label">Maximum Events Per Day</label>
            <input type="number" min="1" className="input" value={maxEvents} onChange={(e) => setMaxEvents(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary mt-5" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Studio Services
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddService(true)}>
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>

        <div className="space-y-2">
          {services.map((svc) => (
            <div key={svc.id} className="flex items-center gap-3 p-3 bg-surface-subtle rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium t-secondary">
                  {svc.name}
                  {svc.variant && <span className="t-muted"> — {svc.variant}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm t-muted">₹</span>
                  <input
                    type="number"
                    min="0"
                    className="input py-1.5 w-24 text-sm"
                    value={svc.price}
                    onChange={(e) => handleUpdateServicePrice(svc.id, e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setDeleteServiceId(svc.id)}
                  className="t-faint hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Event Types
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {[...EVENT_TYPES, ...customEventTypes].map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-subtle rounded-lg text-sm t-secondary border border-default"
            >
              {type}
              {customEventTypes.includes(type) && (
                <button
                  onClick={() => handleRemoveEventType(type)}
                  className="t-faint hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add custom event type..."
            value={newEventType}
            onChange={(e) => setNewEventType(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddEventType()}
          />
          <button className="btn btn-secondary" onClick={handleAddEventType}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {showAddService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-sm animate-fade-in" style={{ backgroundColor: "var(--overlay)" }} onClick={() => setShowAddService(false)} />
          <div className="relative bg-surface rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold t-primary mb-4">Add Service</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Service Name</label>
                <input className="input" placeholder="e.g. Passport Photo" value={svcName} onChange={(e) => setSvcName(e.target.value)} />
              </div>
              <div>
                <label className="label">Variant (optional)</label>
                <input className="input" placeholder="e.g. 8 Photos" value={svcVariant} onChange={(e) => setSvcVariant(e.target.value)} />
              </div>
              <div>
                <label className="label">Price (₹)</label>
                <input type="number" min="0" className="input" placeholder="0" value={svcPrice} onChange={(e) => setSvcPrice(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button className="btn btn-secondary flex-1" onClick={() => setShowAddService(false)}>Cancel</button>
                <button className="btn btn-primary flex-1" onClick={handleAddService}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteServiceId}
        title="Remove Service"
        message="Are you sure you want to remove this service?"
        confirmLabel="Remove"
        danger
        onCancel={() => setDeleteServiceId(null)}
        onConfirm={handleDeleteService}
      />

      {rawLogoFile && (
        <ImageCropper
          file={rawLogoFile}
          title="Crop Logo"
          onCancel={() => setRawLogoFile(null)}
          onConfirm={handleLogoCropConfirm}
        />
      )}
    </div>
  );
}
