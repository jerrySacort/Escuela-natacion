import { useMemo, useState } from 'react';

interface RosterStudent {
  student_id: string;
  name: string;
  photo_url: string | null;
  present: boolean;
}

export interface TodayGroup {
  id: string;
  name: string;
  level_name: string;
  times: string; // "16:00 – 17:00"
  roster: RosterStudent[];
}

interface Props {
  groups: TodayGroup[];
  canManage: boolean;
}

/** Pase de lista del día: grupos con clase hoy y roster con toggle. */
export default function AttendanceView({ groups, canManage }: Props) {
  const [selectedId, setSelectedId] = useState(groups[0]?.id ?? '');
  // Estado local de presencia para respuesta inmediata
  const [presence, setPresence] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const g of groups)
      for (const s of g.roster) map[`${g.id}:${s.student_id}`] = s.present;
    return map;
  });
  const [pending, setPending] = useState<string | null>(null);

  const selected = useMemo(
    () => groups.find((g) => g.id === selectedId) ?? null,
    [groups, selectedId],
  );

  const presentCount = selected
    ? selected.roster.filter((s) => presence[`${selected.id}:${s.student_id}`]).length
    : 0;

  async function toggle(s: RosterStudent) {
    if (!canManage || !selected) return;
    const key = `${selected.id}:${s.student_id}`;
    const next = !presence[key];
    setPending(key);
    setPresence((p) => ({ ...p, [key]: next })); // optimista

    const fd = new FormData();
    fd.set('student_id', s.student_id);
    fd.set('group_id', selected.id);
    fd.set('present', String(next));
    const res = await fetch('/api/attendance/toggle', { method: 'POST', body: fd });
    if (!res.ok) {
      setPresence((p) => ({ ...p, [key]: !next })); // revertir
      alert('No se pudo actualizar la asistencia.');
    }
    setPending(null);
  }

  if (groups.length === 0) {
    return (
      <div className="glass-soft rounded-3xl p-10 text-center text-white/50">
        <p className="text-3xl">🗓️</p>
        <p className="mt-3">No hay grupos con clase hoy.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Grupos de hoy */}
      <div className="space-y-3">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedId(g.id)}
            className={`w-full rounded-3xl p-5 text-left transition ${
              g.id === selectedId
                ? 'bg-cream text-slate-900 shadow-lg'
                : 'glass-soft text-white/80 hover:bg-white/10'
            }`}
          >
            <p className="font-semibold">{g.name}</p>
            <p
              className={`mt-0.5 text-sm ${
                g.id === selectedId ? 'text-slate-500' : 'text-white/50'
              }`}
            >
              {g.level_name} · {g.times}
            </p>
            <p
              className={`mt-1 text-xs ${
                g.id === selectedId ? 'text-slate-500' : 'text-white/40'
              }`}
            >
              {g.roster.filter((s) => presence[`${g.id}:${s.student_id}`]).length}/
              {g.roster.length} presentes
            </p>
          </button>
        ))}
      </div>

      {/* Roster */}
      <div className="glass-soft rounded-3xl p-6 lg:col-span-2">
        {selected ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-white/80">{selected.name}</h2>
              <span className="text-sm text-white/50">
                {presentCount}/{selected.roster.length} presentes
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {selected.roster.map((s) => {
                const key = `${selected.id}:${s.student_id}`;
                const isPresent = presence[key];
                return (
                  <li key={s.student_id}>
                    <button
                      onClick={() => toggle(s)}
                      disabled={!canManage || pending === key}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition disabled:cursor-default ${
                        isPresent
                          ? 'border-emerald-300/25 bg-emerald-400/15'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {s.photo_url ? (
                        <img
                          src={s.photo_url}
                          alt=""
                          className="h-10 w-10 rounded-full border border-white/15 object-cover"
                        />
                      ) : (
                        <span className="bg-cream/90 flex h-10 w-10 items-center justify-center rounded-full font-bold text-slate-900">
                          {s.name.charAt(0)}
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm text-white/90">
                        {s.name}
                      </span>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                          isPresent
                            ? 'bg-emerald-400/90 text-slate-900'
                            : 'border border-white/20 text-white/30'
                        }`}
                      >
                        ✓
                      </span>
                    </button>
                  </li>
                );
              })}
              {selected.roster.length === 0 && (
                <li className="py-4 text-center text-sm text-white/40">
                  Sin alumnos inscritos en este grupo.
                </li>
              )}
            </ul>
          </>
        ) : (
          <p className="text-white/40">Selecciona un grupo.</p>
        )}
      </div>
    </div>
  );
}
