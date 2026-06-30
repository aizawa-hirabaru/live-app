import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, Info, Clock, MapPin, User, Sparkles, Heart, Star, Plus, AlertTriangle, CheckCircle2, Award } from 'lucide-react';
import { LiveEvent } from '../types';
import { formatDateTimeJP } from '../utils';

interface CalendarViewProps {
  events: LiveEvent[];
  onSelectEvent: (event: LiveEvent) => void;
  onAddEventOnDate: (dateStr: string) => void;
}

export default function CalendarView({ events, onSelectEvent, onAddEventOnDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday etc.
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

    // Prev month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDate - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        key: `prev-${prevMonthLastDate - i}`
      });
    }

    // Current month days
    for (let i = 1; i <= lastDate; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        key: `current-${i}`
      });
    }

    // Next month padding days to fill 6 rows (42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        key: `next-${i}`
      });
    }

    return days;
  };

  const calendarDays = getDaysInMonth();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // Match events to a date
  const getEventsForDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStrYMD = `${y}-${m}-${d}`;
    
    // All events on this day (supporting ranges)
    const dayEvents = events.filter((e) => {
      if (!e.dateTime) return false;
      const startYMD = e.dateTime.split('T')[0];
      const endYMD = e.endDateTime ? e.endDateTime.split('T')[0] : startYMD;
      return dateStrYMD >= startYMD && dateStrYMD <= endYMD;
    });

    const myLives = dayEvents.filter(e => !e.category || e.category === 'my_live');
    const tourAlls = dayEvents.filter(e => e.category === 'tour_all');
    const holidays = dayEvents.filter(e => e.category === 'holiday');

    // Lottery announcements on this day (only for my_live)
    const announcements = events.filter((e) => {
      if ((e.category && e.category !== 'my_live') || !e.announcementDate) return false;
      return e.announcementDate.split('T')[0] === dateStrYMD;
    });

    // Check if user has active live on this day (won or applied)
    const hasActiveLive = myLives.some(e => e.status === 'won' || e.status === 'applied');
    const hasWonLive = myLives.some(e => e.status === 'won');
    const hasHoliday = holidays.length > 0;
    
    // Check if it's a weekday
    const dayOfWeek = date.getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    return {
      myLives,
      tourAlls,
      holidays,
      announcements,
      hasActiveLive,
      hasWonLive,
      hasHoliday,
      isWeekday,
      // Analysis attributes
      overlapOk: hasActiveLive && hasHoliday,
      missingHoliday: hasActiveLive && isWeekday && !hasHoliday
    };
  };

  // Analyze overall scheduling compatibility across all loaded events
  const analyzeSchedule = () => {
    const analysis: {
      perfectFits: { dateStr: string; liveTitle: string; holidayTitle: string }[];
      missingHolidays: { dateStr: string; liveTitle: string; weekdayName: string; isWon: boolean }[];
      opportunities: { dateStr: string; tourTitle: string; holidayTitle: string }[];
    } = {
      perfectFits: [],
      missingHolidays: [],
      opportunities: []
    };

    const jpDays = ['日', '月', '火', '水', '木', '金', '土'];

    // Helper to get YMD string from Date object
    const toYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${date}`;
    };

    // Helper to get all YMD strings in a range [start, end]
    const getDatesInRange = (startStr: string, endStr?: string) => {
      const dates: string[] = [];
      if (!startStr) return dates;
      
      const startYMD = startStr.split('T')[0];
      const endYMD = endStr ? endStr.split('T')[0] : startYMD;
      
      const curr = new Date(startYMD);
      const end = new Date(endYMD);
      
      let limit = 0;
      while (curr <= end && limit < 100) {
        dates.push(toYMD(curr));
        curr.setDate(curr.getDate() + 1);
        limit++;
      }
      return dates;
    };

    // Helper to check if a YMD date falls in a holiday
    const findHolidayOnDate = (dateStrYMD: string) => {
      return events.find(h => {
        if (h.category !== 'holiday' || !h.dateTime) return false;
        const startYMD = h.dateTime.split('T')[0];
        const endYMD = h.endDateTime ? h.endDateTime.split('T')[0] : startYMD;
        return dateStrYMD >= startYMD && dateStrYMD <= endYMD;
      });
    };

    // 1. Analyze my_live events
    events.forEach(e => {
      if (!e.category || e.category === 'my_live') {
        if (!e.dateTime) return;
        const dateStrYMD = e.dateTime.split('T')[0];
        const dateObj = new Date(dateStrYMD);
        const dayOfWeek = dateObj.getDay();
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${jpDays[dayOfWeek]})`;

        const hasHoliday = findHolidayOnDate(dateStrYMD);

        if (hasHoliday && (e.status === 'won' || e.status === 'applied')) {
          const alreadyAdded = analysis.perfectFits.some(p => p.dateStr === formattedDate && p.liveTitle === e.title);
          if (!alreadyAdded) {
            analysis.perfectFits.push({
              dateStr: formattedDate,
              liveTitle: e.title,
              holidayTitle: hasHoliday.title
            });
          }
        } else if (!hasHoliday && isWeekday && (e.status === 'won' || e.status === 'applied')) {
          const alreadyAdded = analysis.missingHolidays.some(m => m.dateStr === formattedDate && m.liveTitle === e.title);
          if (!alreadyAdded) {
            analysis.missingHolidays.push({
              dateStr: formattedDate,
              liveTitle: e.title,
              weekdayName: jpDays[dayOfWeek],
              isWon: e.status === 'won'
            });
          }
        }
      } else if (e.category === 'tour_all') {
        // 2. Analyze tour_all events (possibly multi-day)
        const tourDates = getDatesInRange(e.dateTime, e.endDateTime);
        tourDates.forEach(dateStrYMD => {
          const hasHoliday = findHolidayOnDate(dateStrYMD);
          if (hasHoliday) {
            const dateObj = new Date(dateStrYMD);
            const dayOfWeek = dateObj.getDay();
            const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${jpDays[dayOfWeek]})`;
            
            const alreadyAdded = analysis.opportunities.some(
              o => o.dateStr === formattedDate && o.tourTitle === e.title
            );
            if (!alreadyAdded) {
              analysis.opportunities.push({
                dateStr: formattedDate,
                tourTitle: e.title,
                holidayTitle: hasHoliday.title
              });
            }
          }
        });
      }
    });

    return analysis;
  };

  const { perfectFits, missingHolidays, opportunities } = analyzeSchedule();

  return (
    <div className="space-y-6" id="calendar-view-section">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden" id="calendar-view-container">
        {/* Calendar Header / Control Bar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-purple-50/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-600 rounded-xl text-white shadow-sm shadow-purple-600/10">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">推し活スケジュールカレンダー</h2>
              <p className="text-xs text-gray-500">公演、ツアー日程、休みを重ねてチェック・比較できます</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors cursor-pointer"
                title="前月"
                id="prev-month-button"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-3.5 font-bold text-gray-800 text-sm tracking-tight min-w-[100px] text-center">
                {year}年 {month + 1}月
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors cursor-pointer"
                title="翌月"
                id="next-month-button"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-colors shadow-2xs cursor-pointer"
              id="today-button"
            >
              今月
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {weekDays.map((day, idx) => (
            <div
              key={day}
              className={`py-3 text-center text-xs font-bold border-r border-gray-100 last:border-r-0 ${
                idx === 0 ? 'text-rose-500 bg-rose-50/20' : idx === 6 ? 'text-blue-500 bg-blue-50/20' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 bg-gray-50/30">
          {calendarDays.map(({ date, isCurrentMonth }, idx) => {
            const { 
              myLives, 
              tourAlls, 
              holidays, 
              announcements, 
              overlapOk, 
              missingHoliday 
            } = getEventsForDate(date);
            
            const isToday = new Date().toDateString() === date.toDateString();
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const dateStrYMD = `${y}-${m}-${d}`;

            return (
              <div
                key={`${dateStrYMD}-${idx}`}
                className={`min-h-[135px] border-r border-b border-gray-100 last:border-r-0 p-1.5 flex flex-col justify-between group transition-colors relative hover:bg-purple-50/10 bg-white`}
              >
                {/* Date Number Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday
                        ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/25'
                        : isCurrentMonth
                        ? idx % 7 === 0
                          ? 'text-rose-500'
                          : idx % 7 === 6
                          ? 'text-blue-500'
                          : 'text-gray-700'
                        : 'text-gray-300'
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  {/* Quick Add Button */}
                  <button
                    onClick={() => onAddEventOnDate(dateStrYMD)}
                    className="opacity-0 group-hover:opacity-100 p-1 bg-gray-100 hover:bg-purple-50 text-gray-400 hover:text-purple-600 rounded-md transition-all cursor-pointer"
                    title="この日に予定を追加"
                    id={`quick-add-${dateStrYMD}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Day Events Wrapper */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[90px] scrollbar-thin pb-4">
                  
                  {/* Announcements (Lottery announcement for my_live) */}
                  {announcements.map((e) => (
                    <div
                      key={`ann-${e.id}`}
                      onClick={() => onSelectEvent(e)}
                      className="p-1 text-[10px] bg-amber-50 hover:bg-amber-100 border border-amber-200/50 rounded-lg text-amber-800 font-semibold cursor-pointer truncate flex items-center gap-1 transition-all hover:translate-x-0.5"
                      title={`[当落発表] ${e.title} (${e.artist})`}
                      id={`cal-ann-${e.id}`}
                    >
                      <span className="flex-shrink-0 text-amber-500 animate-pulse">🔔</span>
                      <span className="truncate">当落: {e.title}</span>
                    </div>
                  ))}

                  {/* Holidays (自分の休み) - High priority background or highlighted */}
                  {holidays.map((e) => (
                    <div
                      key={`holiday-${e.id}`}
                      onClick={() => onSelectEvent(e)}
                      className="p-1 text-[10px] bg-teal-50 hover:bg-teal-100 border border-teal-200/50 text-teal-800 font-bold rounded-lg cursor-pointer truncate flex items-center gap-1 transition-all hover:translate-x-0.5"
                      title={`[休み] ${e.title}`}
                      id={`cal-holiday-${e.id}`}
                    >
                      <span className="flex-shrink-0">🏖️</span>
                      <span className="truncate">{e.title}</span>
                    </div>
                  ))}

                  {/* My Lives (申込中・参戦公演) */}
                  {myLives.map((e) => {
                    let statusEmoji = '🎤';
                    if (e.status === 'won') statusEmoji = '🎉';
                    if (e.status === 'lost') statusEmoji = '😢';
                    
                    const isLost = e.status === 'lost';
                    let baseColor = e.color || '#9333ea';
                    if (!e.color) {
                      if (e.status === 'applied') baseColor = '#2563eb';
                    }
                    
                    return (
                      <div
                        key={`my-live-${e.id}`}
                        onClick={() => onSelectEvent(e)}
                        className="p-1 text-[10px] border font-bold rounded-lg cursor-pointer truncate flex items-center gap-1 transition-all hover:translate-x-0.5 shadow-xs"
                        style={
                          isLost
                            ? {
                                backgroundColor: '#f1f5f9',
                                color: '#94a3b8',
                                borderColor: '#cbd5e1',
                                textDecoration: 'line-through',
                                opacity: 0.65
                              }
                            : {
                                backgroundColor: baseColor,
                                color: '#ffffff',
                                borderColor: baseColor,
                              }
                        }
                        title={`[参戦・申込] ${e.title} (${e.artist})`}
                        id={`cal-mylive-${e.id}`}
                      >
                        <span className="flex-shrink-0">{statusEmoji}</span>
                        <span className="truncate">{e.title}</span>
                      </div>
                    );
                  })}
 
                  {/* Tour Schedules (ツアー他日程) */}
                  {tourAlls.map((e) => {
                    const artistColor = e.color || '#d946ef';
                    return (
                      <div
                        key={`tour-${e.id}`}
                        onClick={() => onSelectEvent(e)}
                        className="p-1 text-[10px] font-semibold rounded-lg cursor-pointer truncate flex items-center gap-1 transition-all hover:translate-x-0.5 border"
                        style={{
                          backgroundColor: artistColor + '15',
                          color: artistColor,
                          borderColor: artistColor + '30',
                        }}
                        title={`[ツアー他日程] ${e.title} (${e.artist})`}
                        id={`cal-tour-${e.id}`}
                      >
                        <span className="truncate">{e.title}</span>
                      </div>
                    );
                  })}
                </div>
 
                {/* Overlap Intelligence Indicator */}
                <div className="absolute bottom-1 right-1.5 flex gap-1">
                  {overlapOk && (
                    <span 
                      className="px-1 bg-teal-500 text-white rounded text-[8px] font-bold shadow-2xs cursor-help"
                      title="この日は休みが登録されており、ライブに参戦可能です！"
                    >
                      ✨ 休みOK
                    </span>
                  )}
                  {missingHoliday && (
                    <span 
                      className="px-1 bg-amber-500 text-white rounded text-[8px] font-bold shadow-2xs cursor-help animate-pulse"
                      title="平日の公演予定がありますが、お休みがまだ登録されていません！"
                    >
                      ⚠️ 休み未登録
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
 
        {/* Calendar Legend */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 justify-center text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500">🔔</span>
            <span>当落発表日</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-teal-600">🏖️</span>
            <span className="font-semibold text-gray-700">自分の休み (登録可能)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span className="font-semibold text-gray-700">参戦・申込公演</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-200 border border-fuchsia-400"></span>
            <span className="text-gray-700">ツアー他公演 (確認用)</span>
          </div>
        </div>
      </div>

      {/* Schedule & Overlap Intelligence Analyzer */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Award className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-900">スケジュール被り・相性診断 (Overlap Analyzer)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Section 1: Perfect Fits */}
          <div className="bg-teal-50/30 rounded-xl p-4 border border-teal-100/60 space-y-2.5">
            <div className="flex items-center gap-1.5 text-teal-800 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>参戦準備バッチリ！ ({perfectFits.length})</span>
            </div>
            {perfectFits.length === 0 ? (
              <p className="text-xs text-gray-400">参戦日と休みが被る日程はまだありません。</p>
            ) : (
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                {perfectFits.map((p, i) => (
                  <div key={i} className="text-xs bg-white/75 rounded-lg p-2 border border-teal-100 text-gray-700">
                    <span className="font-semibold text-teal-700">{p.dateStr}</span>
                    <p className="truncate mt-0.5 text-gray-800 font-medium">{p.liveTitle}</p>
                    <p className="text-[10px] text-gray-500">お休み：{p.holidayTitle}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Missing holidays (Action Required) */}
          <div className="bg-amber-50/30 rounded-xl p-4 border border-amber-100/60 space-y-2.5">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>お休み申請が必要かも？ ({missingHolidays.length})</span>
            </div>
            {missingHolidays.length === 0 ? (
              <p className="text-xs text-emerald-600 font-medium">平日の公演に対する休み未登録はありません！カンペキです✨</p>
            ) : (
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                {missingHolidays.map((m, i) => (
                  <div key={i} className="text-xs bg-white/75 rounded-lg p-2 border border-amber-100 text-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-amber-700">{m.dateStr}</span>
                      <span className={`px-1 rounded text-[9px] font-bold ${m.isWon ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {m.isWon ? '当選済' : '申込済'}
                      </span>
                    </div>
                    <p className="truncate mt-1 text-gray-800 font-medium">{m.liveTitle}</p>
                    <p className="text-[10px] text-amber-600 mt-0.5 font-medium">⚠️ 平日ですが休みが登録されていません</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Opportunities (Open tour dates matches holidays) */}
          <div className="bg-purple-50/30 rounded-xl p-4 border border-purple-100/60 space-y-2.5">
            <div className="flex items-center gap-1.5 text-purple-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>追加遠征・参戦のチャンス！ ({opportunities.length})</span>
            </div>
            {opportunities.length === 0 ? (
              <p className="text-xs text-gray-400">ツアー他日程と休みが重なっている日はありません。</p>
            ) : (
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                {opportunities.map((o, i) => (
                  <div key={i} className="text-xs bg-white/75 rounded-lg p-2 border border-purple-100 text-gray-700">
                    <span className="font-semibold text-purple-700">{o.dateStr}</span>
                    <p className="truncate mt-0.5 text-gray-800 font-medium">{o.tourTitle}</p>
                    <p className="text-[10px] text-teal-600 mt-0.5 font-medium">✨ この日は【{o.holidayTitle}】で休みです！</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
