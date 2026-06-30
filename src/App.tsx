import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, ListFilter, Award, Plus, Download, Upload, Trash2, Heart, RefreshCw, Check } from 'lucide-react';
import { LiveEvent, EventStatus } from './types';
import { INITIAL_EVENTS } from './initialData';
import LiveList from './components/LiveList';
import CalendarView from './components/CalendarView';
import LiveStats from './components/LiveStats';
import LiveFormModal from './components/LiveFormModal';

export default function App() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'stats'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LiveEvent | null>(null);
  
  // File import/export alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load events from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('oshi_live_events');
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (e) {
        setEvents(INITIAL_EVENTS);
      }
    } else {
      // First-time users get a nice preset list
      setEvents(INITIAL_EVENTS);
      localStorage.setItem('oshi_live_events', JSON.stringify(INITIAL_EVENTS));
    }
  }, []);

  // Save events to localStorage when they change
  const saveEvents = (newEvents: LiveEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('oshi_live_events', JSON.stringify(newEvents));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Add/Edit Save handler
  const handleSaveEvent = (savedData: any) => {
    let updatedEvents = [...events];
    
    if (savedData.id) {
      // Editing existing event
      updatedEvents = events.map(e => e.id === savedData.id ? { ...e, ...savedData } : e);
    } else {
      // Creating new event
      const newEvent: LiveEvent = {
        ...savedData,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString()
      };
      updatedEvents = [newEvent, ...events];
    }

    // Proactively align colors for the same artist
    if (savedData.artist && savedData.color && savedData.category !== 'holiday') {
      const targetArtist = savedData.artist.trim().toLowerCase();
      updatedEvents = updatedEvents.map(e => {
        if (e.category !== 'holiday' && e.artist && e.artist.trim().toLowerCase() === targetArtist) {
          return { ...e, color: savedData.color };
        }
        return e;
      });
    }

    saveEvents(updatedEvents);
    if (savedData.id) {
      triggerToast('予定を更新しました！');
    } else {
      triggerToast('新しい予定を登録しました！');
    }
    setEditingEvent(null);
  };

  // Delete event handler
  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    saveEvents(updated);
    triggerToast('予定を削除しました。');
  };

  // Quick status change handler
  const handleStatusChange = (id: string, status: EventStatus) => {
    const updated = events.map(e => e.id === id ? { ...e, status } : e);
    saveEvents(updated);
  };

  // Quick toggle attendance
  const handleToggleAttended = (id: string) => {
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    if (event.isAttended) {
      // Mark as unattended
      const updated = events.map(e => e.id === id ? { ...e, isAttended: false } : e);
      saveEvents(updated);
      triggerToast('未参戦に戻しました。');
    } else {
      // Open modal to let user write memories and set star rating
      setEditingEvent(event);
      setIsModalOpen(true);
    }
  };

  // Quick add from calendar cell
  const handleAddEventOnDate = (dateStr: string) => {
    // Open modal with pre-filled date
    const dummyEvent: any = {
      id: '',
      category: 'my_live',
      title: '',
      artist: '',
      dateTime: `${dateStr}T18:00`,
      venue: '',
      ticketCount: 1,
      price: '',
      announcementDate: '',
      status: 'before_apply',
      memo: '',
      rating: 5,
      memories: '',
      isAttended: false,
      createdAt: new Date().toISOString()
    };
    setEditingEvent(dummyEvent);
    setIsModalOpen(true);
  };

  // Export events to JSON
  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `oshi-schedule-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast('バックアップデータをダウンロードしました。');
    } catch (e) {
      triggerToast('エクスポートに失敗しました。');
    }
  };

  // Import events from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            // Basic schema validation: now checks for title and dateTime (since artist is optional for holidays)
            const isValid = parsed.every(item => item.title && item.dateTime);
            if (isValid) {
              saveEvents(parsed);
              triggerToast('データをインポートしました！');
            } else {
              triggerToast('ファイルの形式が正しくありません。');
            }
          } else {
            triggerToast('有効な推し活データではありません。');
          }
        } catch (err) {
          triggerToast('ファイルの読み込みに失敗しました。');
        }
      };
    }
  };

  // Restore Default Demo Data
  const handleRestoreDefaults = () => {
    saveEvents(INITIAL_EVENTS);
    triggerToast('データをデモ初期値に戻しました。');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-800 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-600" id="app-root">
      {/* Dynamic Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white font-semibold px-5 py-3 rounded-full shadow-lg flex items-center gap-2.5 text-sm"
            id="toast-notification"
          >
            <Check className="w-4 h-4 text-purple-400 stroke-[3]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Top Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md bg-white/95" id="app-header">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-xs shadow-purple-500/20">
              <Sparkles className="w-5 h-5 fill-purple-100/10" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
                推し活・当落・スケジュール管理
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                公演日・ツアー他日程・休みを重ねて一覧比較
              </p>
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportData}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              title="データを保存 (JSON)"
              id="export-data-btn"
            >
              <Download className="w-4.5 h-4.5" />
            </button>
            <label
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer relative"
              title="データを復元 (JSON)"
              id="import-data-label"
            >
              <Upload className="w-4.5 h-4.5" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 opacity-0 cursor-pointer w-0 h-0"
                id="import-data-file-input"
              />
            </label>
            <button
              onClick={handleRestoreDefaults}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              title="デモデータを復元"
              id="restore-demo-btn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6" id="app-main">
        {/* Navigation Tabs and Quick Add Floating Button */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-gray-100 pb-2">
          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-2xl self-start" id="navigation-tabs">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white text-purple-700 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              id="tab-btn-list"
            >
              <ListFilter className="w-4 h-4" />
              予定・当落管理
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white text-purple-700 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              id="tab-btn-calendar"
            >
              <Calendar className="w-4 h-4" />
              カレンダー比較
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white text-purple-700 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              id="tab-btn-stats"
            >
              <Award className="w-4 h-4" />
              参戦記録と統計
            </button>
          </div>

          {/* Quick Register Button */}
          <button
            onClick={() => {
              setEditingEvent(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-purple-600/10 hover:shadow-md hover:shadow-purple-600/20 active:scale-95 transition-all cursor-pointer"
            id="register-live-btn"
          >
            <Plus className="w-4.5 h-4.5 stroke-[3]" />
            新しい予定を登録する
          </button>
        </div>

        {/* Tab Contents */}
        <div id="tab-content-wrapper">
          {activeTab === 'list' && (
            <LiveList
              events={events}
              onEditEvent={(event) => {
                setEditingEvent(event);
                setIsModalOpen(true);
              }}
              onDeleteEvent={handleDeleteEvent}
              onStatusChange={handleStatusChange}
              onToggleAttended={handleToggleAttended}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              events={events}
              onSelectEvent={(event) => {
                setEditingEvent(event);
                setIsModalOpen(true);
              }}
              onAddEventOnDate={handleAddEventOnDate}
            />
          )}

          {activeTab === 'stats' && (
            <LiveStats
              events={events}
              onSelectEvent={(event) => {
                setEditingEvent(event);
                setIsModalOpen(true);
              }}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium" id="app-footer">
        <p className="flex items-center justify-center gap-1">
          <span>推し活・当落・スケジュール管理</span>
          <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
          <span>重ねて比較して、最高の推し活ライフを</span>
        </p>
      </footer>

      {/* Add / Edit Form Modal */}
      <LiveFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        initialEvent={editingEvent}
        events={events}
      />
    </div>
  );
}
