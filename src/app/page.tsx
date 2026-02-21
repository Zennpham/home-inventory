'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Package,
  AlertTriangle,
  Plus,
  ChevronRight,
  TrendingDown,
  MapPin,
  ShoppingCart,
  Upload,
  Users,
  Clock,
  CreditCard,
  FolderOpen,
  FileCode
} from 'lucide-react';

import UserBadge from '@/components/UserBadge';
import { useUser, usePermission } from '@/contexts/UserContext';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalItems: 0, expiringSoon: 0, lowStock: 0 });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { role } = useUser();
  const isAdmin = role === 'admin';
  const canAddItems = usePermission('canAddItems');

  useEffect(() => {
    async function fetchData() {
      try {
        const [itemsRes, remindersRes, locRes] = await Promise.all([
          fetch('/api/items'),
          fetch('/api/reminders'),
          fetch('/api/locations')
        ]);
        const itemsData = await itemsRes.json();
        const remindersData = await remindersRes.json();
        const locData = await locRes.json();

        setItems(itemsData);
        setLocations(locData);
        setStats({
          totalItems: itemsData.length,
          expiringSoon: remindersData.alerts.filter((a: any) => a.type === 'expiry').length,
          lowStock: remindersData.alerts.filter((a: any) => a.type === 'low-stock').length,
        });
        setAlerts(remindersData.alerts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, items]);

  if (loading) return (
    <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1.5">
          <div className="w-36 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
          <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        </div>
        <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
      </div>
      <div className="w-full h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse mb-5"></div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>)}
      </div>
      <div className="space-y-3">
        <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-14 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-3 md:p-4 max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-black tracking-tight">KHO NHÀ 🏠</h1>
            <p className="text-[10px] uppercase font-bold text-zinc-400">{stats.totalItems} MÓN ĐỒ TRONG KHO</p>
          </div>
          <UserBadge />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm món đồ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white border-transparent"
          />
        </div>

        {/* Search Results */}
        {searchQuery.length > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 z-10 relative"
          >
            {searchResults.length > 0 ? searchResults.map(item => (
              <Link key={item._id} href={`/items/${item._id}`} className="flex items-center gap-2 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                  {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-1.5 text-zinc-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                    <span className={item.quantity <= item.minStock ? 'text-rose-600 font-black' : ''}>
                      {item.quantity}/{item.minStock} {item.unit}
                    </span>
                    {item.location?.name && (
                      <>
                        <span className="opacity-30">•</span>
                        <span className="truncate">{item.location.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />
              </Link>
            )) : (
              <p className="p-4 text-center text-xs text-zinc-500 font-medium italic">Không tìm thấy món nào</p>
            )}
          </motion.div>
        )}
      </header>

      {/* Alert Banner */}
      {(stats.expiringSoon > 0 || stats.lowStock > 0) && (
        <div className="mb-4 p-2.5 bg-rose-50 dark:bg-rose-950/20 rounded-xl flex items-center gap-3 text-[11px] font-bold border border-rose-100 dark:border-rose-900/40">
          {stats.expiringSoon > 0 && (
            <div className="flex items-center gap-1.5 text-rose-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{stats.expiringSoon} HẾT HẠN</span>
            </div>
          )}
          {stats.lowStock > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{stats.lowStock} SẮP HẾT</span>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions - Primary */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {canAddItems && (
          <Link href="/items/new" className="p-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl flex items-center gap-2 group active:scale-95 transition-all">
            <Plus className="w-5 h-5 flex-shrink-0 group-hover:rotate-90 transition-transform" />
            <span className="text-[10px] font-black uppercase">Thêm đồ</span>
          </Link>
        )}
        <Link href="/audit" className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center gap-2 active:scale-95 transition-all">
          <Clock className="w-5 h-5 text-zinc-500 flex-shrink-0" />
          <span className="text-[10px] font-black uppercase text-zinc-700 dark:text-zinc-300">Lịch sử</span>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <Link href="/blueprint" className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 rounded-xl text-center active:scale-95 transition-all">
          <MapPin className="w-5 h-5 mx-auto mb-1" />
          <span className="text-[10px] font-black uppercase">Bản vẽ</span>
        </Link>
        <Link href="/locations" className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl text-center active:scale-95 transition-all">
          <FolderOpen className="w-5 h-5 mx-auto mb-1" />
          <span className="text-[10px] font-black uppercase">Kho/Tủ</span>
        </Link>
        <Link href="/shopping" className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl text-center active:scale-95 transition-all">
          <ShoppingCart className="w-5 h-5 mx-auto mb-1" />
          <span className="text-[10px] font-black uppercase">Mua sắm</span>
        </Link>
        <Link href="/items" className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl text-center active:scale-95 transition-all">
          <Package className="w-5 h-5 mx-auto mb-1" />
          <span className="text-[10px] font-black uppercase">Kho đồ</span>
        </Link>
      </div>

      {/* Admin Panel - Full Access */}
      {isAdmin && (
        <section className="mb-4">
          <p className="text-[10px] font-black uppercase text-purple-600 mb-2 tracking-widest px-1">ADMINISTRATOR CONTROL</p>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/admin/import" className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors">
              <Upload className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold">Bulk Import</span>
            </Link>
            <Link href="/api-docs" className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors">
              <FileCode className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold">Full API</span>
            </Link>
            <Link href="/family" className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold">Roles & Users</span>
            </Link>
            <Link href="/categories" className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors">
              <FolderOpen className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold">Categories</span>
            </Link>
            <Link href="/subscriptions" className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold">Services</span>
            </Link>
          </div>
        </section>
      )}

      {/* Alerts List */}
      {alerts.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">DASHBOARD ALERTS</p>
            <button
              onClick={async () => {
                const res = await fetch('/api/notifications/scan', { method: 'POST' });
                const data = await res.json();
                alert(data.message);
                window.location.reload();
              }}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors flex justify-center items-center gap-1"
            >
              <Search className="w-3 h-3" /> Quét cảnh báo
            </button>
          </div>
          <div className="space-y-1.5">
            {alerts.slice(0, 3).map((alert, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className={`w-1.5 h-1.5 rounded-full ${alert.type === 'expiry' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate leading-none mb-1 text-zinc-900 dark:text-white">{alert.message}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">{alert.locationName}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-200" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">RECENTLY ADDED</p>
          <Link href="/items" className="text-[10px] font-black text-blue-600 uppercase hover:underline">View All</Link>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {items.slice(0, 4).map(item => (
            <Link key={item._id} href={`/items/${item._id}`} className="flex items-center gap-2.5 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-2 text-zinc-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate leading-none mb-1 text-zinc-900 dark:text-white">{item.name}</p>
                <div className="flex items-center gap-1.5 font-bold text-zinc-400 text-[10px] uppercase">
                  <span>{item.quantity} {item.unit}</span>
                  <span className="opacity-30">•</span>
                  <span className="truncate">{item.location?.name || 'NO LOCATION'}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-200" />
            </Link>
          ))}
        </div>
      </section>

      {/* Locations Preview */}
      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">ROOMS & AREAS</p>
          <Link href="/locations" className="text-[10px] font-black text-blue-600 uppercase hover:underline">Explore Map</Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {locations.filter(l => l.type === 'room').slice(0, 3).map(room => (
            <Link key={room._id} href={`/location/${room.nfcId}`} className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl active:scale-95 transition-all">
              <div className="text-xl font-black text-zinc-900 dark:text-white mb-0.5 leading-none">{room.totalItemCount || 0}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase truncate">{room.name}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
