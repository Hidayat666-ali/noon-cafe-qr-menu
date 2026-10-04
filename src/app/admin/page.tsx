'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMenu } from '@/lib/menu-context';
import { MenuItem, MenuCategory, Offer, CafeSettings } from '@/lib/types';
import {
  Utensils,
  Layers,
  Sparkles,
  Tag,
  QrCode,
  Settings as SettingsIcon,
  LayoutDashboard,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Upload,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  Lock,
  Unlock,
  RotateCcw,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import QRCode from 'qrcode';

type AdminTab = 'dashboard' | 'menu' | 'categories' | 'new-at-noon' | 'offers' | 'qr' | 'settings';

export default function AdminPage() {
  const { data, saveData, resetToDefault } = useMenu();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Simple PIN protection (default: "noon123" or "1234")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('noon_admin_auth') === 'true';
    }
    return false;
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Notifications
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Modals
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Filters
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('all');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // PIN verification
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'noon123' || pinInput === '1234') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('noon_admin_auth', 'true');
      }
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('noon_admin_auth');
    }
  };

  const triggerSave = async (updatedData: typeof data, message = 'Saved successfully!') => {
    setSaveStatus('Saving changes...');
    const ok = await saveData(updatedData);
    if (ok) {
      setSaveStatus(message);
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus('Error saving');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // --- ITEM ACTIONS ---
  const handleOpenAddItem = () => {
    const defaultCat = data.categories[0]?.id || 'cat-crave-corner';
    setEditingItem({
      id: `item-${Date.now()}`,
      name: '',
      price: 99,
      categoryId: defaultCat,
      image: '/images/placeholder-food.svg',
      description: '',
      isNew: false,
      isAvailable: true,
      order: data.items.length + 1,
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;

    const exists = data.items.some((i) => i.id === editingItem.id);
    let updatedItems: MenuItem[];

    if (exists) {
      updatedItems = data.items.map((i) => (i.id === editingItem.id ? editingItem : i));
    } else {
      updatedItems = [...data.items, editingItem];
    }

    const updatedData = { ...data, items: updatedItems };
    triggerSave(updatedData, `Item "${editingItem.name}" saved!`);
    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    const updatedItems = data.items.filter((i) => i.id !== id);
    triggerSave({ ...data, items: updatedItems }, `Deleted "${name}"`);
  };

  const handleToggleItemAvailability = (id: string) => {
    const updatedItems = data.items.map((i) =>
      i.id === id ? { ...i, isAvailable: i.isAvailable === false ? true : false } : i
    );
    triggerSave({ ...data, items: updatedItems }, 'Item availability updated');
  };

  const handleToggleNewAtNoon = (id: string) => {
    const updatedItems = data.items.map((i) =>
      i.id === id ? { ...i, isNew: !i.isNew } : i
    );
    const item = data.items.find((i) => i.id === id);
    triggerSave(
      { ...data, items: updatedItems },
      `"${item?.name}" ${!item?.isNew ? 'added to' : 'removed from'} New at Noon`
    );
  };

  const handleMoveItemOrder = (id: string, direction: 'up' | 'down') => {
    const item = data.items.find((i) => i.id === id);
    if (!item) return;

    const catItems = data.items
      .filter((i) => i.categoryId === item.categoryId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const index = catItems.findIndex((i) => i.id === id);
    if (direction === 'up' && index > 0) {
      const prev = catItems[index - 1];
      const temp = item.order || 0;
      item.order = prev.order || 0;
      prev.order = temp;
    } else if (direction === 'down' && index < catItems.length - 1) {
      const next = catItems[index + 1];
      const temp = item.order || 0;
      item.order = next.order || 0;
      next.order = temp;
    }

    triggerSave({ ...data, items: [...data.items] }, 'Item reordered');
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        setEditingItem({ ...editingItem, image: json.url });
      } else {
        // Fallback: Read as base64 data URL directly
        const reader = new FileReader();
        reader.onload = () => {
          setEditingItem({ ...editingItem, image: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Upload failed, falling back to data URL:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setEditingItem({ ...editingItem, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  // --- CATEGORY ACTIONS ---
  const handleOpenAddCategory = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name: '',
      slug: `cat-${Date.now()}`,
      order: data.categories.length + 1,
      isActive: true,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;

    const exists = data.categories.some((c) => c.id === editingCategory.id);
    let updatedCategories: MenuCategory[];

    if (exists) {
      updatedCategories = data.categories.map((c) =>
        c.id === editingCategory.id ? editingCategory : c
      );
    } else {
      updatedCategories = [...data.categories, editingCategory];
    }

    triggerSave({ ...data, categories: updatedCategories }, 'Category saved!');
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"? Existing items will need a category reassignment.`)) return;
    const updatedCategories = data.categories.filter((c) => c.id !== id);
    triggerSave({ ...data, categories: updatedCategories }, `Category "${name}" deleted`);
  };

  const handleToggleCategoryActive = (id: string) => {
    const updated = data.categories.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    triggerSave({ ...data, categories: updated }, 'Category visibility updated');
  };

  const handleMoveCategory = (id: string, direction: 'up' | 'down') => {
    const cats = [...data.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const index = cats.findIndex((c) => c.id === id);
    if (direction === 'up' && index > 0) {
      const prev = cats[index - 1];
      const temp = cats[index].order;
      cats[index].order = prev.order;
      prev.order = temp;
    } else if (direction === 'down' && index < cats.length - 1) {
      const next = cats[index + 1];
      const temp = cats[index].order;
      cats[index].order = next.order;
      next.order = temp;
    }
    triggerSave({ ...data, categories: cats }, 'Categories reordered');
  };

  // --- OFFERS ACTIONS ---
  const handleOpenAddOffer = () => {
    setEditingOffer({
      id: `offer-${Date.now()}`,
      title: '',
      description: '',
      validityText: 'This weekend',
      isActive: true,
      image: '',
    });
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer || !editingOffer.title.trim()) return;

    const exists = data.offers.some((o) => o.id === editingOffer.id);
    let updatedOffers: Offer[];

    if (exists) {
      updatedOffers = data.offers.map((o) => (o.id === editingOffer.id ? editingOffer : o));
    } else {
      updatedOffers = [...data.offers, editingOffer];
    }

    triggerSave({ ...data, offers: updatedOffers }, 'Offer saved!');
    setIsOfferModalOpen(false);
    setEditingOffer(null);
  };

  const handleDeleteOffer = (id: string) => {
    if (!window.confirm('Delete this offer?')) return;
    const updatedOffers = data.offers.filter((o) => o.id !== id);
    triggerSave({ ...data, offers: updatedOffers }, 'Offer deleted');
  };

  const handleToggleOfferActive = (id: string) => {
    const updatedOffers = data.offers.map((o) =>
      o.id === id ? { ...o, isActive: !o.isActive } : o
    );
    triggerSave({ ...data, offers: updatedOffers }, 'Offer status updated');
  };

  // --- SETTINGS ACTIONS ---
  const handleSaveSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const updatedSettings: CafeSettings = {
      ...data.settings,
      name: formData.get('name') as string || 'NOON CAFE',
      tagline: formData.get('tagline') as string || 'Cafe & Eatery',
      welcomeSubtext: formData.get('welcomeSubtext') as string || "What's your craving?",
      address: formData.get('address') as string || '',
      area: formData.get('area') as string || '',
      city: formData.get('city') as string || '',
      instagramUrl: formData.get('instagramUrl') as string || '',
      contactNumber: formData.get('contactNumber') as string || '',
      halalCertified: formData.get('halalCertified') === 'on',
      currencySymbol: '₹',
    };

    triggerSave({ ...data, settings: updatedSettings }, 'Settings saved!');
  };

  // Render QR Code in QR tab
  React.useEffect(() => {
    if (activeTab === 'qr' && qrCanvasRef.current && typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}/menu/noon`;
      QRCode.toCanvas(
        qrCanvasRef.current,
        fullUrl,
        {
          width: 280,
          margin: 2,
          color: {
            dark: '#141416',
            light: '#FFFFFF',
          },
        },
        (err) => {
          if (err) console.error(err);
        }
      );
    }
  }, [activeTab]);

  // If not authenticated, render login PIN screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-noon-dark flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-noon-card border border-noon-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-noon-cardElevated to-noon-dark border-2 border-noon-gold mx-auto flex items-center justify-center mb-4 shadow-lg shadow-black/50">
            <span className="font-arabic font-bold text-3xl text-noon-gold leading-none">ن</span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-wide">
            NOON CAFE ADMIN
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Kismatpur, Hyderabad • Staff Portal
          </p>

          <form onSubmit={handlePinSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Staff PIN (e.g. noon123)"
                className="w-full bg-noon-dark border border-noon-border rounded-xl px-4 py-3 text-center text-lg tracking-widest text-white placeholder-gray-500 focus:outline-none focus:border-noon-gold focus:ring-1 focus:ring-noon-gold transition-all"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-400 mt-1.5 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Incorrect PIN. Hint: Use noon123 or 1234
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-noon-gold hover:bg-noon-goldHover text-noon-dark font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-noon-gold/20 active:scale-95 transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-noon-border/40">
            <Link
              href="/menu/noon"
              className="text-xs text-gray-400 hover:text-noon-gold transition-colors inline-flex items-center gap-1 font-semibold"
            >
              ← Back to Customer Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active items counts
  const newAtNoonCount = data.items.filter((i) => i.isNew).length;
  const activeOffersCount = data.offers.filter((o) => o.isActive).length;

  return (
    <div className="min-h-screen bg-noon-dark text-gray-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-noon-card/95 backdrop-blur-md border-b border-noon-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-noon-dark border border-noon-gold/40 flex items-center justify-center">
            <span className="font-arabic font-bold text-xl text-noon-gold leading-none">ن</span>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide text-white flex items-center gap-1.5">
              <span>NOON CAFE</span>
              <span className="text-xs bg-noon-gold/20 text-noon-gold px-2 py-0.5 rounded-full font-bold">
                ADMIN
              </span>
            </h1>
            <p className="text-[10px] text-gray-400">Kismatpur, Hyderabad</p>
          </div>
        </div>

        {/* Action badges & Save feedback */}
        <div className="flex items-center gap-3">
          {saveStatus && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-noon-gold bg-noon-gold/10 border border-noon-gold/30 px-3 py-1 rounded-full animate-fade-in font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>{saveStatus}</span>
            </div>
          )}

          <Link
            href="/menu/noon"
            target="_blank"
            className="flex items-center gap-1.5 bg-noon-gold text-noon-dark hover:bg-noon-goldHover px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-md transition-all active:scale-95"
          >
            <span>Live Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            title="Lock Admin"
            className="p-2 rounded-xl bg-noon-dark border border-noon-border text-gray-400 hover:text-white transition-colors"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Tabs Bar */}
      <nav className="bg-noon-card border-b border-noon-border px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'dashboard'
              ? 'bg-noon-gold text-noon-dark font-extrabold shadow'
              : 'text-gray-300 hover:bg-noon-cardElevated'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>DASHBOARD</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'menu'
              ? 'bg-noon-gold text-noon-dark font-extrabold shadow'
              : 'text-gray-300 hover:bg-noon-cardElevated'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>MENU ({data.items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'categories'
              ? 'bg-noon-gold text-noon-dark font-extrabold shadow'
              : 'text-gray-300 hover:bg-noon-cardElevated'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>CATEGORIES ({data.categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('new-at-noon')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'new-at-noon'
              ? 'bg-noon-gold text-noon-dark font-extrabold shadow'
              : 'text-gray-300 hover:bg-noon-cardElevated'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>NEW AT NOON {newAtNoonCount > 0 && `(${newAtNoonCount})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'offers'
              ? 'bg-noon-gold text-noon-dark font-extrabold shadow'
              : 'text-gray-300 hover:bg-noon-cardElevated'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>OFFERS {activeOffersCount > 0 && `(${activeOffersCount})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'qr'
              ? 'bg-noon-gold text-noon-dark font-extrabold shadow'
              : 'text-gray-300 hover:bg-noon-cardElevated'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR CODE</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'bg-noon-gold text-noon-dark font-extrabold shadow'
              : 'text-gray-300 hover:bg-noon-cardElevated'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>SETTINGS</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto">
        {/* --- TAB 1: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Dashboard Overview</h2>
              <p className="text-xs text-gray-400">Manage Noon Cafe menu items, categories, offers & settings.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-noon-card border border-noon-border p-4 rounded-2xl">
                <span className="text-xs text-gray-400 font-medium">Total Menu Items</span>
                <p className="text-2xl font-black text-white mt-1">{data.items.length}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">Active in cafe</span>
              </div>

              <div className="bg-noon-card border border-noon-border p-4 rounded-2xl">
                <span className="text-xs text-gray-400 font-medium">Categories</span>
                <p className="text-2xl font-black text-white mt-1">{data.categories.length}</p>
                <span className="text-[10px] text-noon-gold font-semibold">Organized sections</span>
              </div>

              <div className="bg-noon-card border border-noon-border p-4 rounded-2xl">
                <span className="text-xs text-gray-400 font-medium">New at Noon</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{newAtNoonCount}</p>
                <span className="text-[10px] text-gray-400 font-semibold">Featured on top</span>
              </div>

              <div className="bg-noon-card border border-noon-border p-4 rounded-2xl">
                <span className="text-xs text-gray-400 font-medium">Active Offers</span>
                <p className="text-2xl font-black text-noon-500 mt-1">{activeOffersCount}</p>
                <span className="text-[10px] text-gray-400 font-semibold">Promotions running</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-noon-card border border-noon-border p-5 rounded-3xl">
              <h3 className="font-extrabold text-sm text-white mb-3 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleOpenAddItem}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-noon-cardElevated hover:bg-noon-border/60 border border-noon-border text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-noon-gold/20 text-noon-gold flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-noon-gold">Add Menu Item</h4>
                    <p className="text-[11px] text-gray-400">Add a dish, snack or beverage</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('new-at-noon')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-noon-cardElevated hover:bg-noon-border/60 border border-noon-border text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-amber-400">Feature New Items</h4>
                    <p className="text-[11px] text-gray-400">Toggle items on New at Noon</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('qr')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-noon-cardElevated hover:bg-noon-border/60 border border-noon-border text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-purple-400">Table QR Code</h4>
                    <p className="text-[11px] text-gray-400">View or download QR code</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Reset to default option */}
            <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-red-300">Reset to Physical Menu Initial State</h4>
                <p className="text-[11px] text-gray-400">Restores all original 28 items and 6 categories from physical menu</p>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm('Reset all menu data back to physical menu initial state?')) {
                    await resetToDefault();
                    setSaveStatus('Menu reset to initial state');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-bold border border-red-700/50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 2: MENU MANAGEMENT --- */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-white">Menu Management</h2>
                <p className="text-xs text-gray-400">Add, edit, reorder or replace photos of menu items.</p>
              </div>

              <button
                onClick={handleOpenAddItem}
                className="flex items-center gap-2 bg-noon-gold hover:bg-noon-goldHover text-noon-dark px-4 py-2.5 rounded-xl font-black text-xs shadow-lg self-start sm:self-auto transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>ADD NEW ITEM</span>
              </button>
            </div>

            {/* Filter and Search controls */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                placeholder="Search items by name..."
                className="flex-1 bg-noon-card border border-noon-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-noon-gold"
              />

              <select
                value={menuFilterCategory}
                onChange={(e) => setMenuFilterCategory(e.target.value)}
                className="bg-noon-card border border-noon-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-noon-gold"
              >
                <option value="all">All Categories ({data.items.length})</option>
                {data.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({data.items.filter((i) => i.categoryId === c.id).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Items List */}
            <div className="bg-noon-card border border-noon-border rounded-2xl overflow-hidden divide-y divide-noon-border/60">
              {data.items
                .filter((item) => {
                  if (menuFilterCategory !== 'all' && item.categoryId !== menuFilterCategory) return false;
                  if (menuSearchQuery && !item.name.toLowerCase().includes(menuSearchQuery.toLowerCase())) return false;
                  return true;
                })
                .map((item) => {
                  const cat = data.categories.find((c) => c.id === item.categoryId);
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-noon-cardElevated/50 transition-colors"
                    >
                      {/* Image + Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-noon-dark flex-shrink-0 border border-noon-border">
                          <Image
                            src={item.image || '/images/placeholder-food.svg'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-white text-sm sm:text-base truncate">
                              {item.name}
                            </h4>
                            {item.isNew && (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                NEW
                              </span>
                            )}
                            {item.isAvailable === false && (
                              <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                HIDDEN
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 text-xs">
                            <span className="text-noon-gold font-extrabold">₹{item.price}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400 text-[11px] truncate">
                              {cat?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Item Quick Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* New at noon toggle */}
                        <button
                          onClick={() => handleToggleNewAtNoon(item.id)}
                          title={item.isNew ? 'Remove from New at Noon' : 'Add to New at Noon'}
                          className={`p-2 rounded-xl border text-xs transition-colors ${
                            item.isNew
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-noon-dark text-gray-500 border-noon-border hover:text-white'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>

                        {/* Availability toggle */}
                        <button
                          onClick={() => handleToggleItemAvailability(item.id)}
                          title={item.isAvailable !== false ? 'Hide Item' : 'Show Item'}
                          className={`p-2 rounded-xl border text-xs transition-colors ${
                            item.isAvailable !== false
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {item.isAvailable !== false ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>

                        {/* Edit Item */}
                        <button
                          onClick={() => {
                            setEditingItem({ ...item });
                            setIsItemModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-noon-dark border border-noon-border text-gray-300 hover:text-noon-gold transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Item */}
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-2 rounded-xl bg-noon-dark border border-noon-border text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* --- TAB 3: CATEGORY MANAGEMENT --- */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Categories</h2>
                <p className="text-xs text-gray-400">Add, rename, reorder or hide category sections.</p>
              </div>
              <button
                onClick={handleOpenAddCategory}
                className="flex items-center gap-1.5 bg-noon-gold hover:bg-noon-goldHover text-noon-dark px-3.5 py-2 rounded-xl font-bold text-xs shadow transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>ADD CATEGORY</span>
              </button>
            </div>

            <div className="bg-noon-card border border-noon-border rounded-2xl divide-y divide-noon-border/60">
              {data.categories
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((cat, idx) => {
                  const itemCount = data.items.filter((i) => i.categoryId === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-noon-dark border border-noon-border flex items-center justify-center text-xs font-bold text-gray-400">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                          <span className="text-[11px] text-gray-400">{itemCount} items</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleMoveCategory(cat.id, 'up')}
                          disabled={idx === 0}
                          className="p-2 rounded-xl bg-noon-dark border border-noon-border text-gray-400 hover:text-white disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveCategory(cat.id, 'down')}
                          disabled={idx === data.categories.length - 1}
                          className="p-2 rounded-xl bg-noon-dark border border-noon-border text-gray-400 hover:text-white disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleCategoryActive(cat.id)}
                          className={`p-2 rounded-xl border ${
                            cat.isActive !== false
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {cat.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory({ ...cat });
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-noon-dark border border-noon-border text-gray-300 hover:text-noon-gold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-2 rounded-xl bg-noon-dark border border-noon-border text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* --- TAB 4: NEW AT NOON SWITCHBOARD --- */}
        {activeTab === 'new-at-noon' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-extrabold text-white">New at Noon Selection</h2>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Toggle items ON/OFF to feature them in the top &ldquo;NEW AT NOON&rdquo; showcase. If no items are selected, the section stays completely hidden from customers.
              </p>
            </div>

            <div className="p-3 bg-noon-cardElevated/80 border border-amber-500/30 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-amber-300 font-bold">
                Currently Featured: {newAtNoonCount} {newAtNoonCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-[11px] text-gray-400">
                {newAtNoonCount === 0 ? 'Section is hidden on menu' : 'Section is visible on menu'}
              </span>
            </div>

            <div className="bg-noon-card border border-noon-border rounded-2xl divide-y divide-noon-border/60">
              {data.items.map((item) => {
                const cat = data.categories.find((c) => c.id === item.categoryId);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-noon-cardElevated/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-noon-dark flex-shrink-0 border border-noon-border">
                        <Image
                          src={item.image || '/images/placeholder-food.svg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="text-noon-gold font-semibold">₹{item.price}</span>
                          <span>•</span>
                          <span>{cat?.name}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleNewAtNoon(item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 shadow ${
                        item.isNew
                          ? 'bg-amber-500 text-noon-dark shadow-amber-500/20'
                          : 'bg-noon-dark border border-noon-border text-gray-400 hover:text-white'
                      }`}
                    >
                      {item.isNew ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>FEATURED</span>
                        </>
                      ) : (
                        <span>OFF</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 5: OFFERS --- */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Offers & Specials</h2>
                <p className="text-xs text-gray-400">
                  Create seasonal deals or combo promotions. If no offers are active, the section is completely hidden from customers.
                </p>
              </div>

              <button
                onClick={handleOpenAddOffer}
                className="flex items-center gap-1.5 bg-noon-gold hover:bg-noon-goldHover text-noon-dark px-3.5 py-2 rounded-xl font-bold text-xs shadow transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>CREATE OFFER</span>
              </button>
            </div>

            {data.offers.length === 0 ? (
              <div className="bg-noon-card border border-noon-border p-8 rounded-3xl text-center">
                <Tag className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                <h3 className="font-bold text-white text-base">No Offers Created</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Click &ldquo;Create Offer&rdquo; to add a promotional deal or weekend special.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-noon-card border border-noon-border p-4 rounded-2xl flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {offer.validityText || 'Limited Time'}
                        </span>
                        <button
                          onClick={() => handleToggleOfferActive(offer.id)}
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            offer.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          {offer.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </div>

                      <h4 className="font-bold text-white text-base">{offer.title}</h4>
                      {offer.description && (
                        <p className="text-xs text-gray-400 mt-1">{offer.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-noon-border/60 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingOffer({ ...offer });
                          setIsOfferModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-noon-dark border border-noon-border text-gray-300 hover:text-noon-gold"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-2 rounded-xl bg-noon-dark border border-noon-border text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 6: QR CODE --- */}
        {activeTab === 'qr' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Permanent QR Code</h2>
              <p className="text-xs text-gray-400">
                This QR code points permanently to <span className="text-noon-gold font-mono">/menu/noon</span>.
                Print this for cafe tables and counter displays. It never changes when prices or items change.
              </p>
            </div>

            <div className="bg-noon-card border border-noon-gold/30 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center max-w-md mx-auto shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-noon-cardElevated border-2 border-noon-gold flex items-center justify-center mb-3">
                <span className="font-arabic font-bold text-2xl text-noon-gold leading-none">ن</span>
              </div>
              <h3 className="font-black text-xl text-white tracking-wide">NOON CAFE</h3>
              <p className="text-xs text-noon-300">{data.settings.area}, {data.settings.city}</p>

              {/* QR Canvas */}
              <div className="mt-5 p-4 bg-white rounded-3xl border-4 border-noon-gold/40 shadow-xl">
                <canvas ref={qrCanvasRef} className="rounded-xl" />
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Scan with any smartphone camera to open the menu instantly.
              </p>

              <button
                onClick={() => {
                  if (qrCanvasRef.current) {
                    const link = document.createElement('a');
                    link.download = 'noon-cafe-kismatpur-qr.png';
                    link.href = qrCanvasRef.current.toDataURL('image/png');
                    link.click();
                  }
                }}
                className="mt-5 w-full py-3 rounded-xl bg-noon-gold hover:bg-noon-goldHover text-noon-dark font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-noon-gold/20 active:scale-95 transition-all"
              >
                <span>Download High-Res QR Code</span>
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 7: SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">Cafe Settings</h2>
              <p className="text-xs text-gray-400">Edit branding, contact details, social links and address.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-noon-card border border-noon-border rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    Cafe Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={data.settings.name}
                    className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-noon-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    defaultValue={data.settings.tagline}
                    className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-noon-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    Welcome Subtext (Greeting)
                  </label>
                  <input
                    type="text"
                    name="welcomeSubtext"
                    defaultValue={data.settings.welcomeSubtext}
                    className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-noon-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    name="instagramUrl"
                    defaultValue={data.settings.instagramUrl}
                    className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-noon-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    name="area"
                    defaultValue={data.settings.area}
                    className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-noon-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={data.settings.city}
                    className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-noon-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Full Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  defaultValue={data.settings.address}
                  className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-noon-gold"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="halalCertified"
                    defaultChecked={data.settings.halalCertified}
                    className="w-4 h-4 rounded text-noon-gold accent-noon-gold"
                  />
                  <span className="text-xs font-bold text-gray-300">
                    Display 100% Halal Certified Mark
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-noon-gold hover:bg-noon-goldHover text-noon-dark font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-noon-gold/20 active:scale-95 transition-all mt-4"
              >
                <Save className="w-4 h-4" />
                <span>Save Cafe Settings</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* --- MODAL 1: ADD/EDIT MENU ITEM --- */}
      {isItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsItemModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-noon-card border border-noon-border rounded-3xl p-5 sm:p-6 z-10 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">
              {data.items.some((i) => i.id === editingItem.id) ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Image preview & upload */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                  Food Photograph
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-noon-dark border border-noon-border flex-shrink-0">
                    <Image
                      src={editingItem.image || '/images/placeholder-food.svg'}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3.5 py-2 rounded-xl bg-noon-dark hover:bg-noon-cardElevated border border-noon-border text-xs font-bold text-noon-gold flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Real Photograph'}</span>
                    </button>
                    <p className="text-[10px] text-gray-400">
                      Upload from phone or computer without touching code.
                    </p>
                  </div>
                </div>

                {/* Direct URL alternative */}
                <input
                  type="text"
                  value={editingItem.image || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  placeholder="Or enter direct image URL"
                  className="mt-2 w-full bg-noon-dark border border-noon-border rounded-xl px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-noon-gold"
                />
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Plain Salted Fries"
                  className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-noon-gold"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-noon-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingItem.categoryId}
                    onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                    className="w-full bg-noon-dark border border-noon-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-noon-gold"
                  >
                    {data.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Optional details for item modal (Leave blank if none)"
                  className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-noon-gold"
                />
              </div>

              {/* Flags */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isNew || false}
                    onChange={(e) => setEditingItem({ ...editingItem, isNew: e.target.checked })}
                    className="w-4 h-4 rounded text-noon-gold accent-noon-gold"
                  />
                  <span className="text-xs font-semibold text-gray-300">
                    Mark as &ldquo;New at Noon&rdquo;
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isAvailable !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-noon-gold accent-noon-gold"
                  />
                  <span className="text-xs font-semibold text-gray-300">
                    Available on Menu
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-noon-dark border border-noon-border text-gray-300 text-xs font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-noon-gold hover:bg-noon-goldHover text-noon-dark font-extrabold text-xs shadow-lg"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD/EDIT CATEGORY --- */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsCategoryModalOpen(false)}
          />

          <div className="relative w-full max-w-sm bg-noon-card border border-noon-border rounded-3xl p-5 sm:p-6 z-10 shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-3">
              {data.categories.some((c) => c.id === editingCategory.id) ? 'Rename Category' : 'Add Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value.toUpperCase(),
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    })
                  }
                  placeholder="e.g. CRUSHERS"
                  className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-noon-gold"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-noon-dark border border-noon-border text-gray-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-noon-gold hover:bg-noon-goldHover text-noon-dark font-extrabold text-xs shadow"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ADD/EDIT OFFER --- */}
      {isOfferModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOfferModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-noon-card border border-noon-border rounded-3xl p-5 sm:p-6 z-10 shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-3">
              {data.offers.some((o) => o.id === editingOffer.id) ? 'Edit Offer' : 'Create Offer'}
            </h3>

            <form onSubmit={handleSaveOffer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Offer Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingOffer.title}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  placeholder="e.g. Free Chai with Club Sandwich"
                  className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-noon-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Validity Text
                </label>
                <input
                  type="text"
                  value={editingOffer.validityText}
                  onChange={(e) => setEditingOffer({ ...editingOffer, validityText: e.target.value })}
                  placeholder="e.g. This weekend only"
                  className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-noon-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingOffer.description}
                  onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                  placeholder="Details of the deal"
                  className="w-full bg-noon-dark border border-noon-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-noon-gold"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingOffer.isActive}
                    onChange={(e) => setEditingOffer({ ...editingOffer, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-noon-gold accent-noon-gold"
                  />
                  <span className="text-xs font-semibold text-gray-300">
                    Active (Show on Customer Menu)
                  </span>
                </label>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-noon-dark border border-noon-border text-gray-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-noon-gold hover:bg-noon-goldHover text-noon-dark font-extrabold text-xs shadow"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
