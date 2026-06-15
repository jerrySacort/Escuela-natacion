import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { confirmDialog, alertDialog } from '@/lib/dialog';

interface Option {
  id: string;
  name: string;
}

export interface StudentRow {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  is_active: boolean;
  photo_url: string | null;
  level_id: string | null;
  branch_id: string;
  medical_notes: string | null;
  sex: 'F' | 'M' | null;
  levels: { name: string } | null;
}

interface Props {
  students: StudentRow[];
  branches: Option[]; // vacío si el usuario no es superadmin
  levels: Option[];
  guardians: Option[]; // perfiles con rol parent
  showBranchSelect: boolean;
  canManage: boolean;
}

type ModalState = { mode: 'create' } | { mode: 'edit'; student: StudentRow } | null;

const RELATIONSHIPS = ['madre', 'padre', 'tutor', 'abuelo/a', 'otro'];

const inputClass =
  'mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40';

function age(birthDate: string): number {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

/** Vista de alumnos: tabla con búsqueda + modal de alta/edición + activar/desactivar. */
export default function StudentsView({
  students,
  branches,
  levels,
  guardians,
  showBranchSelect,
  canManage,
}: Props) {
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [guardianId, setGuardianId] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const editing = modal?.mode === 'edit' ? modal.student : null;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return students.filter((s) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q),
    );
  }, [students, query]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

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

  function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function close() {
    setModal(null);
    setPhotoPreview(null);
    setGuardianId('');
    setError('');
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const url = editing ? `/api/students/${editing.id}` : '/api/students';
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

  async function toggleActive(s: StudentRow) {
    const action = s.is_active ? 'desactivar' : 'reactivar';
    if (!(await confirmDialog(`¿Seguro que quieres ${action} a ${s.first_name} ${s.last_name}?`, { tone: s.is_active ? 'danger' : 'default' })))
      return;
    setTogglingId(s.id);
    const fd = new FormData();
    fd.set('is_active', String(!s.is_active));
    const res = await fetch(`/api/students/${s.id}`, { method: 'PATCH', body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setTogglingId(null);
    void alertDialog('No se pudo cambiar el estatus.');
  }

  const currentPhoto = photoPreview ?? editing?.photo_url ?? null;

  return (
    <>
      {canManage && (
        <div className="-mt-2 mb-5 flex justify-end">
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="bg-cream rounded-full px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
          >
            + Añadir alumno
          </button>
        </div>
      )}

      <div className="glass-soft rounded-3xl">
        <div className="border-b border-white/10 p-4">
          <input
            type="search"
            placeholder="Buscar alumno…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-sm rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/40"
          />
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="text-left text-white/50">
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Edad</th>
              <th className="px-5 py-3 font-medium">Nivel</th>
              <th className="px-5 py-3 font-medium">Estatus</th>
              {canManage && <th className="px-5 py-3 font-medium">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className={`border-t border-white/10 transition hover:bg-white/5 ${
                  s.is_active ? '' : 'opacity-50'
                }`}
              >
                <td className="px-5 py-3 text-white/90">
                  <a
                    href={`/dashboard/alumnos/${s.id}`}
                    className="flex items-center gap-3 hover:underline underline-offset-4"
                  >
                    {s.photo_url ? (
                      <img
                        src={s.photo_url}
                        alt=""
                        className="h-9 w-9 rounded-full border border-white/15 object-cover"
                      />
                    ) : (
                      <span className="bg-cream/90 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-slate-900">
                        {s.first_name.charAt(0)}
                      </span>
                    )}
                    {s.last_name}, {s.first_name}
                  </a>
                </td>
                <td className="px-5 py-3 text-white/70">{age(s.birth_date)} años</td>
                <td className="px-5 py-3 text-white/70">{s.levels?.name ?? '—'}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      s.is_active
                        ? 'bg-emerald-400/20 text-emerald-200'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {s.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                {canManage && (
                  <td className="px-5 py-3">
                    <span className="flex gap-2">
                      <button
                        onClick={() => setModal({ mode: 'edit', student: s })}
                        title="Editar"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60 transition hover:bg-white/15 hover:text-white"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                      <button
                        onClick={() => toggleActive(s)}
                        disabled={togglingId === s.id}
                        title={s.is_active ? 'Desactivar' : 'Reactivar'}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-40 ${
                          s.is_active
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
                  colSpan={canManage ? 5 : 4}
                  className="px-5 py-10 text-center text-white/40"
                >
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Portal a <body>: el backdrop-filter del panel glass crea un
          containing block que rompería position:fixed dentro de él */}
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
                {editing ? 'Editar alumno' : 'Nuevo alumno'}
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

            {/* Foto */}
            <div className="flex items-center gap-4">
              <label
                className="group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-white/25 bg-white/5 transition hover:border-white/50"
                title="Subir fotografía"
              >
                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl text-white/40 group-hover:text-white/70">
                    📷
                  </span>
                )}
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={onPhotoChange}
                  className="hidden"
                />
              </label>
              <div className="text-sm text-white/50">
                {editing ? 'Cambiar fotografía' : 'Fotografía (opcional)'}
                <span className="block text-xs text-white/30">
                  JPG o PNG, máx. 5 MB
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-white/70">
                Nombre(s)
                <input
                  type="text"
                  name="first_name"
                  required
                  defaultValue={editing?.first_name}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm text-white/70">
                Apellidos
                <input
                  type="text"
                  name="last_name"
                  required
                  defaultValue={editing?.last_name}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block text-sm text-white/70">
              Fecha de nacimiento
              <input
                type="date"
                name="birth_date"
                required
                defaultValue={editing?.birth_date}
                max={new Date().toISOString().slice(0, 10)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </label>

            <label className="block text-sm text-white/70">
              Sexo
              <select
                name="sex"
                defaultValue={editing?.sex ?? ''}
                className={inputClass}
              >
                <option value="" className="text-slate-900">Sin especificar</option>
                <option value="F" className="text-slate-900">Niña</option>
                <option value="M" className="text-slate-900">Niño</option>
              </select>
            </label>

            {showBranchSelect && (
              <label className="block text-sm text-white/70">
                Sucursal
                <select
                  name="branch_id"
                  required
                  defaultValue={editing?.branch_id ?? ''}
                  className={inputClass}
                >
                  <option value="" className="text-slate-900">
                    Selecciona una sucursal…
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
              Nivel (opcional)
              <select
                name="level_id"
                defaultValue={editing?.level_id ?? ''}
                className={inputClass}
              >
                <option value="" className="text-slate-900">
                  Sin nivel asignado
                </option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id} className="text-slate-900">
                    {l.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Tutor: solo en alta; la edición de tutores vendrá en el expediente */}
            {!editing && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm text-white/70">
                  Padre / tutor (opcional)
                  <select
                    name="guardian_id"
                    value={guardianId}
                    onChange={(e) => setGuardianId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="" className="text-slate-900">
                      Sin vincular
                    </option>
                    {guardians.map((g) => (
                      <option key={g.id} value={g.id} className="text-slate-900">
                        {g.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-white/70">
                  Parentesco
                  <select
                    name="relationship"
                    disabled={!guardianId}
                    className={`${inputClass} disabled:opacity-40`}
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r} className="text-slate-900">
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <label className="block text-sm text-white/70">
              Notas médicas (opcional)
              <textarea
                name="medical_notes"
                rows={2}
                defaultValue={editing?.medical_notes ?? ''}
                placeholder="Alergias, condiciones, medicamentos…"
                className="mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
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
                {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Guardar alumno'}
              </button>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </>
  );
}
