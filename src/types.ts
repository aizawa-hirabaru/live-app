export type EventCategory = 'my_live' | 'tour_all' | 'holiday';
export type EventStatus = 'before_apply' | 'applied' | 'won' | 'lost';

export interface LiveEvent {
  id: string;
  category: EventCategory;   // 予定区分: 自分の申込(my_live), ツアー他公演(tour_all), 休みの日(holiday)
  title: string;             // 公演名/タイトル
  artist: string;            // アーティスト名 / 推し名 (休みの日などの場合は任意・「自分」など)
  dateTime: string;          // 公演日時 / 予定日時 (YYYY-MM-DDTHH:mm または YYYY-MM-DD)
  endDateTime?: string;      // 終了日時（ツアー他日程、自分の休み用） (YYYY-MM-DD)
  venue?: string;            // 会場
  ticketCount?: number;      // 枚数
  price?: number;            // チケット料金
  announcementDate?: string; // 当落発表日 (YYYY-MM-DD)
  status?: EventStatus;      // ステータス
  memo?: string;             // メモ・持ち物など
  rating?: number;           // 参戦評価 (1-5つ星)
  memories?: string;         // 参戦記録・感想
  isAttended?: boolean;      // 参戦済フラグ
  createdAt: string;
  color?: string;            // アーティストのイメージカラー
}

export type SortKey = 'dateTime' | 'announcementDate' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

