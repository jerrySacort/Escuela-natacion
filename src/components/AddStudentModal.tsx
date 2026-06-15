import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';

interface Option {
  id: string;
  name: string;
}

interface Props {
  branches: Option[]; // vacío si el usuario no es superadmin
  levels: Option[];
  guardians: Option[]; // perfiles con rol parent
  showBranchSelect: boolean;
}

const RELATIONSHIPS = ['madre', 'padre', 'tutor', 'abuelo/a', 'otro'];

const inputClass =
  'mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40';

/** Botón "Añadir alumno" + modal glass de alta. */
export default function AddStudentModal({
  branches,
  levels,
  guardians,
  showBranchSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [guardianId, setGuardianId] = useState('');

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Liberar el object URL de la vista previa
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function close() {
    setOpen(false);
    setPhotoPreview(null);
    setGuardianId('');
    setError('');
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/students', {
      method: 'POST',
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-cream rounded-full px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
      >
        + Añadir alumno
      </button>

      {/* Portal a <body>: el backdrop-filter del panel glass crea un
          containing block que rompería position:fixed dentro de él */}
      {open && typeof document !== 'undefined' && createPortal(
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
                Nuevo alumno
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
                {photoPreview ? (
                  <img
                    src={photoPreview}
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
                Fotografía (opcional)
                <span className="block text-xs text-white/30">
                  JPG o PNG, máx. 5 MB
                </span>
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

            {showBranchSelect && (
              <label className="block text-sm text-white/70">
                Sucursal
                <select name="branch_id" required className={inputClass}>
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
              <select name="level_id" className={inputClass}>
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

            {/* Tutor */}
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

            <label className="block text-sm text-white/70">
              Notas médicas (opcional)
              <textarea
                name="medical_notes"
                rows={2}
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
                {saving ? 'Guardando…' : 'Guardar alumno'}
              </button>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </>
  );
}
