import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { confirmDialog, alertDialog } from '@/lib/dialog';

interface Option {
  id: string;
  name: string;
}

interface BranchScoped extends Option {
  branch_id: string;
}

export interface Schedule {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface GroupRow {
  id: string;
  name: string;
  branch_id: string;
  level_id: string;
  instructor_id: string | null;
  pool_id: string | null;
  lane: number | null;
  capacity: number;
  monthly_fee: number;
  is_active: boolean;
  level_name: string;
  branch_name: string;
  instructor_name: string | null;
  pool_name: string | null;
  schedules: Schedule[];
  active_count: number;
  waitlist_count: number;
}

interface Props {
  groups: GroupRow[];
  branches: Option[]; // vacío si no es superadmin
  levels: Option[];
  instructors: BranchScoped[];
  pools: BranchScoped[];
  showBranchSelect: boolean;
  canManage: boolean;
  defaultBranchId: string;
}

type ModalState = { mode: 'create' } | { mode: 'edit'; group: GroupRow } | null;

export const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function scheduleSummary(schedules: Schedule[]): string {
  if (schedules.length === 0) return 'Sin horario';
  const sorted = [...schedules].sort((a, b) => a.weekday - b.weekday);
  return sorted
    .map((s) => `${WEEKDAYS[s.weekday]} ${s.start_time.slice(0, 5)}`)
    .join(' · ');
}

const inputClass =
  'mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40';

/** Vista de grupos: tabla + modal de alta/edición con horarios + activar/desactivar. */
export default function GroupsView({
  groups,
  branches,
  levels,
  instructors,
  pools,
  showBranchSelect,
  canManage,
  defaultBranchId,
}: Props) {
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [branchId, setBranchId] = useState(defaultBranchId);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const editing = modal?.mode === 'edit' ? modal.group : null;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return groups.filter((g) =>
      `${g.name} ${g.level_name} ${g.instructor_name ?? ''}`.toLowerCase().includes(q),
    );
  }, [groups, query]);

  const branchInstructors = useMemo(
    () => instructors.filter((i) => !branchId || i.branch_id === branchId),
    [instructors, branchId],
  );
  const branchPools = useMemo(
    () => pools.filter((p) => !branchId || p.branch_id === branchId),
    [pools, branchId],
  );

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  function openCreate() {
    setBranchId(defaultBranchId);
    setSchedules([{ weekday: 1, start_time: '16:00', end_time: '17:00' }]);
    setModal({ mode: 'create' });
  }

  // Auto-abrir el formulario de alta si la URL trae ?nuevo=1 (acción rápida)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (canManage && params.get('nuevo') === '1') {
      openCreate();
      params.delete('nuevo');
      const qs = params.toString();
      window.history.replaceState(
        {},
        '',
        window.location.pathname + (qs ? `?${qs}` : ''),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit(g: GroupRow) {
    setBranchId(g.branch_id);
    setSchedules(
      g.schedules.map((s) => ({
        weekday: s.weekday,
        start_time: s.start_time.slice(0, 5),
        end_time: s.end_time.slice(0, 5),
      })),
    );
    setModal({ mode: 'edit', group: g });
  }

  function close() {
    setModal(null);
    setError('');
  }

  function setSched(i: number, patch: Partial<Schedule>) {
    setSchedules((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    fd.set('schedules', JSON.stringify(schedules));
    const url = editing ? `/api/groups/${editing.id}` : '/api/groups';
    const res = await fetch(url, {
      method: editing ? 'PATCH' : 'POST',
      body: fd,
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? 'No se pudo guardar.');
    setSaving(false);
  }

  async function toggleActive(g: GroupRow) {
    const action = g.is_active ? 'desactivar' : 'reactivar';
    if (!(await confirmDialog(`¿Seguro que quieres ${action} el grupo "${g.name}"?`, { tone: g.is_active ? 'danger' : 'default' }))) return;
    setTogglingId(g.id);
    const fd = new FormData();
    fd.set('is_active', String(!g.is_active));
    const res = await fetch(`/api/groups/${g.id}`, { method: 'PATCH', body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setTogglingId(null);
    void alertDialog('No se pudo cambiar el estatus.');
  }

  return (
    <>
      {canManage && (
        <div className="-mt-2 mb-5 flex justify-end">
          <button
            onClick={openCreate}
            className="bg-cream rounded-full px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
          >
            + Crear grupo
          </button>
        </div>
      )}

      <div className="glass-soft rounded-3xl">
        <div className="border-b border-white/10 p-4">
          <input
            type="search"
            placeholder="Buscar grupo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-sm rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/40"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[60rem] text-sm">
            <thead>
              <tr className="text-left text-white/50">
                <th className="px-5 py-3 font-medium">Grupo</th>
                <th className="min-w-[13rem] px-5 py-3 font-medium">Horario</th>
                <th className="px-5 py-3 font-medium">Instructor</th>
                <th className="px-5 py-3 font-medium">Ocupación</th>
                <th className="px-5 py-3 font-medium">Mensualidad</th>
                <th className="px-5 py-3 font-medium">Estatus</th>
                {canManage && <th className="px-5 py-3 font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr
                  key={g.id}
                  className={`border-t border-white/10 transition hover:bg-white/5 ${
                    g.is_active ? '' : 'opacity-50'
                  }`}
                >
                  <td className="px-5 py-3">
                    <a
                      href={`/dashboard/grupos/${g.id}`}
                      className="text-white/90 hover:underline underline-offset-4"
                    >
                      {g.name}
                    </a>
                    <p className="text-xs text-white/40">
                      {g.level_name}
                      {g.branch_name ? ` · ${g.branch_name}` : ''}
                      {g.pool_name
                        ? ` · ${g.pool_name}${g.lane ? ` C${g.lane}` : ''}`
                        : ''}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-white/70">
                    {scheduleSummary(g.schedules)}
                  </td>
                  <td className="px-5 py-3 text-white/70">
                    {g.instructor_name ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        g.active_count >= g.capacity
                          ? 'text-amber-200'
                          : 'text-white/70'
                      }
                    >
                      {g.active_count}/{g.capacity}
                    </span>
                    {g.waitlist_count > 0 && (
                      <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-200">
                        +{g.waitlist_count} espera
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-white/70">
                    ${g.monthly_fee.toLocaleString('es-MX')}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        g.is_active
                          ? 'bg-emerald-400/20 text-emerald-200'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {g.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-5 py-3">
                      <span className="flex gap-2">
                        <button
                          onClick={() => openEdit(g)}
                          title="Editar"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition hover:bg-white/15 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button
                          onClick={() => toggleActive(g)}
                          disabled={togglingId === g.id}
                          title={g.is_active ? 'Desactivar' : 'Reactivar'}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-40 ${
                            g.is_active
                              ? 'border-red-300/20 bg-red-400/10 text-red-300/80 hover:bg-red-400/25 hover:text-red-200'
                              : 'border-emerald-300/20 bg-emerald-400/10 text-emerald-300/80 hover:bg-emerald-400/25 hover:text-emerald-200'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                        </button>
                      </span>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className="border-t border-white/10">
                  <td
                    colSpan={canManage ? 7 : 6}
                    className="px-5 py-10 text-center text-white/40"
                  >
                    Sin grupos. Crea el primero con "+ Crear grupo".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && typeof document !== 'undefined' && createPortal(
        <div
          className="modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <form
            onSubmit={onSubmit}
            className="modal-panel my-auto w-full max-w-lg space-y-3.5 rounded-[2rem] border border-white/15 p-7 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                {editing ? 'Editar grupo' : 'Nuevo grupo'}
              </h2>
              <button
                type="button"
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="rounded-xl bg-red-400/15 p-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-white/70">
                Nombre del grupo
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editing?.name}
                  placeholder="Delfines vespertino"
                  className={inputClass}
                />
              </label>
              <label className="block text-sm text-white/70">
                Nivel
                <select
                  name="level_id"
                  required
                  defaultValue={editing?.level_id ?? ''}
                  className={inputClass}
                >
                  <option value="" className="text-slate-900">
                    Selecciona…
                  </option>
                  {levels.map((l) => (
                    <option key={l.id} value={l.id} className="text-slate-900">
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {showBranchSelect && (
              <label className="block text-sm text-white/70">
                Sucursal
                <select
                  name="branch_id"
                  required
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className={inputClass}
                >
                  <option value="" className="text-slate-900">
                    Selecciona…
                  </option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="text-slate-900">
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-white/70">
                Instructor (opcional)
                <select
                  name="instructor_id"
                  defaultValue={editing?.instructor_id ?? ''}
                  className={inputClass}
                >
                  <option value="" className="text-slate-900">
                    Sin asignar
                  </option>
                  {branchInstructors.map((i) => (
                    <option key={i.id} value={i.id} className="text-slate-900">
                      {i.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-white/70">
                Alberca (opcional)
                <select
                  name="pool_id"
                  defaultValue={editing?.pool_id ?? ''}
                  className={inputClass}
                >
                  <option value="" className="text-slate-900">
                    Sin asignar
                  </option>
                  {branchPools.map((p) => (
                    <option key={p.id} value={p.id} className="text-slate-900">
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <label className="block text-sm text-white/70">
                Carril
                <input
                  type="number"
                  name="lane"
                  min="1"
                  defaultValue={editing?.lane ?? ''}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm text-white/70">
                Cupo
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  required
                  defaultValue={editing?.capacity ?? 8}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm text-white/70">
                Mensualidad $
                <input
                  type="number"
                  name="monthly_fee"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={editing?.monthly_fee ?? ''}
                  className={inputClass}
                />
              </label>
            </div>

            {/* Horarios */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Horarios</span>
                <button
                  type="button"
                  onClick={() =>
                    setSchedules((prev) => [
                      ...prev,
                      { weekday: 1, start_time: '16:00', end_time: '17:00' },
                    ])
                  }
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/15 hover:text-white"
                >
                  + Día
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {schedules.map((s, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <select
                      value={s.weekday}
                      onChange={(e) => setSched(i, { weekday: Number(e.target.value) })}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
                    >
                      {WEEKDAYS.map((d, w) => (
                        <option key={w} value={w} className="text-slate-900">
                          {d}
                        </option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={s.start_time}
                      onChange={(e) => setSched(i, { start_time: e.target.value })}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none [color-scheme:dark] focus:border-white/40"
                    />
                    <span className="text-white/40">–</span>
                    <input
                      type="time"
                      value={s.end_time}
                      onChange={(e) => setSched(i, { end_time: e.target.value })}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none [color-scheme:dark] focus:border-white/40"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSchedules((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-red-400/20 hover:text-red-200"
                      aria-label="Quitar horario"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {schedules.length === 0 && (
                  <p className="text-xs text-white/35">Sin horarios asignados.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={close}
                className="rounded-full px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-cream rounded-full px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear grupo'}
              </button>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </>
  );
}
