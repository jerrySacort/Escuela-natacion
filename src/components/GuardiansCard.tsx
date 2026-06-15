import { useState, type FormEvent } from 'react';

interface Linked {
  guardian_id: string;
  relationship: string;
  is_primary: boolean;
  name: string;
  phone: string | null;
}

interface Option {
  id: string;
  name: string;
}

interface Props {
  studentId: string;
  linked: Linked[];
  parents: Option[]; // todos los perfiles con rol parent
  canManage: boolean;
}

const RELATIONSHIPS = ['madre', 'padre', 'tutor', 'abuelo/a', 'otro'];

const inputClass =
  'mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40';

/** Tarjeta de tutores: lista + vincular cuenta existente o crear una nueva. */
export default function GuardiansCard({ studentId, linked, parents, canManage }: Props) {
  const [mode, setMode] = useState<'closed' | 'existing' | 'new'>('closed');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const available = parents.filter(
    (p) => !linked.some((l) => l.guardian_id === p.id),
  );

  function close() {
    setMode('closed');
    setError('');
  }

  async function submit(url: string, form: HTMLFormElement) {
    setSaving(true);
    setError('');
    const res = await fetch(url, { method: 'POST', body: new FormData(form) });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? 'No se pudo guardar.');
    setSaving(false);
  }

  function onLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void submit(`/api/students/${studentId}/guardians`, e.currentTarget);
  }

  function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void submit('/api/parents', e.currentTarget);
  }

  async function onRemove(g: Linked) {
    if (!confirm(`¿Desvincular a ${g.name}?`)) return;
    const res = await fetch(
      `/api/students/${studentId}/guardians?guardian_id=${g.guardian_id}`,
      { method: 'DELETE' },
    );
    if (res.ok) {
      window.location.reload();
      return;
    }
    alert('No se pudo desvincular.');
  }

  const relationshipSelect = (
    <label className="block text-sm text-white/70">
      Parentesco
      <select name="relationship" className={inputClass}>
        {RELATIONSHIPS.map((r) => (
          <option key={r} value={r} className="text-slate-900">
            {r}
          </option>
        ))}
      </select>
    </label>
  );

  const primaryCheck = (
    <label className="flex items-end gap-2 pb-2.5 text-sm text-white/70">
      <input type="checkbox" name="is_primary" value="true" className="accent-[#f7f3e8]" />
      Principal
    </label>
  );

  const footer = (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={close}
        className="rounded-full px-4 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={saving}
        className="bg-cream rounded-full px-5 py-2 text-xs font-semibold text-slate-900 shadow transition hover:-translate-y-0.5 disabled:opacity-50"
      >
        {saving ? 'Guardando…' : mode === 'new' ? 'Crear y vincular' : 'Vincular'}
      </button>
    </div>
  );

  return (
    <div className="glass-soft rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-white/80">Padres y tutores</h2>
        {canManage && mode === 'closed' && (
          <button
            onClick={() => setMode('existing')}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70 transition hover:bg-white/15 hover:text-white"
          >
            + Vincular
          </button>
        )}
      </div>

      <ul className="mt-4 space-y-3">
        {linked.map((g) => (
          <li key={g.guardian_id} className="flex items-center gap-3">
            <span className="bg-cream/90 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-slate-900">
              {g.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white/90">
                {g.name}
                {g.is_primary && (
                  <span className="bg-cream ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-900">
                    principal
                  </span>
                )}
              </p>
              <p className="text-xs text-white/40">
                {g.relationship}
                {g.phone ? ` · ${g.phone}` : ''}
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => onRemove(g)}
                title="Desvincular"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-red-400/20 hover:text-red-200"
              >
                ✕
              </button>
            )}
          </li>
        ))}
        {linked.length === 0 && (
          <li className="py-2 text-sm text-white/40">Sin tutores vinculados.</li>
        )}
      </ul>

      {mode !== 'closed' && (
        <div className="mt-4 border-t border-white/10 pt-4">
          {/* Pestañas */}
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => { setMode('existing'); setError(''); }}
              className={`rounded-full px-4 py-1.5 text-xs transition ${
                mode === 'existing'
                  ? 'bg-cream font-semibold text-slate-900'
                  : 'glass-soft text-white/60 hover:text-white'
              }`}
            >
              Cuenta existente
            </button>
            <button
              type="button"
              onClick={() => { setMode('new'); setError(''); }}
              className={`rounded-full px-4 py-1.5 text-xs transition ${
                mode === 'new'
                  ? 'bg-cream font-semibold text-slate-900'
                  : 'glass-soft text-white/60 hover:text-white'
              }`}
            >
              Nueva cuenta
            </button>
          </div>

          {error && (
            <p className="mb-3 rounded-xl bg-red-400/15 p-2.5 text-xs text-red-200">
              {error}
            </p>
          )}

          {mode === 'existing' && (
            <form onSubmit={onLink} className="space-y-3">
              <label className="block text-sm text-white/70">
                Tutor
                <select name="guardian_id" required className={inputClass}>
                  <option value="" className="text-slate-900">
                    Selecciona…
                  </option>
                  {available.map((p) => (
                    <option key={p.id} value={p.id} className="text-slate-900">
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {relationshipSelect}
                {primaryCheck}
              </div>
              {footer}
            </form>
          )}

          {mode === 'new' && (
            <form onSubmit={onCreate} className="space-y-3">
              <input type="hidden" name="student_id" value={studentId} />
              <label className="block text-sm text-white/70">
                Nombre completo
                <input type="text" name="full_name" required className={inputClass} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm text-white/70">
                  Correo
                  <input type="email" name="email" required className={inputClass} />
                </label>
                <label className="block text-sm text-white/70">
                  Teléfono
                  <input type="tel" name="phone" className={inputClass} />
                </label>
              </div>
              <label className="block text-sm text-white/70">
                Contraseña temporal
                <input
                  type="text"
                  name="password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres — compártela con el padre"
                  className={inputClass}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                {relationshipSelect}
                {primaryCheck}
              </div>
              <p className="text-xs text-white/35">
                La cuenta queda activa de inmediato, sin correo de confirmación.
              </p>
              {footer}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
