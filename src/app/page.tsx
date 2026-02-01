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
  MapPin
} from 'lucide-react';

import { BarChart3, PieChart, History, ArrowRight } from 'lucide-react';
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Chào <span className="gradient-text">Ngân</span>,
          </h1>
          <p className="text-zinc-500 text-lg font-medium">Hệ thống kho gia đình của bạn đang ổn định.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto relative">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
          <Link href="/items/new" className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-105 transition-transform">
            <Plus className="w-6 h-6" />
          </Link>

          {/* Search Results Dropdown */}
          {searchQuery.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-20 right-0 w-full md:w-[600px] bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-zinc-100 dark:border-zinc-800 z-50 p-8 max-h-[70vh] overflow-y-auto"
            >
              <div className="space-y-10">
                {searchResults.items.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-4">
                      Đồ đạc tìm thấy <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
                    </h4>
                    <div className="space-y-3">
                      {searchResults.items.map(item => (
                        <Link key={item._id} href={`/items/${item._id}`} className="flex items-center gap-5 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-3xl transition-all group">
                          <div className="w-14 h-14 bg-indigo-50 dark:bg-zinc-800 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                            {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover rounded-2xl" /> : <Package className="w-6 h-6" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-base leading-tight mb-1 truncate">{item.name}</p>
                            <SemanticPath segments={item.pathSegments || []} showIcon={false} />
                          </div>
                          <div className="text-right">
                            <p className="font-black text-indigo-500">{item.quantity} {item.unit}</p>
                            <p className="text-[8px] font-black uppercase text-zinc-300">Stock</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.locations.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-4">
                      Vị trí liên quan <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
                    </h4>
                    <div className="space-y-3">
                      {searchResults.locations.map(loc => (
                        <Link key={loc._id} href={`/location/${loc.nfcId}`} className="flex items-center gap-5 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-3xl transition-all group">
                          <div className="w-14 h-14 bg-emerald-50 dark:bg-zinc-800 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                            <MapPin className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-base leading-tight mb-1 truncate">{loc.name}</p>
                            <SemanticPath segments={loc.pathSegments || []} showIcon={false} />
                          </div>
                          <div className="text-right">
                            <p className="font-black text-emerald-500">{loc.totalItemCount}</p>
                            <p className="text-[8px] font-black uppercase text-zinc-300">Items</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.items.length === 0 && searchResults.locations.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 text-zinc-300" />
                    </div>
                    <p className="text-zinc-500 font-bold">Không tìm thấy kết quả nào khớp.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Package className="w-6 h-6 text-indigo-500" />}
          label="Tổng đồ đạc"
          value={stats.totalItems}
          link="/items"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6 text-rose-500" />}
          label="Sắp hết hạn"
          value={stats.expiringSoon}
          link="/items"
        />
        <StatCard
          icon={<TrendingDown className="w-6 h-6 text-amber-500" />}
          label="Sắp hết"
          value={stats.lowStock}
          link="/shopping"
        />
        <StatCard
          icon={<Zap className="w-6 h-6 text-emerald-500" />}
          label="Cần bảo trì"
          value={stats.maintenanceTasks}
          link="/items"
        />
      </section>

      {/* Main Grid: Data Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recently Added Widget */}
            <section className="bg-white dark:bg-zinc-900 rounded-[48px] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black">Mới thêm</h2>
                <Link href="/items" className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-full hover:bg-zinc-100 transition-all"><ArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="space-y-4">
                {items.slice(0, 3).map(item => (
                  <Link key={item._id} href={`/items/${item._id}`} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl overflow-hidden flex-shrink-0">
                      {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-3 text-zinc-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm leading-tight group-hover:text-indigo-500 transition-colors truncate">{item.name}</p>
                      <SemanticPath segments={item.pathSegments?.slice(0, -1) || []} showIcon={false} disableLinks={true} className="opacity-60" />
                    </div>
                  </Link>
                ))}
              </div>
              <BarChart3 className="absolute -bottom-6 -right-6 w-32 h-32 text-zinc-50 dark:text-zinc-800 opacity-50 pointer-events-none" />
            </section>

            {/* Browse Sections Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Browse Rooms Widget */}
              <div className="bg-zinc-900 rounded-[48px] p-8 text-white relative overflow-hidden group">
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h2 className="text-xl font-black">Duyệt phòng</h2>
                  <Link href="/locations" className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-all"><ArrowRight className="w-4 h-4" /></Link>
                </div>
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {locations.filter(l => l.type === 'room').slice(0, 4).map(room => (
                    <Link key={room._id} href={`/location/${room.nfcId}`} className="p-4 bg-zinc-800 rounded-3xl hover:bg-white hover:text-black transition-all">
                      <p className="font-black text-xs uppercase tracking-widest mb-1 text-zinc-400">{room.totalItemCount} món</p>
                      <p className="font-bold text-sm truncate">{room.name}</p>
                    </Link>
                  ))}
                </div>
                <MapPin className="absolute -bottom-8 -right-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform" />
              </div>

              {/* Digital Services Widget */}
              <div className="bg-indigo-50 dark:bg-zinc-900 rounded-[48px] p-8 border border-indigo-100 dark:border-zinc-800 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h2 className="text-xl font-black text-indigo-950 dark:text-white">Dịch vụ số</h2>
                  <Link href="/subscriptions" className="p-2 bg-white dark:bg-zinc-800 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><ArrowRight className="w-4 h-4" /></Link>
                </div>
                <div className="space-y-3 relative z-10">
                  <Link href="/subscriptions" className="block p-5 bg-white dark:bg-zinc-800 rounded-3xl shadow-sm hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-xs uppercase tracking-widest text-zinc-400">Quản lý</p>
                        <p className="font-bold text-zinc-900 dark:text-white">Gia hạn & Đăng ký</p>
                      </div>
                    </div>
                  </Link>
                </div>
                <Zap className="absolute -bottom-8 -right-8 w-48 h-48 text-indigo-100 dark:text-zinc-800 opacity-50 group-hover:scale-110 transition-transform" />
              </div>
            </section>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/items/new" className="p-10 rounded-[48px] bg-indigo-600 text-white shadow-2xl shadow-indigo-100 dark:shadow-none relative overflow-hidden group">
              <Plus className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-black mb-4">Thêm đồ mới</h3>
              <p className="opacity-80 mb-8 font-medium">Lô hàng, barcode và ảnh.</p>
              <div className="flex items-center gap-2 font-black group-hover:translate-x-1 transition-transform bg-white/10 w-fit px-6 py-3 rounded-full">
                Bắt đầu ngay <ArrowRight className="w-5 h-5 text-indigo-200" />
              </div>
            </Link>

            <Link href="/audit" className="p-10 rounded-[48px] border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white relative overflow-hidden group hover:border-indigo-500 transition-all">
              <Clock className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-black mb-4">Kiểm kê</h3>
              <p className="opacity-50 mb-8 font-medium">Tối ưu cho scan vật lý.</p>
              <div className="flex items-center gap-2 font-black group-hover:translate-x-1 transition-transform bg-zinc-100 dark:bg-zinc-900 w-fit px-6 py-3 rounded-full">
                Mở Audit <ArrowRight className="w-5 h-5 opacity-50" />
              </div>
            </Link>
          </section>
        </div>

        {/* Sidebar: Smart Alerts & History */}
        <div className="space-y-8">
          <section className="glass-card p-8 flex flex-col h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">Cảnh báo</h2>
              <Link href="/items" className="text-indigo-500 text-xs font-bold uppercase tracking-widest">Xem tất cả</Link>
            </div>

            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.slice(0, 4).map((alert, index) => (
                  <AlertItem
                    key={index}
                    title={alert.message}
                    location={alert.locationName}
                    time={alert.priority === 'high' ? 'Khẩn cấp' : 'Sớm'}
                    type={alert.type}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Mọi thứ đều ổn.</p>
                </div>
              )}
            </div>
          </section>

          {/* Activity Mini Feed */}
          <section className="glass-card p-8">
            <h2 className="text-xl font-black mb-6">Lịch sử dùng đồ</h2>
            <div className="space-y-6">
              {activities.length > 0 ? (
                activities.map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${act.type === 'add' ? 'bg-emerald-500' :
                      act.type === 'remove' ? 'bg-rose-500' : 'bg-blue-500'
                      }`} />
                    <div>
                      <p className="text-sm font-bold">{act.itemId?.name || 'Unknown Item'}</p>
                      <p className="text-xs text-zinc-500">
                        {act.type === 'add' ? 'Đã thêm' : 'Đã dùng'} {act.amount > 0 ? act.amount : ''} • {new Date(act.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-zinc-500 py-4">Chưa có hoạt động nào.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, link }: any) {
  const CardContent = (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card p-6 flex flex-col h-full cursor-pointer"
    >
      <div className="mb-4">{icon}</div>
      <div className="text-zinc-500 text-sm font-black uppercase tracking-widest mb-1">{label}</div>
      <div className="text-4xl font-black">{value}</div>
    </motion.div>
  );

  return link ? <Link href={link}>{CardContent}</Link> : CardContent;
}

function AlertItem({ title, location, time, type }: any) {
  const getColors = () => {
    switch (type) {
      case 'expiry': return 'border-rose-100 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50';
      case 'low-stock': return 'border-amber-100 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50';
      case 'maintenance': return 'border-indigo-100 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50';
      default: return 'border-zinc-100 bg-zinc-50 text-zinc-700';
    }
  }

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border ${getColors()}`}>
      <div className="flex flex-col">
        <span className="font-bold">{title}</span>
        <span className="text-sm opacity-70 font-medium">{location}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-black uppercase tracking-tighter block">{time}</span>
        <button className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-50 hover:opacity-100 transition-opacity">Xử lý ngay</button>
      </div>
    </div>
  );
}

function LocationTile({ name, count, icon }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="font-medium group-hover:text-indigo-500 transition-colors">{name}</span>
      </div>
      <span className="text-sm text-zinc-400 group-hover:text-indigo-500 font-bold">{count} món</span>
    </div>
  );
}
