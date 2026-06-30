import React from 'react';
import { motion } from 'motion/react';
import { Star, Award, Heart, Calendar, MapPin, User, FileText, CheckCircle2, XCircle, Clock, Percent, CreditCard, Sparkles } from 'lucide-react';
import { LiveEvent } from '../types';
import { formatDateTimeJP, formatCurrency } from '../utils';

interface LiveStatsProps {
  events: LiveEvent[];
  onSelectEvent: (event: LiveEvent) => void;
}

export default function LiveStats({ events, onSelectEvent }: LiveStatsProps) {
  // Compute Stats - isolate only actual ticket/live application events (exclude other tour dates and holidays)
  const liveEvents = events.filter(e => !e.category || e.category === 'my_live');
  const totalEvents = liveEvents.length;
  const wonEvents = liveEvents.filter(e => e.status === 'won');
  const lostEvents = liveEvents.filter(e => e.status === 'lost');
  const appliedEvents = liveEvents.filter(e => e.status === 'applied');
  const beforeApplyEvents = liveEvents.filter(e => e.status === 'before_apply');

  // Win Rate (Won / (Won + Lost))
  const decidedApplications = wonEvents.length + lostEvents.length;
  const winRate = decidedApplications > 0 
    ? Math.round((wonEvents.length / decidedApplications) * 100) 
    : 0;

  // Total investment (Won ticket price * ticket count)
  const totalSpend = wonEvents.reduce((acc, e) => {
    if (e.price) {
      return acc + (e.price * (e.ticketCount || 1));
    }
    return acc;
  }, 0);

  // Attended lives list (events where isAttended is true, sorted by date desc)
  const attendedEvents = liveEvents
    .filter(e => e.isAttended)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  // Future scheduled lives (won and in the future, sorted by date asc)
  const futureWonEvents = liveEvents
    .filter(e => e.status === 'won' && !e.isAttended && new Date(e.dateTime).getTime() > new Date().getTime())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  return (
    <div className="space-y-8" id="stats-view-container">
      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Won */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4 hover:shadow-xs transition-shadow"
          id="stat-card-won"
        >
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">当選公演数</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-gray-900">{wonEvents.length}</span>
              <span className="text-[10px] text-gray-500 font-medium">公演</span>
            </div>
          </div>
        </motion.div>

        {/* Win Rate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4 hover:shadow-xs transition-shadow"
          id="stat-card-winrate"
        >
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600 flex-shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">当選確率</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-gray-900">{winRate}</span>
              <span className="text-[10px] text-gray-500 font-medium">%</span>
            </div>
          </div>
        </motion.div>

        {/* Future Schedule count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4 hover:shadow-xs transition-shadow"
          id="stat-card-future"
        >
          <div className="p-3 bg-blue-50 rounded-xl text-blue-500 flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">今後の参戦予定</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-gray-900">{futureWonEvents.length}</span>
              <span className="text-[10px] text-gray-500 font-medium">公演</span>
            </div>
          </div>
        </motion.div>

        {/* Total Spend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4 hover:shadow-xs transition-shadow"
          id="stat-card-spend"
        >
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500 flex-shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">チケット総投資額</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-gray-900">{totalSpend.toLocaleString()}</span>
              <span className="text-[10px] text-gray-500 font-medium">円</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Split: Attended Live Memories & Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Attended Memories / Review Diary (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-gray-900">参戦記録・思い出ギャラリー ({attendedEvents.length})</h3>
          </div>

          {attendedEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-200 text-center text-gray-500">
              <Heart className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium">参戦記録がまだありません。</p>
              <p className="text-xs text-gray-400 mt-1">公演情報で「当選」かつ「参戦完了」にチェックを入れるとここに表示されます。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendedEvents.map((e, idx) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelectEvent(e)}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group hover:border-purple-200"
                  id={`memory-card-${e.id}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <div>
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold bg-purple-50 text-purple-700 rounded-md mb-2">
                        参戦完了
                      </span>
                      <h4 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {e.title}
                      </h4>
                    </div>

                    {/* Star Rating */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (e.rating || 5)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium text-gray-700">{e.artist}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatDateTimeJP(e.dateTime)}</span>
                    </div>
                    {e.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{e.venue}</span>
                      </div>
                    )}
                  </div>

                  {/* Thoughts/Memories Text */}
                  {e.memories ? (
                    <div className="text-sm text-gray-600 leading-relaxed bg-purple-50/10 border-l-2 border-purple-400 pl-3 py-1 italic">
                      {e.memories}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">思い出がまだ記入されていません。タップして編集しましょう！</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar lists: Next Scheduled Live & Stats breakdown (1/3 width) */}
        <div className="space-y-6">
          {/* Next Scheduled Live */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-gray-900">次に参戦するライブ</h3>
            </div>

            {futureWonEvents.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center text-gray-400 text-xs">
                今後の参戦決定予定はありません
              </div>
            ) : (
              <motion.div
                onClick={() => onSelectEvent(futureWonEvents[0])}
                className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                id="next-live-highlight-card"
              >
                <span className="px-2.5 py-1 bg-white/20 text-white text-[10px] font-bold rounded-md backdrop-blur-xs inline-block mb-3">
                  NEXT LIVE
                </span>
                <h4 className="text-lg font-bold group-hover:underline underline-offset-4 decoration-white/50">
                  {futureWonEvents[0].title}
                </h4>
                <p className="text-sm text-white/90 font-medium mt-1">
                  {futureWonEvents[0].artist}
                </p>

                <div className="mt-6 space-y-2 text-xs text-white/85">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white/80" />
                    <span>{formatDateTimeJP(futureWonEvents[0].dateTime)}</span>
                  </div>
                  {futureWonEvents[0].venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white/80" />
                      <span>{futureWonEvents[0].venue}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Status Breakdown Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">お申込状況内訳</h4>
            <div className="space-y-3">
              {/* Won */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  当選
                </span>
                <span className="font-bold text-gray-700">{wonEvents.length} 件</span>
              </div>
              {/* Applied */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  申込済
                </span>
                <span className="font-bold text-gray-700">{appliedEvents.length} 件</span>
              </div>
              {/* Lost */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-rose-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  落選
                </span>
                <span className="font-bold text-gray-700">{lostEvents.length} 件</span>
              </div>
              {/* Before Apply */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  申込前
                </span>
                <span className="font-bold text-gray-700">{beforeApplyEvents.length} 件</span>
              </div>

              <div className="border-t border-gray-100 pt-3 mt-1 flex justify-between items-center text-sm font-bold text-gray-900">
                <span>お申込総数</span>
                <span>{totalEvents} 公演</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
