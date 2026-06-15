import { useState, type FormEvent } from 'react';
import { confirmDialog, alertDialog } from '@/lib/dialog';

interface Enrolled {
  enrollment_id: string;
  student_id: string;
  name: string;
  photo_url: string | null;
  status: string;
  waitlist_pos: number | null;
}

interface Option {
  id: string;
  name: string;
}

interface Props {
  groupId: string;
  enrolled: Enrolled[];
  available: Option[]; // alumnos activos de la sucursal aún no inscritos
  capacity: number;
  canManage: boolean;
}

const inputClass =
  'mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/40';

/** Alumnos inscritos en un grupo + inscribir/dar de baja. */
export default function EnrollmentsCard({
  groupId,
  enrolled,
  available,
  capacity,
  canManage,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const active = enrolled.filter((e) => e.status === 'active');
  const waitlist = enrolled
    .filter((e) => e.status === 'waitlisted')
    .sort((a, b) => (a.waitlist_pos ?? 0) - (b.waitlist_pos ?? 0));
  const isFull = active.length >= capacity;

  async function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch(`/api/groups/${groupId}/enrollments`, {
      method: 'POST',
      body: new FormData(e.currentTarget),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? 'No se pudo inscribir.');
    setSaving(false);
  }

  async function onRemove(en: Enrolled) {
    if (!(await confirmDialog(`¿Dar de baja a ${en.name} de este grupo?`, { tone: 'danger', confirmText: 'Dar de baja' }))) return;
    const res = await fetch(
      `/api/groups/${groupId}/enrollments?enrollment_id=${en.enrollment_id}`,
      { method: 'DELETE' },
    );
    if (res.ok) {
      window.location.reload();
      return;
    }
    void alertDialog('No se pudo dar de baja.');
  }

  function Row({ en, badge }: { en: Enrolled; badge?: string }) {
    return (
      <li className="flex items-center gap-3">
        {en.photo_url ? (
          <img
            src={en.photo_url}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full border border-white/15 object-cover"
          />
        ) : (
          <span className="bg-cream/90 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-slate-900">
            {en.name.charAt(0)}
          </span>
        )}
        <a
          href={`/dashboard/alumnos/${en.student_id}`}
          className="min-w-0 flex-1 truncate text-sm text-white/90 hover:underline underline-offset-4"
        >
          {en.name}
        </a>
        {badge && (
          <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs text-amber-200">
            {badge}
          </span>
        )}
        {canManage && (
          <button
            onClick={() => onRemove(en)}
            title="Dar de baja"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-red-400/20 hover:text-red-200"
          >
            ✕
          </button>
        )}
      </li>
    );
  }

  return (
    <div className="glass-soft rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-white/80">
          Alumnos{' '}
          <span className={isFull ? 'text-amber-200' : 'text-white/40'}>
            {active.length}/{capacity}
          </span>
        </h2>
        {canManage && !adding && available.length > 0 && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70 transition hover:bg-white/15 hover:text-white"
          >
            + Inscribir
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={onAdd} className="mt-4 space-y-3 border-b border-white/10 pb-4">
          {error && (
            <p className="rounded-xl bg-red-400/15 p-2.5 text-xs text-red-200">
              {error}
            </p>
          )}
          {isFull && (
            <p className="rounded-xl bg-amber-400/10 p-2.5 text-xs text-amber-200">
              Cupo lleno: el alumno entrará a la lista de espera.
            </p>
          )}
          <label className="block text-sm text-white/70">
            Alumno
            <select name="student_id" required className={inputClass}>
              <option value="" className="text-slate-900">
                Selecciona…
              </option>
              {available.map((s) => (
                <option key={s.id} value={s.id} className="text-slate-900">
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setAdding(false); setError(''); }}
              className="rounded-full px-4 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-cream rounded-full px-5 py-2 text-xs font-semibold text-slate-900 shadow transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? 'Inscribiendo…' : 'Inscribir'}
            </button>
          </div>
        </form>
      )}

      <ul className="mt-4 space-y-3">
        {active.map((en) => (
          <Row key={en.enrollment_id} en={en} />
        ))}
        {active.length === 0 && (
          <li className="py-2 text-sm text-white/40">Sin alumnos inscritos.</li>
        )}
      </ul>

      {waitlist.length > 0 && (
        <>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-amber-200/70">
            Lista de espera
          </p>
          <ul className="mt-3 space-y-3">
            {waitlist.map((en, i) => (
              <Row key={en.enrollment_id} en={en} badge={`#${i + 1}`} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
