import { LiveEvent } from './types';

export const INITIAL_EVENTS: LiveEvent[] = [
  {
    id: '1',
    category: 'my_live',
    title: 'Dream Spark Tour 2026',
    artist: 'なつめ莉愛 (莉愛ちゃん)',
    dateTime: '2026-05-20T18:30',
    venue: '日本武道館',
    ticketCount: 2,
    price: 8500,
    announcementDate: '2026-04-15',
    status: 'won',
    memo: 'ファンクラブ先行。グッズ（TシャツM、ペンライト）は当日会場受取。同行：まりちゃん',
    rating: 5,
    memories: '初めての単独武道館ライブ！アリーナA3ブロックの神席で、目が合ってレスもらえました（号泣）。セトリも神がかっていて、アンコールの新曲『青空のシグナル』は感動してボロ泣き。最高の思い出です！',
    isAttended: true,
    createdAt: '2026-04-01T12:00'
  },
  {
    id: '2',
    category: 'my_live',
    title: 'Summer Sonic Wave 2026',
    artist: 'コズミック・ブルー',
    dateTime: '2026-07-15T15:00',
    venue: '幕張メッセ',
    ticketCount: 1,
    price: 9800,
    announcementDate: '2026-06-10',
    status: 'won',
    memo: 'オフィシャル1次先行。14:00に海浜幕張駅で集合。熱中症対策グッズ（塩分タブレット、ハンディファン）を絶対に持参すること！',
    isAttended: false,
    createdAt: '2026-05-15T10:00'
  },
  {
    id: '3',
    category: 'my_live',
    title: 'Autumn Melodies Arena Special',
    artist: '星空シグナル',
    dateTime: '2026-08-12T17:30',
    venue: '横浜アリーナ',
    ticketCount: 2,
    price: 9000,
    announcementDate: '2026-07-02',
    status: 'applied',
    memo: 'FC最速先行申込。当落発表は7/2！メールフォルダとTwitterを正座待機。当たったらまりちゃんと一緒に行く約束。',
    isAttended: false,
    createdAt: '2026-06-15T09:00'
  },
  {
    id: '4',
    category: 'my_live',
    title: 'アコースティックの夜 vol.4',
    artist: '深海アクア',
    dateTime: '2026-09-05T19:00',
    venue: 'ビルボードライブ東京',
    ticketCount: 1,
    price: 7500,
    announcementDate: '2026-07-20',
    status: 'before_apply',
    memo: '一般販売は7/20からの予定。アラームを11:55にセットする。',
    isAttended: false,
    createdAt: '2026-06-20T14:30'
  },
  {
    id: '5',
    category: 'my_live',
    title: 'ファン感謝祭ファンミーティング',
    artist: 'なつめ莉愛 (莉愛ちゃん)',
    dateTime: '2026-07-08T18:00',
    venue: '豊洲PIT',
    ticketCount: 1,
    price: 6000,
    announcementDate: '2026-06-15',
    status: 'lost',
    memo: 'FC1次先行で落選。一般かリセールが出るのを待つ。絶対に諦めない！',
    isAttended: false,
    createdAt: '2026-06-01T11:00'
  },
  // Tour All Schedule examples (Other Dates)
  {
    id: 'tour-1',
    category: 'tour_all',
    title: 'Summer Sonic Wave 2026 (大阪公演)',
    artist: 'コズミック・ブルー',
    dateTime: '2026-07-16T15:00',
    venue: '舞洲スポーツアイランド',
    memo: 'ツアー全体の別日公演。大阪公演も行きたかったけど遠征費用と相談中。',
    createdAt: '2026-06-20T10:00'
  },
  {
    id: 'tour-2',
    category: 'tour_all',
    title: 'Autumn Melodies Arena Special (名古屋公演)',
    artist: '星空シグナル',
    dateTime: '2026-08-15T17:00',
    venue: 'ポートメッセなごや',
    memo: '星空シグナルのアリーナツアー名古屋日程。',
    createdAt: '2026-06-20T10:00'
  },
  // Holiday examples
  {
    id: 'holiday-1',
    category: 'holiday',
    title: '有給休暇取得（予定）',
    artist: '自分',
    dateTime: '2026-07-15',
    memo: 'Summer Sonic Waveの参戦日なので確実に有給休暇を申請して休む！',
    createdAt: '2026-06-25T08:00'
  },
  {
    id: 'holiday-2',
    category: 'holiday',
    title: 'お盆休み',
    artist: '自分',
    dateTime: '2026-08-12',
    memo: 'この日は仕事が休み。横浜アリーナ公演（Autumn Melodies）と被っているので、当選したら午後から直行できる！',
    createdAt: '2026-06-25T08:00'
  },
  {
    id: 'holiday-3',
    category: 'holiday',
    title: '土曜休み',
    artist: '自分',
    dateTime: '2026-08-15',
    memo: '名古屋公演の日。休みだから遠征しようと思えば行ける日程！',
    createdAt: '2026-06-25T08:00'
  }
];
