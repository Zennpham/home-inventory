'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Package,
  AlertTriangle,
  Clock,
  Plus,
  Zap,
  ChevronRight,
  TrendingDown,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShoppingCart
} from 'lucide-react';

import SemanticPath from '@/components/SemanticPath';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    expiringSoon: 0,
    lowStock: 0,
    maintenanceTasks: 0
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ items: any[], locations: any[] }>({ items: [], locations: [] });

  useEffect(() => {
    async function fetchData() {
      try {
        const [itemsRes, remindersRes, locRes, actRes] = await Promise.all([
          fetch('/api/items'),
          fetch('/api/reminders'),
          fetch('/api/locations'),
          fetch('/api/activities')
        ]);

        const itemsData = await itemsRes.json();
        const remindersData = await remindersRes.json();
        const locData = await locRes.json();
        const actData = await actRes.json();

        setItems(itemsData);
        setLocations(locData);
        setActivities(actData);
        setStats({
          totalItems: itemsData.length,
          expiringSoon: remindersData.alerts.filter((a: any) => a.type === 'expiry').length,
          lowStock: remindersData.alerts.filter((a: any) => a.type === 'low-stock').length,
          maintenanceTasks: remindersData.alerts.filter((a: any) => a.type === 'maintenance').length,
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
      const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const filteredLocs = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.path?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults({ items: filteredItems, locations: filteredLocs });
    } else {
      setSearchResults({ items: [], locations: [] });
    }
  }, [searchQuery, items, locations]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* Minimalist Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Chào Ngân 👋</h1>
            <p className="text-sm text-zinc-500">Bạn có {stats.totalItems} đồ đạc, {stats.expiringSoon + stats.lowStock} cần chú ý</p>
          </div>
          <Link href="/items/new" className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:scale-105 transition-transform">
            <Plus className="w-4 h-4" />
            Thêm
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm"
          />
        </div>

        {/* Search Results */}
        {searchQuery.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 max-h-96 overflow-y-auto"
          >
            {searchResults.items.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-zinc-500 mb-2 font-medium">Đồ đạc</p>
                <div className="space-y-1">
                  {searchResults.items.map(item => (
                    <Link key={item._id} href={`/items/${item._id}`} className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors group">
                      <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                        {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-2 text-zinc-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-zinc-500">{item.quantity} {item.unit}</p>
                          {item.pathSegments && <SemanticPath segments={item.pathSegments} showIcon={false} className="text-[10px]" />}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {searchResults.locations.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2 font-medium">Vị trí</p>
                <div className="space-y-1">
                  {searchResults.locations.map(loc => (
                    <Link key={loc._id} href={`/location/${loc.nfcId}`} className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{loc.name}</p>
                        <p className="text-xs text-zinc-500">{loc.totalItemCount} món</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {searchResults.items.length === 0 && searchResults.locations.length === 0 && (
              <p className="text-center text-sm text-zinc-500 py-4">Không tìm thấy</p>
            )}
          </motion.div>
        )}
      </header>

      {/* Stats Cards - Minimal */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Link href="/items" className="glass-card p-8 rounded-3xl hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black mb-1">{stats.totalItems}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tổng đồ</div>
        </Link>
        <Link href="/items" className="glass-card p-8 rounded-3xl border-rose-100 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/10 hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black mb-1 text-rose-600">{stats.expiringSoon}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-rose-600/60">Hết hạn</div>
        </Link>
        <Link href="/shopping" className="glass-card p-8 rounded-3xl border-amber-100 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10 hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black mb-1 text-amber-600">{stats.lowStock}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">Sắp hết</div>
        </Link>
        <Link href="/items" className="glass-card p-8 rounded-3xl border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/10 hover:-translate-y-1 transition-all">
          <div className="text-3xl font-black mb-1 text-blue-600">{stats.maintenanceTasks}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-blue-600/60">Bảo trì</div>
        </Link>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <Link href="/items/new" className="glass-card p-10 rounded-[40px] hover:scale-[1.02] transition-transform">
              <Plus className="w-8 h-8 mb-4 text-zinc-400" />
              <div className="text-xl font-black">Thêm đồ</div>
            </Link>
            <Link href="/audit" className="glass-card p-10 rounded-[40px] hover:scale-[1.02] transition-transform">
              <Clock className="w-8 h-8 mb-4 text-zinc-400" />
              <div className="text-xl font-black">Kiểm kê</div>
            </Link>
            <Link href="/shopping" className="glass-card p-10 rounded-[40px] border-amber-100 dark:border-amber-900 shadow-xl shadow-amber-50 dark:shadow-none hover:scale-[1.02] transition-transform">
              <ShoppingCart className="w-8 h-8 mb-4 text-amber-500" />
              <div className="text-xl font-black">Mua sắm</div>
            </Link>
          </div>

          {/* Recent Items */}
          <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Mới thêm gần đây</h2>
              <Link href="/items" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Xem tất cả →</Link>
            </div>
            <div className="space-y-2">
              {items.slice(0, 5).map(item => (
                <Link key={item._id} href={`/items/${item._id}`} className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-2 text-zinc-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-zinc-500">{item.quantity} {item.unit}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </Link>
              ))}
            </div>
          </section>

          {/* Locations Grid */}
          <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Phòng & Vị trí</h2>
              <Link href="/locations" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Xem tất cả →</Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {locations.filter(l => l.type === 'room').slice(0, 6).map(room => (
                <Link key={room._id} href={`/location/${room.nfcId}`} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-900 dark:hover:border-white transition-colors">
                  <div className="text-lg font-bold mb-1">{room.totalItemCount}</div>
                  <div className="text-xs text-zinc-500 truncate">{room.name}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Subscriptions */}
          <Link href="/subscriptions" className="block border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-900 dark:hover:border-white transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">Dịch vụ & Đăng ký</div>
                <div className="text-xs text-zinc-500">Quản lý gia hạn tự động</div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>
          </Link>
        </div>

        {/* Right Column - Alerts & Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Alerts */}
          <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Cảnh báo</h2>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-start gap-2">
                      {alert.type === 'expiry' && <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />}
                      {alert.type === 'low-stock' && <TrendingDown className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                      {alert.type === 'maintenance' && <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-0.5">{alert.message}</p>
                        <p className="text-xs text-zinc-500 truncate">{alert.locationName}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                  <p className="text-xs text-zinc-500">Không có cảnh báo</p>
                </div>
              )}
            </div>
          </section>

          {/* Activity */}
          <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Hoạt động gần đây</h2>
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.slice(0, 6).map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${act.type === 'add' ? 'bg-emerald-500' : act.type === 'remove' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{act.itemId?.name || 'Unknown'}</p>
                      <p className="text-xs text-zinc-500">
                        {act.type === 'add' ? '+' : '-'}{act.amount > 0 ? act.amount : ''} • {new Date(act.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-zinc-500 py-8">Chưa có hoạt động</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
