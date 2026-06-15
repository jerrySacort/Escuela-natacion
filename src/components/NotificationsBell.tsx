import { useEffect, useRef, useState } from 'react';
import { alertDialog } from '@/lib/dialog';

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

/** Campana de avisos en la barra superior con panel desplegable animado. */
export default function NotificationsBell({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = items.filter((n) => n.unread).length;

  // Cerrar al hacer clic fuera o con Escape
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function markAllRead() {
    setMarking(true);
    const res = await fetch('/api/notifications/read', { method: 'POST' });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setMarking(false);
    void alertDialog('No se pudieron marcar como leídos.');
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Avisos"
        aria-expanded={open}
        className="relative grid h-9 w-9 place-items-center rounded-full bg-white/5 text-base transition hover:bg-white/10"
      >
        <span className={unreadCount > 0 ? 'bell-ring' : ''}>🔔</span>
        {unreadCount > 0 && (
          <span className="bg-cream absolute -right-0.5 -top-0.5 grid h-4 min-w-4 animate-pulse place-items-center rounded-full px-1 text-[10px] font-bold text-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="dropdown-in notif-panel fixed inset-x-3 top-[4.75rem] z-50 mx-auto w-auto max-w-sm rounded-3xl p-4 text-white shadow-2xl shadow-black/40 sm:absolute sm:inset-x-auto sm:left-auto sm:right-0 sm:top-full sm:mx-0 sm:mt-2 sm:w-80 sm:max-w-[calc(100vw-2rem)]">
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
                type="button"
                onClick={markAllRead}
                disabled={marking}
                className="text-xs text-white/50 transition hover:text-white disabled:opacity-50"
              >
                {marking ? 'Marcando…' : 'Marcar leídos'}
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="mt-5 mb-2 text-center text-sm text-white/40">
              Sin avisos por ahora 🌊
            </p>
          ) : (
            <ul className="mt-3 max-h-[22rem] space-y-2 overflow-y-auto pr-1">
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
          )}
        </div>
      )}
    </div>
  );
}
