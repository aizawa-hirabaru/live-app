import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, User, Ticket, CreditCard, Sparkles, Heart, Star, AlertCircle, Clock, CheckSquare } from 'lucide-react';
import { LiveEvent, EventStatus, EventCategory } from '../types';

interface LiveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: any) => void;
  initialEvent?: LiveEvent | null;
  events?: LiveEvent[];
}

const ARTIST_COLORS = [
  { name: 'パープル', value: '#9333ea' },
  { name: 'ピンク', value: '#ec4899' },
  { name: 'レッド', value: '#ef4444' },
  { name: 'ライトレッド', value: '#DC143C' },
  { name: 'オレンジ', value: '#f97316' },
  { name: 'イエロー', value: '#eab308' },
  { name: 'グリーン', value: '#22c55e' },
  { name: 'エメラルド', value: '#10b981' },
  { name: 'シアン', value: '#06b6d4' },
  { name: 'ブルー', value: '#3b82f6' },
  { name: 'インディゴ', value: '#6366f1' },
  { name: 'グレー', value: '#6b7280' },
  { name: 'ブラック', value: '#1f2937' },
  { name: 'ホワイト', value: '#ffffff' }
];

const STATUS_OPTIONS: { value: EventStatus; label: string; color: string; bg: string; border: string }[] = [
  { value: 'before_apply', label: '申込前', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
  { value: 'applied', label: '申込済', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { value: 'won', label: '当選 🎉', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { value: 'lost', label: '落選 😢', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' }
];

export default function LiveFormModal({ isOpen, onClose, onSave, initialEvent, events }: LiveFormModalProps) {
  const [category, setCategory] = useState<EventCategory>('my_live');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [color, setColor] = useState('#9333ea');
  const [dateTime, setDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [venue, setVenue] = useState('');
  const [ticketCount, setTicketCount] = useState(1);
  const [price, setPrice] = useState<number | ''>('');
  const [announcementDate, setAnnouncementDate] = useState('');
  const [status, setStatus] = useState<EventStatus>('before_apply');
  const [memo, setMemo] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [memories, setMemories] = useState('');
  const [isAttended, setIsAttended] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialEvent) {
      setCategory(initialEvent.category || 'my_live');
      setTitle(initialEvent.title || '');
      setArtist(initialEvent.artist || '');
      setColor(initialEvent.color || '#9333ea');
      setDateTime(initialEvent.dateTime || '');
      setEndDateTime(initialEvent.endDateTime || '');
      setVenue(initialEvent.venue || '');
      setTicketCount(initialEvent.ticketCount || 1);
      setPrice(initialEvent.price !== undefined ? initialEvent.price : '');
      setAnnouncementDate(initialEvent.announcementDate ? initialEvent.announcementDate.split('T')[0] : '');
      setStatus(initialEvent.status || 'before_apply');
      setMemo(initialEvent.memo || '');
      setRating(initialEvent.rating || 5);
      setMemories(initialEvent.memories || '');
      setIsAttended(initialEvent.isAttended || false);
    } else {
      // Set default values for new event
      setCategory('my_live');
      setTitle('');
      setArtist('');
      setColor('#9333ea');
      
      // Default datetime: tomorrow at 18:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0] + 'T18:00';
      setDateTime(tomorrowStr);
      setEndDateTime('');
      
      setVenue('');
      setTicketCount(1);
      setPrice('');
      setAnnouncementDate('');
      setStatus('before_apply');
      setMemo('');
      setRating(5);
      setMemories('');
      setIsAttended(false);
    }
    setErrors({});
  }, [initialEvent, isOpen]);

  // When status changes, adjust attendance
  useEffect(() => {
    if (status !== 'won') {
      setIsAttended(false);
    }
  }, [status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = category === 'holiday' ? '休みの日の名称を入力してください' : '公演名を入力してください';
    }
    
    if (category === 'my_live' || category === 'tour_all') {
      if (!artist.trim()) newErrors.artist = 'アーティストを入力してください';
    }
    
    if (!dateTime) {
      newErrors.dateTime = (category === 'holiday' || category === 'tour_all') ? '開始日を選択してください' : '日時を選択してください';
    }

    if ((category === 'holiday' || category === 'tour_all') && dateTime && endDateTime) {
      const startDateYMD = dateTime.split('T')[0];
      const endDateYMD = endDateTime.split('T')[0];
      if (endDateYMD < startDateYMD) {
        newErrors.endDateTime = '終了日は開始日以降の日付を選択してください';
      }
    }
    
    if (category === 'my_live') {
      if (!venue.trim()) newErrors.venue = '会場を入力してください';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: initialEvent?.id,
      category,
      title: title.trim(),
      artist: category === 'holiday' ? '自分' : artist.trim(),
      dateTime,
      endDateTime: (category === 'holiday' || category === 'tour_all') && endDateTime ? endDateTime : undefined,
      venue: category === 'holiday' ? undefined : (venue.trim() || undefined),
      ticketCount: category === 'my_live' ? ticketCount : undefined,
      price: category === 'my_live' && price !== '' ? Number(price) : undefined,
      announcementDate: category === 'my_live' && announcementDate ? announcementDate : undefined,
      status: category === 'my_live' ? status : undefined,
      memo: category === 'holiday' ? undefined : (memo.trim() || undefined),
      rating: category === 'my_live' && status === 'won' && isAttended ? rating : undefined,
      memories: category === 'my_live' && status === 'won' && isAttended ? memories.trim() || undefined : undefined,
      isAttended: category === 'my_live' && status === 'won' ? isAttended : false,
      color: category !== 'holiday' ? color : undefined,
      createdAt: initialEvent?.createdAt || new Date().toISOString()
    });
    
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            id="modal-backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col z-10 border border-purple-100"
            id="modal-container"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-purple-50/20">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  {initialEvent ? '予定の編集' : '新しい予定の登録'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  参戦公演、他公演のツアー日程、自分の休みを登録し、カレンダーで被りをチェックできます
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                id="close-modal-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Category Tab Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  予定の区分を選択
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCategory('my_live')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                      category === 'my_live'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    id="cat-tab-my-live"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    参戦・申込
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('tour_all')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                      category === 'tour_all'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    id="cat-tab-tour-all"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    ツアー他日程
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('holiday')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                      category === 'holiday'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    id="cat-tab-holiday"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    自分の休み
                  </button>
                </div>
              </div>

              {/* Title & Artist/Owner */}
              <div className={category === 'holiday' ? 'grid grid-cols-1' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    {category === 'holiday' ? '休みの日の名称' : '公演名・タイトル'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      category === 'holiday' 
                        ? '例: 有給休暇、お盆休み、午後休' 
                        : category === 'tour_all' 
                          ? '例: Live Tour 2026 (大阪公演)' 
                          : '例: Dream Spark Tour 2026'
                    }
                    className={`w-full border ${errors.title ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200 focus:ring-purple-500/20 focus:border-purple-500'} rounded-xl px-4 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm`}
                    id="form-title"
                  />
                  {errors.title && (
                    <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.title}
                    </p>
                  )}
                </div>

                {category !== 'holiday' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-500" />
                      アーティスト <span className="text-rose-500"> *</span>
                    </label>
                    <input
                      type="text"
                      value={artist}
                      onChange={(e) => {
                        const val = e.target.value;
                        setArtist(val);
                        if (val && events) {
                          const existing = events.find(
                            (evt) =>
                              evt.category !== 'holiday' &&
                              evt.artist &&
                              evt.artist.trim().toLowerCase() === val.trim().toLowerCase() &&
                              evt.color
                          );
                          if (existing && existing.color) {
                            setColor(existing.color);
                          }
                        }
                      }}
                      placeholder="例: なつめ莉愛"
                      className={`w-full border ${errors.artist ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200 focus:ring-purple-500/20 focus:border-purple-500'} rounded-xl px-4 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm`}
                      id="form-artist"
                      list="artists-datalist"
                    />
                    <datalist id="artists-datalist">
                      {Array.from(
                        new Set(
                          (events || [])
                            .filter((evt) => evt.category !== 'holiday' && evt.artist)
                            .map((evt) => evt.artist.trim())
                        )
                      ).map((art) => (
                        <option key={art} value={art} />
                      ))}
                    </datalist>
                    {errors.artist && (
                      <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.artist}
                      </p>
                    )}

                    {/* Artist Color Picker */}
                    <div className="mt-3">
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                        アーティストカラー
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ARTIST_COLORS.map((col) => {
                          const isSelected = color === col.value;
                          return (
                            <button
                              key={col.value}
                              type="button"
                              onClick={() => setColor(col.value)}
                              className={`w-6 h-6 rounded-full cursor-pointer transition-all border border-black/5 ${
                                isSelected ? 'ring-2 ring-offset-2 ring-purple-600 scale-110' : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: col.value }}
                              title={col.name}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date/Time & Venue & Range */}
              {(category === 'holiday' || category === 'tour_all') ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        開始日 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={dateTime ? dateTime.split('T')[0] : ''}
                        onChange={(e) => setDateTime(e.target.value)}
                        className={`w-full border ${errors.dateTime ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200 focus:ring-purple-500/20 focus:border-purple-500'} rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 transition-all text-sm`}
                        id="form-datetime"
                      />
                      {errors.dateTime && (
                        <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.dateTime}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        終了日 <span className="text-xs text-gray-400">(複数日にまたがる場合・任意)</span>
                      </label>
                      <input
                        type="date"
                        value={endDateTime ? endDateTime.split('T')[0] : ''}
                        onChange={(e) => setEndDateTime(e.target.value)}
                        className={`w-full border ${errors.endDateTime ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200 focus:ring-purple-500/20 focus:border-purple-500'} rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 transition-all text-sm`}
                        id="form-end-datetime"
                      />
                      {errors.endDateTime && (
                        <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.endDateTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {category === 'tour_all' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        会場 <span className="text-xs text-gray-400">(任意)</span>
                      </label>
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="例: 日本武道館、横浜アリーナ"
                        className="w-full border border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 rounded-xl px-4 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm"
                        id="form-venue-tour"
                        list="venues-datalist"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Original single dateTime and Venue grid for my_live */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      公演日時 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className={`w-full border ${errors.dateTime ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200 focus:ring-purple-500/20 focus:border-purple-500'} rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 transition-all text-sm`}
                      id="form-datetime"
                    />
                    {errors.dateTime && (
                      <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.dateTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      会場 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="例: 日本武道館、横浜アリーナ"
                      className={`w-full border ${errors.venue ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200 focus:ring-purple-500/20 focus:border-purple-500'} rounded-xl px-4 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm`}
                      id="form-venue"
                      list="venues-datalist"
                    />
                    <datalist id="venues-datalist">
                      {Array.from(
                        new Set(
                          (events || [])
                            .filter((evt) => evt.category !== 'holiday' && evt.venue)
                            .map((evt) => evt.venue!.trim())
                        )
                      ).map((ven) => (
                        <option key={ven} value={ven} />
                      ))}
                    </datalist>
                    {errors.venue && (
                      <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.venue}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tickets, Price & Announcement Date - ONLY for my_live */}
              {category === 'my_live' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5 text-gray-400" />
                      枚数
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                      id="form-ticket-count"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                      チケット代 (1枚あたり)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="例: 9000"
                        className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                        id="form-price"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      当落発表日
                    </label>
                    <input
                      type="date"
                      value={announcementDate}
                      onChange={(e) => setAnnouncementDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                      id="form-announcement-date"
                    />
                  </div>
                </div>
              )}

              {/* Status Picker - ONLY for my_live */}
              {category === 'my_live' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">
                    当落・お申込ステータス
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {STATUS_OPTIONS.map((opt) => {
                      const isSelected = status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setStatus(opt.value)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? `${opt.bg} ${opt.border} ring-2 ring-purple-500/10 font-medium scale-[1.02]`
                              : 'border-gray-200 bg-white hover:bg-gray-50/50 text-gray-500'
                          }`}
                          id={`status-opt-${opt.value}`}
                        >
                          <span className={`text-sm ${isSelected ? opt.color : 'text-gray-700'}`}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Attendance & Memory section - ONLY for my_live status === 'won' */}
              {category === 'my_live' && status === 'won' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-purple-50/20 rounded-2xl p-5 border border-purple-100/40 space-y-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-purple-600 fill-purple-100" />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">参戦記録・ライブ後の思い出</h4>
                        <p className="text-xs text-gray-500">ライブが終了したら、思い出や感想を残しましょう！</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAttended}
                        onChange={(e) => setIsAttended(e.target.checked)}
                        className="sr-only peer"
                        id="form-is-attended"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      <span className="ml-2 text-xs font-medium text-gray-700">
                        {isAttended ? '参戦完了！' : '未参戦'}
                      </span>
                    </label>
                  </div>

                  {isAttended && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-2"
                    >
                      {/* Rating */}
                      <div>
                        <span className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          ライブの満足度
                        </span>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
                              id={`rating-star-${star}`}
                            >
                              <Star
                                className={`w-7 h-7 transition-colors ${
                                  star <= rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-200'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Thoughts / Memories */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          感想・レポート（セットリストやMCのメモ、当日の出来事など）
                        </label>
                        <textarea
                          rows={4}
                          value={memories}
                          onChange={(e) => setMemories(e.target.value)}
                          placeholder="例: 会場全体がペンライトの光でいっぱいで綺麗だった！MCで推しがこっちを向いてくれた気がする。最高のセトリで忘れられない夜になりました。"
                          className="w-full border border-gray-200 rounded-xl p-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm resize-none"
                          id="form-memories"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* General Memo */}
              {category !== 'holiday' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    メモ・準備リスト・持ち物など
                  </label>
                  <textarea
                    rows={3}
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="例: 双眼鏡、ペンライトの替え電池、本人確認用の身分証を忘れずに！"
                    className="w-full border border-gray-200 rounded-xl p-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm resize-none"
                    id="form-memo"
                  />
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                id="cancel-form-button"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors shadow-sm text-sm cursor-pointer hover:shadow-md active:scale-95 flex items-center gap-1.5"
                id="submit-form-button"
              >
                <Sparkles className="w-4 h-4" />
                {initialEvent ? '変更を保存する' : 'この予定を登録する'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
