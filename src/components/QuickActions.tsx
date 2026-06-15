import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

interface Option {
  id: string;
  name: string;
}
interface BranchScoped extends Option {
  branch_id: string;
}
interface Schedule {
  weekday: number;
  start_time: string;
  end_time: string;
}

interface Props {
  canManage: boolean;
  canInstructors: boolean;
  showBranchSelect: boolean;
  defaultBranchId: string;
  branches: Option[];
  levels: Option[];
  guardians: Option[];
  instructors: BranchScoped[];
  pools: BranchScoped[];
}

type Active = 'alumno' | 'grupo' | 'instructor' | null;

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const RELATIONSHIPS = ['madre', 'padre', 'tutor', 'abuelo/a', 'otro'];

const inputClass =
  'mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40';
const pillClass =
  'glass-soft flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium text-white/85 transition hover:-translate-y-0.5 hover:bg-white/10';

/** Acciones rápidas del dashboard: abren el formulario de alta inline (sin redirigir). */
export default function QuickActions({
  canManage,
  canInstructors,
  showBranchSelect,
  defaultBranchId,
  branches,
  levels,
  guardians,
  instructors,
  pools,
}: Props) {
  const [active, setActive] = useState<Active>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Alumno
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [guardianId, setGuardianId] = useState('');

  // Grupo
  const [branchId, setBranchId] = useState(defaultBranchId);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const branchInstructors = useMemo(
    () => instructors.filter((i) => !branchId || i.branch_id === branchId),
    [instructors, branchId],
  );
  const branchPools = useMemo(
    () => pools.filter((p) => !branchId || p.branch_id === branchId),
    [pools, branchId],
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function close() {
    setActive(null);
    setError('');
    setSaving(false);
    setPhotoPreview(null);
    setGuardianId('');
  }

  function openGrupo() {
    setBranchId(defaultBranchId);
    setSchedules([{ weekday: 1, start_time: '16:00', end_time: '17:00' }]);
    setError('');
    setActive('grupo');
  }

  function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function setSched(i: number, patch: Partial<Schedule>) {
    setSchedules((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  }

  async function submitStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/students', {
      method: 'POST',
      body: new FormData(e.currentTarget),
    });
    if (res.ok) return window.location.reload();
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? 'No se pudo guardar.');
    setSaving(false);
  }

  async function submitGroup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    fd.set('schedules', JSON.stringify(schedules));
    const res = await fetch('/api/groups', { method: 'POST', body: fd });
    if (res.ok) return window.location.reload();
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? 'No se pudo guardar.');
    setSaving(false);
  }

  async function submitInstructor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/instructors', {
      method: 'POST',
      body: new FormData(e.currentTarget),
    });
    if (res.ok) return window.location.reload();
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? 'No se pudo guardar.');
    setSaving(false);
  }

  function IconBox({ children }: { children: ReactNode }) {
    return (
      <span className="bg-cream grid h-8 w-8 place-items-center rounded-xl text-base text-slate-900">
        {children}
      </span>
    );
  }

  function modalShell(title: string, body: ReactNode, onSubmit: (e: FormEvent<HTMLFormElement>) => void, submitLabel: string, maxW: string) {
    return createPortal(
      <div
        className="modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <form
          onSubmit={onSubmit}
          className={`modal-panel my-auto w-full ${maxW} space-y-3.5 rounded-[2rem] border border-white/15 p-7 text-white shadow-2xl`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
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
            <p className="rounded-xl bg-red-400/15 p-3 text-sm text-red-200">{error}</p>
          )}
          {body}
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
              {saving ? 'Guardando…' : submitLabel}
            </button>
          </div>
        </form>
      </div>,
      document.body,
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-white/50">
        Acciones rápidas
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
        {canManage && (
          <button type="button" onClick={() => { setError(''); setActive('alumno'); }} className={pillClass}>
            <IconBox>🏊</IconBox>
            <span className="flex items-center gap-1.5"><span className="text-white/40">+</span>Nuevo alumno</span>
          </button>
        )}
        {canManage && (
          <button type="button" onClick={openGrupo} className={pillClass}>
            <IconBox>🗓️</IconBox>
            <span className="flex items-center gap-1.5"><span className="text-white/40">+</span>Nuevo grupo</span>
          </button>
        )}
        {canInstructors && (
          <button type="button" onClick={() => { setError(''); setActive('instructor'); }} className={pillClass}>
            <IconBox>🧑‍🏫</IconBox>
            <span className="flex items-center gap-1.5"><span className="text-white/40">+</span>Nuevo instructor</span>
          </button>
        )}
        {canManage && (
          <a href="/dashboard/pagos" className={pillClass}>
            <IconBox>💳</IconBox>
            <span>Registrar pago</span>
          </a>
        )}
        {canManage && (
          <a href="/dashboard/asistencia" className={pillClass}>
            <IconBox>✅</IconBox>
            <span>Pase de lista</span>
          </a>
        )}
      </div>

      {/* Modal: nuevo alumno */}
      {active === 'alumno' &&
        typeof document !== 'undefined' &&
        modalShell(
          'Nuevo alumno',
          <>
            <div className="flex items-center gap-4">
              <label
                className="group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-white/25 bg-white/5 transition hover:border-white/50"
                title="Subir fotografía"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Vista previa" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl text-white/40 group-hover:text-white/70">📷</span>
                )}
                <input type="file" name="photo" accept="image/*" onChange={onPhotoChange} className="hidden" />
              </label>
              <div className="text-sm text-white/50">
                Fotografía (opcional)
                <span className="block text-xs text-white/30">JPG o PNG, máx. 5 MB</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-white/70">
                Nombre(s)
                <input type="text" name="first_name" required className={inputClass} />
              </label>
              <label className="block text-sm text-white/70">
                Apellidos
                <input type="text" name="last_name" required className={inputClass} />
              </label>
            </div>
            <label className="block text-sm text-white/70">
              Fecha de nacimiento
              <input
                type="date"
                name="birth_date"
                required
                max={new Date().toISOString().slice(0, 10)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </label>
            <label className="block text-sm text-white/70">
              Sexo
              <select name="sex" className={inputClass}>
                <option value="" className="text-slate-900">Sin especificar</option>
                <option value="F" className="text-slate-900">Niña</option>
                <option value="M" className="text-slate-900">Niño</option>
              </select>
            </label>
            {showBranchSelect && (
              <label className="block text-sm text-white/70">
                Sucursal
                <select name="branch_id" required className={inputClass}>
                  <option value="" className="text-slate-900">Selecciona una sucursal…</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="text-slate-900">{b.name}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="block text-sm text-white/70">
              Nivel (opcional)
              <select name="level_id" className={inputClass}>
                <option value="" className="text-slate-900">Sin nivel asignado</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id} className="text-slate-900">{l.name}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-white/70">
                Padre / tutor (opcional)
                <select
                  name="guardian_id"
                  value={guardianId}
                  onChange={(e) => setGuardianId(e.target.value)}
                  className={inputClass}
                >
                  <option value="" className="text-slate-900">Sin vincular</option>
                  {guardians.map((g) => (
                    <option key={g.id} value={g.id} className="text-slate-900">{g.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-white/70">
                Parentesco
                <select name="relationship" disabled={!guardianId} className={`${inputClass} disabled:opacity-40`}>
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r} className="text-slate-900">{r}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm text-white/70">
              Notas médicas (opcional)
              <textarea
                name="medical_notes"
                rows={2}
                placeholder="Alergias, condiciones, medicamentos…"
                className="mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
              />
            </label>
          </>,
          submitStudent,
          'Guardar alumno',
          'max-w-md',
        )}

      {/* Modal: nuevo grupo */}
      {active === 'grupo' &&
        typeof document !== 'undefined' &&
        modalShell(
          'Nuevo grupo',
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-white/70">
                Nombre del grupo
                <input type="text" name="name" required placeholder="Delfines vespertino" className={inputClass} />
              </label>
              <label className="block text-sm text-white/70">
                Nivel
                <select name="level_id" required defaultValue="" className={inputClass}>
                  <option value="" className="text-slate-900">Selecciona…</option>
                  {levels.map((l) => (
                    <option key={l.id} value={l.id} className="text-slate-900">{l.name}</option>
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
                  <option value="" className="text-slate-900">Selecciona…</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="text-slate-900">{b.name}</option>
                  ))}
                </select>
              </label>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-white/70">
                Instructor (opcional)
                <select name="instructor_id" defaultValue="" className={inputClass}>
                  <option value="" className="text-slate-900">Sin asignar</option>
                  {branchInstructors.map((i) => (
                    <option key={i.id} value={i.id} className="text-slate-900">{i.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-white/70">
                Alberca (opcional)
                <select name="pool_id" defaultValue="" className={inputClass}>
                  <option value="" className="text-slate-900">Sin asignar</option>
                  {branchPools.map((p) => (
                    <option key={p.id} value={p.id} className="text-slate-900">{p.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <label className="block text-sm text-white/70">
                Carril
                <input type="number" name="lane" min="1" className={inputClass} />
              </label>
              <label className="block text-sm text-white/70">
                Cupo
                <input type="number" name="capacity" min="1" required defaultValue={8} className={inputClass} />
              </label>
              <label className="block text-sm text-white/70">
                Mensualidad $
                <input type="number" name="monthly_fee" min="0" step="0.01" required className={inputClass} />
              </label>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Horarios</span>
                <button
                  type="button"
                  onClick={() =>
                    setSchedules((prev) => [...prev, { weekday: 1, start_time: '16:00', end_time: '17:00' }])
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
                        <option key={w} value={w} className="text-slate-900">{d}</option>
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
                      onClick={() => setSchedules((prev) => prev.filter((_, j) => j !== i))}
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
          </>,
          submitGroup,
          'Crear grupo',
          'max-w-lg',
        )}

      {/* Modal: nuevo instructor */}
      {active === 'instructor' &&
        typeof document !== 'undefined' &&
        modalShell(
          'Nuevo instructor',
          <>
            <label className="block text-sm text-white/70">
              Nombre completo
              <input type="text" name="full_name" required className={inputClass} />
            </label>
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
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-white/70">
                Teléfono
                <input type="tel" name="phone" className={inputClass} />
              </label>
              <label className="block text-sm text-white/70">
                Tarifa por hora $
                <input type="number" name="hourly_rate" min="0" step="0.01" className={inputClass} />
              </label>
            </div>
            {showBranchSelect && (
              <label className="block text-sm text-white/70">
                Sucursal
                <select name="branch_id" required className={inputClass}>
                  <option value="" className="text-slate-900">Selecciona…</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="text-slate-900">{b.name}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="block text-sm text-white/70">
              Especialidades (separadas por comas)
              <input type="text" name="specialties" placeholder="bebés, competitivo, aquaerobics" className={inputClass} />
            </label>
            <label className="block text-sm text-white/70">
              Certificaciones (separadas por comas)
              <input type="text" name="certifications" placeholder="Cruz Roja, FMN nivel 2" className={inputClass} />
            </label>
            <label className="block text-sm text-white/70">
              Fecha de contratación
              <input type="date" name="hired_at" className={`${inputClass} [color-scheme:dark]`} />
            </label>
          </>,
          submitInstructor,
          'Crear instructor',
          'max-w-md',
        )}
    </section>
  );
}
