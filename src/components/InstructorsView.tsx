import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { confirmDialog, alertDialog } from '@/lib/dialog';

interface Option {
  id: string;
  name: string;
}

export interface InstructorRow {
  id: string;
  profile_id: string;
  branch_id: string;
  name: string;
  phone: string | null;
  specialties: string[];
  certifications: string[];
  hourly_rate: number | null;
  hired_at: string | null;
  is_active: boolean;
  branch_name: string;
  groups_count: number;
}

interface Props {
  instructors: InstructorRow[];
  branches: Option[]; // vacío si no es superadmin
  showBranchSelect: boolean;
  canManage: boolean; // superadmin | branch_admin
}

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; instructor: InstructorRow }
  | null;

const inputClass =
  'mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40';

/** Vista de instructores: tabla + modal de alta (con cuenta) / edición. */
export default function InstructorsView({
  instructors,
  branches,
  showBranchSelect,
  canManage,
}: Props) {
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const editing = modal?.mode === 'edit' ? modal.instructor : null;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return instructors.filter((i) =>
      `${i.name} ${i.specialties.join(' ')}`.toLowerCase().includes(q),
    );
  }, [instructors, query]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  // Auto-abrir el formulario de alta si la URL trae ?nuevo=1 (acción rápida)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (canManage && params.get('nuevo') === '1') {
      setModal({ mode: 'create' });
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

  function close() {
    setModal(null);
    setError('');
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const url = editing ? `/api/instructors/${editing.id}` : '/api/instructors';
    const res = await fetch(url, {
      method: editing ? 'PATCH' : 'POST',
      body: new FormData(e.currentTarget),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? 'No se pudo guardar.');
    setSaving(false);
  }

  async function toggleActive(i: InstructorRow) {
    const action = i.is_active ? 'desactivar' : 'reactivar';
    if (!(await confirmDialog(`¿Seguro que quieres ${action} a ${i.name}?`, { tone: i.is_active ? 'danger' : 'default' }))) return;
    setTogglingId(i.id);
    const fd = new FormData();
    fd.set('is_active', String(!i.is_active));
    const res = await fetch(`/api/instructors/${i.id}`, {
      method: 'PATCH',
      body: fd,
    });
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
            onClick={() => setModal({ mode: 'create' })}
            className="bg-cream rounded-full px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
          >
            + Añadir instructor
          </button>
        </div>
      )}

      <div className="glass-soft rounded-3xl">
        <div className="border-b border-white/10 p-4">
          <input
            type="search"
            placeholder="Buscar instructor…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-sm rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/40"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50">
                <th className="px-5 py-3 font-medium">Instructor</th>
                <th className="px-5 py-3 font-medium">Sucursal</th>
                <th className="px-5 py-3 font-medium">Especialidades</th>
                <th className="px-5 py-3 font-medium">Grupos</th>
                <th className="px-5 py-3 font-medium">Tarifa/h</th>
                <th className="px-5 py-3 font-medium">Estatus</th>
                {canManage && <th className="px-5 py-3 font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr
                  key={i.id}
                  className={`border-t border-white/10 transition hover:bg-white/5 ${
                    i.is_active ? '' : 'opacity-50'
                  }`}
                >
                  <td className="px-5 py-3 text-white/90">
                    <span className="flex items-center gap-3">
                      <span className="bg-cream/90 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-slate-900">
                        {i.name.charAt(0)}
                      </span>
                      <span>
                        {i.name}
                        {i.phone && (
                          <span className="block text-xs text-white/40">
                            {i.phone}
                          </span>
                        )}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/70">{i.branch_name}</td>
                  <td className="px-5 py-3">
                    <span className="flex flex-wrap gap-1">
                      {i.specialties.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/60"
                        >
                          {s}
                        </span>
                      ))}
                      {i.specialties.length === 0 && (
                        <span className="text-white/30">—</span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/70">{i.groups_count}</td>
                  <td className="px-5 py-3 text-white/70">
                    {i.hourly_rate !== null
                      ? `$${i.hourly_rate.toLocaleString('es-MX')}`
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        i.is_active
                          ? 'bg-emerald-400/20 text-emerald-200'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {i.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-5 py-3">
                      <span className="flex gap-2">
                        <button
                          onClick={() => setModal({ mode: 'edit', instructor: i })}
                          title="Editar"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition hover:bg-white/15 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button
                          onClick={() => toggleActive(i)}
                          disabled={togglingId === i.id}
                          title={i.is_active ? 'Desactivar' : 'Reactivar'}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-40 ${
                            i.is_active
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
                    Sin instructores.
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
            className="modal-panel my-auto w-full max-w-md space-y-3.5 rounded-[2rem] border border-white/15 p-7 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                {editing ? 'Editar instructor' : 'Nuevo instructor'}
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

            <label className="block text-sm text-white/70">
              Nombre completo
              <input
                type="text"
                name="full_name"
                required
                defaultValue={editing?.name}
                className={inputClass}
              />
            </label>

            {!editing && (
              <>
                <label className="block text-sm text-white/70">
                  Correo (para iniciar sesión)
                  <input type="email" name="email" required className={inputClass} />
                </label>
                <label className="block text-sm text-white/70">
                  Contraseña temporal
                  <input
                    type="text"
                    name="password"
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres — compártela con el instructor"
                    className={inputClass}
                  />
                </label>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-white/70">
                Teléfono
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editing?.phone ?? ''}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm text-white/70">
                Tarifa por hora $
                <input
                  type="number"
                  name="hourly_rate"
                  min="0"
                  step="0.01"
                  defaultValue={editing?.hourly_rate ?? ''}
                  className={inputClass}
                />
              </label>
            </div>

            {showBranchSelect && !editing && (
              <label className="block text-sm text-white/70">
                Sucursal
                <select name="branch_id" required className={inputClass}>
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

            <label className="block text-sm text-white/70">
              Especialidades (separadas por comas)
              <input
                type="text"
                name="specialties"
                defaultValue={editing?.specialties.join(', ')}
                placeholder="bebés, competitivo, aquaerobics"
                className={inputClass}
              />
            </label>

            <label className="block text-sm text-white/70">
              Certificaciones (separadas por comas)
              <input
                type="text"
                name="certifications"
                defaultValue={editing?.certifications.join(', ')}
                placeholder="Cruz Roja, FMN nivel 2"
                className={inputClass}
              />
            </label>

            <label className="block text-sm text-white/70">
              Fecha de contratación
              <input
                type="date"
                name="hired_at"
                defaultValue={editing?.hired_at ?? ''}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </label>

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
                {saving
                  ? 'Guardando…'
                  : editing
                    ? 'Guardar cambios'
                    : 'Crear instructor'}
              </button>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </>
  );
}
