import React from 'react';
import { useStore } from '../context/StoreContext.js';
import {
  X,
  Globe,
  MessageCircle,
  Send,
  ExternalLink,
  Code2,
  CheckCircle,
} from 'lucide-react';

export const DeveloperProfileModal: React.FC = () => {
  const { settings, isDevProfileOpen, closeDevProfile } = useStore();

  if (!isDevProfileOpen) return null;

  const rawProfile = settings?.developerProfile;
  const profile = {
    name: rawProfile?.name && rawProfile.name !== 'Zifat Sheikh' ? rawProfile.name : 'SYM_DEV',
    title: rawProfile?.title || 'Lead Full-Stack Developer & UI/UX Designer',
    bio: rawProfile?.bio || 'Professional web engineer specialized in high-performance e-commerce experiences and ultra-modern web technologies. Crafted the official digital flagship store for RAW BY ZIFAT.',
    photoUrl: rawProfile?.photoUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    website: rawProfile?.website || 'https://sayeemdev69.netlify.app',
    whatsapp: rawProfile?.whatsapp || 'https://wa.me/8801752714034',
    phone: '01752714034',
    facebook: rawProfile?.facebook || 'https://facebook.com',
    instagram: rawProfile?.instagram || '',
    tiktok: rawProfile?.tiktok || '',
    youtube: rawProfile?.youtube || '',
    telegram: rawProfile?.telegram || '',
    messenger: rawProfile?.messenger || '',
  };

  const directWhatsAppUrl = `https://wa.me/8801752714034?text=${encodeURIComponent('Hello SYM_DEV! I am contacting you from RAW BY ZIFAT official store.')}`;

  const socialLinks = [
    { label: 'Website', url: profile.website, icon: Globe, color: 'hover:text-blue-600' },
    { label: 'WhatsApp', url: profile.whatsapp, icon: MessageCircle, color: 'hover:text-emerald-600' },
    { label: 'Facebook', url: profile.facebook, icon: Globe, color: 'hover:text-blue-700' },
    { label: 'Instagram', url: profile.instagram, icon: Globe, color: 'hover:text-pink-600' },
    { label: 'TikTok', url: profile.tiktok, icon: Globe, color: 'hover:text-neutral-900' },
    { label: 'YouTube', url: profile.youtube, icon: Globe, color: 'hover:text-red-600' },
    { label: 'Telegram', url: profile.telegram, icon: Send, color: 'hover:text-sky-500' },
    { label: 'Messenger', url: profile.messenger, icon: MessageCircle, color: 'hover:text-blue-500' },
  ].filter((s) => s.url && s.url.trim() !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header graphic */}
        <div className="h-32 bg-neutral-950 relative overflow-hidden flex items-center justify-between px-6">
          <div className="relative z-10">
            <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 font-bold">
              FOUNDER & DEVELOPER
            </span>
            <h3 className="text-xl font-extrabold text-white tracking-wider">
              RAW BY ZIFAT
            </h3>
          </div>
          <button
            onClick={closeDevProfile}
            className="relative z-10 p-2 text-neutral-400 hover:text-white bg-neutral-900/80 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="p-6 pt-0 relative">
          {/* Avatar */}
          <div className="-mt-14 mb-4 flex items-end justify-between">
            <div className="relative">
              <img
                src={
                  profile.photoUrl && !profile.photoUrl.includes('1534528741775')
                    ? profile.photoUrl
                    : 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80'
                }
                alt={profile.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-neutral-900"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full text-xs font-semibold text-neutral-700">
              <Code2 className="w-3.5 h-3.5" />
              <span>Full-Stack & Apparel</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-neutral-950 tracking-tight">{profile.name}</h2>
            <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mt-0.5">
              {profile.title}
            </p>
          </div>

          <div className="mt-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <p className="text-sm text-neutral-700 leading-relaxed font-normal">
              {profile.bio}
            </p>
          </div>

          {/* Primary Quick Actions: WhatsApp Direct & Website */}
          <div className="mt-5 space-y-2.5">
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-98 transition-all text-sm group"
            >
              <MessageCircle className="w-5 h-5 text-white animate-pulse" />
              <span>WhatsApp Message: 01752714034</span>
            </a>

            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-900 font-semibold rounded-2xl border border-neutral-200/80 transition-all text-xs"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Portfolio: sayeemdev69.netlify.app</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>
          </div>

          {/* Social Links Grid */}
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Official Channels & Socials
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-800 transition-all text-sm font-medium group"
                >
                  <span className="flex items-center gap-2">
                    <link.icon className="w-4 h-4 text-neutral-600 group-hover:text-neutral-900" />
                    <span>{link.label}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-transform group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Official Identity of RAW BY ZIFAT</span>
            <button
              onClick={closeDevProfile}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
