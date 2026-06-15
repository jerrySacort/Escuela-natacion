import { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  unread: boolean;
}

interface Props {
  items: Notification[];
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

/** Avisos del portal de padres con "marcar leídos". */
export default function NotificationsCard({ items }: Props) {
  const [marking, setMarking] = useState(false);
  const unreadCount = items.filter((n) => n.unread).length;

  async function markAllRead() {
    setMarking(true);
    const res = await fetch('/api/notifications/read', { method: 'POST' });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setMarking(false);
    alert('No se pudieron marcar como leídos.');
  }

  if (items.length === 0) return null;

  return (
    <div className="glass mt-6 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-white/90">
          🔔 Avisos
          {unreadCount > 0 && (
            <span className="bg-cream ml-2 rounded-full px-2 py-0.5 text-xs font-bold text-slate-900">
              {unreadCount}
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="text-xs text-white/50 transition hover:text-white disabled:opacity-50"
          >
            {marking ? 'Marcando…' : 'Marcar leídos'}
          </button>
        )}
      </div>
      <ul className="mt-3 space-y-3">
        {items.map((n) => (
          <li
            key={n.id}
            className={`rounded-2xl p-3 ${
              n.unread ? 'bg-white/10' : 'bg-white/[0.03] opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-white/90">{n.title}</p>
              <span className="shrink-0 text-xs text-white/35">
                {timeAgo(n.created_at)}
              </span>
            </div>
            {n.body && <p className="mt-0.5 text-sm text-white/60">{n.body}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
