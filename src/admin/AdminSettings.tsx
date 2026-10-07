import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.js';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.js';
import type { SiteSettings } from '../types/index.js';
import {
  Save,
  PhoneCall,
  Truck,
  UserCheck,
  Building,
  Image as ImageIcon,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { showToast, refreshSettings } = useStore();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.adminGetSettings();
        setSettings(data);
      } catch {
        showToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const updated = await api.adminUpdateSettings(settings);
      setSettings(updated);
      await refreshSettings();
      showToast('All settings and payment numbers saved successfully!', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <AdminLayout activeTab="settings">
        <div className="py-20 text-center text-xs font-bold text-neutral-400">
          Loading Store Configuration...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="settings">
      <form onSubmit={handleSave} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              STORE CONFIGURATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
              Settings & Payments
            </h1>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-950 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md self-start disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>

        {/* 1. BANGLADESH PAYMENT SETTINGS (CRITICAL REQUIREMENT) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
            <PhoneCall className="w-5 h-5 text-pink-600" />
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-950">
                Bangladesh Payment Configuration
              </h3>
              <p className="text-xs text-neutral-400">
                Configure official bKash & Nagad numbers and instructions. Updates in user panel immediately.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* bKash Panel */}
            <div className="p-5 bg-pink-50/50 rounded-2xl border border-pink-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-pink-900 uppercase">bKash Account</span>
                <label className="flex items-center gap-2 text-xs font-semibold text-pink-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.paymentSettings.bkash.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentSettings: {
                          ...settings.paymentSettings,
                          bkash: { ...settings.paymentSettings.bkash, enabled: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-pink-600"
                  />
                  <span>Enabled</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  bKash Number *
                </label>
                <input
                  type="text"
                  value={settings.paymentSettings.bkash.number}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentSettings: {
                        ...settings.paymentSettings,
                        bkash: { ...settings.paymentSettings.bkash, number: e.target.value },
                      },
                    })
                  }
                  placeholder="01812345678"
                  className="w-full px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs font-mono font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Account Type
                </label>
                <select
                  value={settings.paymentSettings.bkash.accountType}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentSettings: {
                        ...settings.paymentSettings,
                        bkash: { ...settings.paymentSettings.bkash, accountType: e.target.value as any },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs font-bold focus:outline-hidden"
                >
                  <option value="Personal">Personal (Send Money)</option>
                  <option value="Merchant">Merchant (Make Payment)</option>
                  <option value="Agent">Agent (Cash Out)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Payment Instructions
                </label>
                <textarea
                  rows={2}
                  value={settings.paymentSettings.bkash.instructions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentSettings: {
                        ...settings.paymentSettings,
                        bkash: { ...settings.paymentSettings.bkash, instructions: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs focus:outline-hidden resize-none"
                />
              </div>
            </div>

            {/* Nagad Panel */}
            <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-orange-900 uppercase">Nagad Account</span>
                <label className="flex items-center gap-2 text-xs font-semibold text-orange-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.paymentSettings.nagad.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentSettings: {
                          ...settings.paymentSettings,
                          nagad: { ...settings.paymentSettings.nagad, enabled: e.target.checked },
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-orange-600"
                  />
                  <span>Enabled</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Nagad Number *
                </label>
                <input
                  type="text"
                  value={settings.paymentSettings.nagad.number}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentSettings: {
                        ...settings.paymentSettings,
                        nagad: { ...settings.paymentSettings.nagad, number: e.target.value },
                      },
                    })
                  }
                  placeholder="01612345678"
                  className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs font-mono font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Account Type
                </label>
                <select
                  value={settings.paymentSettings.nagad.accountType}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentSettings: {
                        ...settings.paymentSettings,
                        nagad: { ...settings.paymentSettings.nagad, accountType: e.target.value as any },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs font-bold focus:outline-hidden"
                >
                  <option value="Personal">Personal (Send Money)</option>
                  <option value="Merchant">Merchant (Make Payment)</option>
                  <option value="Agent">Agent (Cash Out)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Payment Instructions
                </label>
                <textarea
                  rows={2}
                  value={settings.paymentSettings.nagad.instructions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentSettings: {
                        ...settings.paymentSettings,
                        nagad: { ...settings.paymentSettings.nagad, instructions: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs focus:outline-hidden resize-none"
                />
              </div>
            </div>
          </div>

          {/* Cash on Delivery Global Policy Mode */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Cash on Delivery (COD) Store Policy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
              <label
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer ${
                  settings.codMode === 'product_specific'
                    ? 'border-neutral-950 bg-neutral-50 shadow-xs'
                    : 'border-neutral-200'
                }`}
              >
                <input
                  type="radio"
                  name="codMode"
                  value="product_specific"
                  checked={settings.codMode === 'product_specific'}
                  onChange={() => setSettings({ ...settings, codMode: 'product_specific' })}
                  className="text-black"
                />
                <div>
                  <span className="font-bold block">Product-Specific (Default)</span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    Respects each item's individual toggle
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer ${
                  settings.codMode === 'global_enabled'
                    ? 'border-neutral-950 bg-neutral-50 shadow-xs'
                    : 'border-neutral-200'
                }`}
              >
                <input
                  type="radio"
                  name="codMode"
                  value="global_enabled"
                  checked={settings.codMode === 'global_enabled'}
                  onChange={() => setSettings({ ...settings, codMode: 'global_enabled' })}
                  className="text-black"
                />
                <div>
                  <span className="font-bold block">Globally Enabled</span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    Allowed on all orders
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer ${
                  settings.codMode === 'global_disabled'
                    ? 'border-neutral-950 bg-neutral-50 shadow-xs'
                    : 'border-neutral-200'
                }`}
              >
                <input
                  type="radio"
                  name="codMode"
                  value="global_disabled"
                  checked={settings.codMode === 'global_disabled'}
                  onChange={() => setSettings({ ...settings, codMode: 'global_disabled' })}
                  className="text-black"
                />
                <div>
                  <span className="font-bold block">Globally Disabled</span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    Requires advance prepayment
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* 2. DELIVERY CHARGES */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <Truck className="w-5 h-5 text-neutral-900" />
            <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-950">
              Delivery Rates (BDT ৳)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-neutral-700 uppercase mb-1">Inside Dhaka Charge (৳)</label>
              <input
                type="number"
                value={settings.deliverySettings.insideDhakaCharge}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    deliverySettings: {
                      ...settings.deliverySettings,
                      insideDhakaCharge: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-neutral-700 uppercase mb-1">Outside Dhaka Charge (৳)</label>
              <input
                type="number"
                value={settings.deliverySettings.outsideDhakaCharge}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    deliverySettings: {
                      ...settings.deliverySettings,
                      outsideDhakaCharge: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-neutral-700 uppercase mb-1">Free Delivery Over (৳)</label>
              <input
                type="number"
                value={settings.deliverySettings.freeDeliveryThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    deliverySettings: {
                      ...settings.deliverySettings,
                      freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 3. DEVELOPER PROFILE & FOUNDER INFO (CRITICAL REQUIREMENT) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-neutral-900" />
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-950">
                  Developer Profile (Zifat)
                </h3>
                <p className="text-xs text-neutral-400">
                  Any changes made here reflect in the User Panel's Developer Profile modal and footer.
                </p>
              </div>
            </div>

            {/* Toggle to turn Developer Profile on/off */}
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-200">
              <span className="text-xs font-bold text-neutral-800">
                Show on Storefront:
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings.showDeveloperProfile)}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      showDeveloperProfile: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-xs font-bold font-mono">
                {settings.showDeveloperProfile ? (
                  <span className="text-emerald-700">ON</span>
                ) : (
                  <span className="text-neutral-500">OFF</span>
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-neutral-700 uppercase mb-1">Developer / Owner Name</label>
              <input
                type="text"
                value={settings.developerProfile.name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    developerProfile: { ...settings.developerProfile, name: e.target.value },
                  })
                }
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-neutral-700 uppercase mb-1">Title / Designation</label>
              <input
                type="text"
                value={settings.developerProfile.title}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    developerProfile: { ...settings.developerProfile, title: e.target.value },
                  })
                }
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-700 uppercase mb-1">Profile Photo URL</label>
              <input
                type="text"
                value={settings.developerProfile.photoUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    developerProfile: { ...settings.developerProfile, photoUrl: e.target.value },
                  })
                }
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-700 uppercase mb-1">Short Bio</label>
              <textarea
                rows={2}
                value={settings.developerProfile.bio}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    developerProfile: { ...settings.developerProfile, bio: e.target.value },
                  })
                }
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden resize-none"
              />
            </div>

            {/* Social Channels */}
            <div>
              <label className="block text-neutral-700 uppercase mb-1">Website URL</label>
              <input
                type="text"
                value={settings.developerProfile.website}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    developerProfile: { ...settings.developerProfile, website: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-neutral-700 uppercase mb-1">Facebook URL</label>
              <input
                type="text"
                value={settings.developerProfile.facebook}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    developerProfile: { ...settings.developerProfile, facebook: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-neutral-700 uppercase mb-1">TikTok URL</label>
              <input
                type="text"
                value={settings.developerProfile.tiktok}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    developerProfile: { ...settings.developerProfile, tiktok: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-neutral-700 uppercase mb-1">YouTube URL</label>
              <input
                type="text"
                value={settings.developerProfile.youtube}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    developerProfile: { ...settings.developerProfile, youtube: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-neutral-700 uppercase mb-1">WhatsApp URL / Number</label>
              <input
                type="text"
                value={settings.developerProfile.whatsapp}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    developerProfile: { ...settings.developerProfile, whatsapp: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-neutral-700 uppercase mb-1">Instagram URL</label>
              <input
                type="text"
                value={settings.developerProfile.instagram}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    developerProfile: { ...settings.developerProfile, instagram: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 4. GENERAL STUDIO CONTACT INFO */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <Building className="w-5 h-5 text-neutral-900" />
            <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-950">
              General Store Contact
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-neutral-700 uppercase mb-1">Official Website Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-neutral-700 uppercase mb-1">Customer Support Hotline</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-neutral-700 uppercase mb-1">Official Support Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-neutral-700 uppercase mb-1">Studio Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};
