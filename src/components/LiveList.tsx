import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, Calendar, MapPin, User, Ticket, CreditCard, Sparkles, Heart, Star, Clock, AlertCircle, Edit, Trash2, ChevronsUpDown, CalendarClock, BellRing, HeartHandshake, Filter, CheckSquare } from 'lucide-react';
import { LiveEvent, EventStatus, SortKey, SortOrder, EventCategory } from '../types';
import { formatDateTimeJP, formatCurrency, getDaysUntil } from '../utils';

interface LiveListProps {
  events: LiveEvent[];
  onEditEvent: (event: LiveEvent) => void;
  onDeleteEvent: (id: string) => void;
  onStatusChange: (id: string, status: EventStatus) => void;
  onToggleAttended: (id: string) => void;
}

export default function LiveList({ events, onEditEvent, onDeleteEvent, onStatusChange, onToggleAttended }: LiveListProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [artistFilter, setArtistFilter] = useState<string>('all');
  
  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>('dateTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Unique artists for filtering
  const allArtists = Array.from(new Set(events.map(e => e.artist).filter(Boolean)));

  // Handle Sort Toggle
  const handleSortToggle = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder(key === 'createdAt' ? 'desc' : 'asc'); // default order per key
    }
  };

  // Filter & Search
  const filteredEvents = events.filter((e) => {
    const itemCategory = e.category || 'my_live';
    
    // 「自分の休み」および「ツアー他日程」はリスト一覧から完全に除外する
    if (itemCategory === 'holiday' || itemCategory === 'tour_all') {
      return false;
    }

    const matchesCategory = categoryFilter === 'all' || itemCategory === categoryFilter;

    // Search matches title, venue, artist, or memo
    const titleLower = e.title.toLowerCase();
    const venueLower = (e.venue || '').toLowerCase();
    const artistLower = (e.artist || '').toLowerCase();
    const memoLower = (e.memo || '').toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch = 
      titleLower.includes(searchLower) ||
      venueLower.includes(searchLower) ||
      artistLower.includes(searchLower) ||
      memoLower.includes(searchLower);
    
    // Status filter only applies to 'my_live'
    const matchesStatus = statusFilter === 'all' || (itemCategory === 'my_live' && e.status === statusFilter);
    const matchesArtist = artistFilter === 'all' || e.artist === artistFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesArtist;
  });

  // Sort logic
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let valA: string | number = '';
    let valB: string | number = '';

    if (sortKey === 'dateTime') {
      valA = a.dateTime || '';
      valB = b.dateTime || '';
    } else if (sortKey === 'announcementDate') {
      valA = a.announcementDate || '9999-12-31'; // Put events without announcement date at the end
      valB = b.announcementDate || '9999-12-31';
    } else if (sortKey === 'createdAt') {
      valA = a.createdAt || '';
      valB = b.createdAt || '';
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Render Status Badge for live events
  const renderStatusBadge = (status?: EventStatus) => {
    if (!status) return null;
    switch (status) {
      case 'won':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
            <span>当選 🎉</span>
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-rose-50 text-rose-600 rounded-full border border-rose-100">
            <span>落選 😢</span>
          </span>
        );
      case 'applied':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            <span>申込済</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-gray-50 text-gray-500 rounded-full border border-gray-100">
            <span>申込前</span>
          </span>
        );
    }
  };

  // Render Category Badge
  const renderCategoryBadge = (category?: EventCategory) => {
    const cat = category || 'my_live';
    switch (cat) {
      case 'holiday':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-teal-50 text-teal-700 rounded-full border border-teal-100">
            <span>🏖️ 休み</span>
          </span>
        );
      case 'tour_all':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-fuchsia-50 text-fuchsia-700 rounded-full border border-fuchsia-100">
            <span>他日程</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-purple-50 text-purple-700 rounded-full border border-purple-100">
            <span>🎤 参戦・申込</span>
          </span>
        );
    }
  };

  // Render countdown relative to date
  const renderCountdown = (event: LiveEvent) => {
    const cat = event.category || 'my_live';

    if (cat === 'holiday') {
      if (event.dateTime) {
        const days = getDaysUntil(event.dateTime);
        if (days !== null) {
          if (days > 0) {
            return (
              <div className="flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1.5 rounded-lg font-bold">
                <CalendarClock className="w-3.5 h-3.5" />
                <span>休みまで あと {days}日</span>
              </div>
            );
          } else if (days === 0) {
            return (
              <div className="flex items-center gap-1 text-xs text-teal-700 bg-teal-100 border border-teal-200 px-2.5 py-1.5 rounded-lg font-bold animate-bounce">
                <span>🏖️ 本日はお休みです！</span>
              </div>
            );
          } else {
            return (
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg">
                <span>終了した休日</span>
              </div>
            );
          }
        }
      }
      return null;
    }

    if (cat === 'tour_all') {
      if (event.dateTime) {
        const days = getDaysUntil(event.dateTime);
        if (days !== null) {
          if (days > 0) {
            return (
              <div className="flex items-center gap-1 text-xs text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-100 px-2.5 py-1.5 rounded-lg font-semibold">
                <CalendarClock className="w-3.5 h-3.5" />
                <span>他公演まで あと {days}日</span>
              </div>
            );
          } else {
            return (
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg">
                <span>公演終了</span>
              </div>
            );
          }
        }
      }
      return null;
    }

    // Standard my_live logic
    if (event.status === 'applied' && event.announcementDate) {
      const days = getDaysUntil(event.announcementDate);
      if (days !== null) {
        if (days > 0) {
          return (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-lg font-bold animate-pulse">
              <BellRing className="w-3.5 h-3.5" />
              <span>当落発表まで あと {days}日</span>
            </div>
          );
        } else if (days === 0) {
          return (
            <div className="flex items-center gap-1 text-xs text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-lg font-bold animate-bounce">
              <BellRing className="w-3.5 h-3.5" />
              <span>今日が当落発表日です！</span>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg">
              <span>当落発表済</span>
            </div>
          );
        }
      }
    }

    if (event.dateTime) {
      const days = getDaysUntil(event.dateTime);
      if (days !== null) {
        if (days > 0) {
          return (
            <div className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-bold ${
              event.status === 'won' 
                ? 'text-purple-700 bg-purple-50 border border-purple-100' 
                : 'text-gray-600 bg-gray-50 border border-gray-100'
            }`}>
              <CalendarClock className="w-3.5 h-3.5" />
              <span>公演まで あと {days}日</span>
            </div>
          );
        } else if (days === 0) {
          return (
            <div className="flex items-center gap-1 text-xs text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-lg font-bold animate-bounce">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>今日が公演日です！楽しんで！</span>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg">
              <span>公演終了</span>
            </div>
          );
        }
      }
    }

    return null;
  };

  return (
    <div className="space-y-6" id="live-list-view-container">
      
      {/* Dynamic Category Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl max-w-xs sm:max-w-md">
        {[
          { value: 'all', label: 'すべて', icon: SlidersHorizontal },
          { value: 'my_live', label: '参戦・申込', icon: Ticket },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = categoryFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setCategoryFilter(tab.value);
                setStatusFilter('all'); // Reset status filters if category shifts
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
              id={`tab-cat-filter-${tab.value}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters & Search Control Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-4" id="filters-container">
        {/* Row 1: Search & Sort Buttons */}
        <div className="flex flex-col md:flex-row gap-3.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="公演名、会場、メモ、アーティストで検索..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 rounded-xl text-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
              id="search-input"
            />
          </div>

          {/* Sort Buttons */}
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-gray-400 font-bold mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              並び替え:
            </span>
            <button
              onClick={() => handleSortToggle('dateTime')}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1 cursor-pointer transition-colors ${
                sortKey === 'dateTime'
                  ? 'bg-purple-600 text-white border-purple-600 font-semibold shadow-2xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              id="sort-datetime-button"
            >
              日時順
              <ChevronsUpDown className="w-3 h-3" />
            </button>
            
            {categoryFilter === 'my_live' && (
              <button
                onClick={() => handleSortToggle('announcementDate')}
                className={`px-3 py-2 rounded-xl border flex items-center gap-1 cursor-pointer transition-colors ${
                  sortKey === 'announcementDate'
                    ? 'bg-purple-600 text-white border-purple-600 font-semibold shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                id="sort-announcement-button"
              >
                当落発表日順
                <ChevronsUpDown className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={() => handleSortToggle('createdAt')}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1 cursor-pointer transition-colors ${
                sortKey === 'createdAt'
                  ? 'bg-purple-600 text-white border-purple-600 font-semibold shadow-2xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              id="sort-created-button"
            >
              追加日順
              <ChevronsUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Status/Artist filters (Show only when relevant) */}
        {(categoryFilter === 'all' || categoryFilter === 'my_live') && (
          <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-gray-50">
            {/* Status Filters */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-gray-400 font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                ステータス:
              </span>
              {[
                { value: 'all', label: 'すべて' },
                { value: 'before_apply', label: '申込前' },
                { value: 'applied', label: '申込済' },
                { value: 'won', label: '当選' },
                { value: 'lost', label: '落選' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    statusFilter === opt.value
                      ? 'bg-purple-900 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  id={`filter-status-${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Artist Filter Dropdown */}
            {allArtists.length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto text-xs">
                <span className="text-gray-400 font-bold">推し/アーティスト:</span>
                <select
                  value={artistFilter}
                  onChange={(e) => setArtistFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg py-1 px-2.5 text-xs text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500"
                  id="filter-artist-select"
                >
                  <option value="all">すべて</option>
                  {allArtists.map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* List Feed */}
      {sortedEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center text-gray-500" id="empty-list-indicator">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-base font-semibold text-gray-800">一致する予定が見つかりません</p>
          <p className="text-xs text-gray-400 mt-1">
            新しく予定を登録するか、タブ・フィルター設定を変更してください。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="lives-grid">
          <AnimatePresence mode="popLayout">
            {sortedEvents.map((e, index) => {
              const itemCategory = e.category || 'my_live';
              
              return (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-3xs p-5 hover:shadow-xs transition-all flex flex-col justify-between hover:border-purple-200 group"
                  style={{ borderLeft: `4px solid ${e.color || '#e5e7eb'}` }}
                  id={`live-card-${e.id}`}
                >
                  <div>
                    {/* Header: Badges & Actions */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {renderCategoryBadge(e.category)}
                        {itemCategory === 'my_live' && renderStatusBadge(e.status)}
                        {renderCountdown(e)}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-65 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditEvent(e)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="編集する"
                          id={`edit-btn-${e.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(e.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="削除する"
                          id={`delete-btn-${e.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Artist & Title */}
                    <div className="space-y-1 mb-4">
                      {e.artist && (
                        <p className="text-xs font-bold flex items-center gap-1" style={{ color: e.color || '#9333ea' }}>
                          <User className="w-3.5 h-3.5" style={{ color: e.color || '#9333ea' }} />
                          {e.artist}
                        </p>
                      )}
                      <h3 className="text-base font-bold text-gray-800 leading-snug line-clamp-1">
                        {e.title}
                      </h3>
                    </div>

                    {/* Meta rows (Date, Venue, Tickets) */}
                    <div className="space-y-2 text-xs text-gray-500 border-t border-b border-gray-50 py-3.5 my-3 bg-gray-50/20 px-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-700">
                          {e.endDateTime && e.endDateTime.split('T')[0] !== e.dateTime.split('T')[0] ? (
                            <>{formatDateTimeJP(e.dateTime)} 〜 {formatDateTimeJP(e.endDateTime)}</>
                          ) : (
                            formatDateTimeJP(e.dateTime)
                          )}
                        </span>
                      </div>
                      
                      {e.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600 font-medium">{e.venue}</span>
                        </div>
                      )}

                      {itemCategory === 'my_live' && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Ticket className="w-3.5 h-3.5 text-gray-400" />
                            <span>枚数: <strong className="text-gray-700">{e.ticketCount}枚</strong></span>
                          </div>
                          {e.price !== undefined && (
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                              <span>合計金額: <strong className="text-gray-700">{formatCurrency(e.price * e.ticketCount)}</strong></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer area: Announcement detailed date or General memo snippet or Memory preview */}
                  <div className="mt-3">
                    {itemCategory === 'my_live' && e.status === 'applied' && e.announcementDate && (
                      <p className="text-xs text-amber-600 bg-amber-50/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        当落発表: {formatDateTimeJP(e.announcementDate)}
                      </p>
                    )}

                    {itemCategory === 'my_live' && e.status === 'won' && (
                      <div className="flex items-center justify-between text-xs border-t border-gray-100/50 pt-2.5">
                        <span className="text-gray-500">参戦ステータス:</span>
                        <button
                          onClick={() => onToggleAttended(e.id)}
                          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            e.isAttended
                              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-3xs'
                              : 'bg-gray-100 hover:bg-purple-50 text-gray-600 hover:text-purple-600'
                          }`}
                          id={`toggle-attended-btn-${e.id}`}
                        >
                          {e.isAttended ? (
                            <>
                              <Star className="w-3.5 h-3.5 fill-current" />
                              参戦完了！ (思い出をみる)
                            </>
                          ) : (
                            <>
                              <Heart className="w-3.5 h-3.5" />
                              参戦完了にする
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {itemCategory !== 'my_live' && e.memo && (
                      <p className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg italic" title={e.memo}>
                        メモ: {e.memo}
                      </p>
                    )}

                    {itemCategory === 'my_live' && e.status !== 'applied' && e.status !== 'won' && e.memo && (
                      <p className="text-xs text-gray-400 truncate max-w-full italic" title={e.memo}>
                        メモ: {e.memo}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
