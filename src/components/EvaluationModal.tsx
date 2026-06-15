import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';

interface Level {
  id: string;
  name: string;
}

interface Skill {
  id: string;
  level_id: string;
  name: string;
}

interface Props {
  studentId: string;
  studentLevelId: string | null;
  levels: Level[];
  skills: Skill[];
  canPromote: boolean; // staff sí, instructor no
}

const RESULTS = [
  { value: 'not_attempted', label: 'No intentado', cls: 'bg-white/10 text-white/50' },
  { value: 'in_progress', label: 'En progreso', cls: 'bg-amber-400/20 text-amber-200' },
  { value: 'achieved', label: 'Logrado', cls: 'bg-emerald-400/25 text-emerald-200' },
] as const;

const inputClass =
  'mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-white/40';

/** Botón "Evaluar" + modal de rúbrica por nivel. */
export default function EvaluationModal({
  studentId,
  studentLevelId,
  levels,
  skills,
  canPromote,
}: Props) {
  const [open, setOpen] = useState(false);
  const [levelId, setLevelId] = useState(studentLevelId ?? levels[0]?.id ?? '');
  const [results, setResults] = useState<Record<string, string>>({});
  const [passed, setPassed] = useState(false);
  const [promote, setPromote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const levelSkills = useMemo(
    () => skills.filter((s) => s.level_id === levelId),
    [skills, levelId],
  );

  const allAchieved =
    levelSkills.length > 0 &&
    levelSkills.every((s) => results[s.id] === 'achieved');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function openModal() {
    setLevelId(studentLevelId ?? levels[0]?.id ?? '');
    setResults({});
    setPassed(false);
    setPromote(false);
    setError('');
    setOpen(true);
  }

  function cycle(skillId: string) {
    setResults((prev) => {
      const order = ['not_attempted', 'in_progress', 'achieved'];
      const current = prev[skillId] ?? 'not_attempted';
      const next = order[(order.indexOf(current) + 1) % order.length];
      return { ...prev, [skillId]: next };
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    fd.set('level_id', levelId);
    fd.set('passed_level', String(passed));
    fd.set('promote', String(promote));
    fd.set(
      'scores',
      JSON.stringify(
        levelSkills.map((s) => ({
          skill_id: s.id,
          result: results[s.id] ?? 'not_attempted',
        })),
      ),
    );
    const res = await fetch(`/api/students/${studentId}/evaluations`, {
      method: 'POST',
      body: fd,
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      if (body.warnings?.length) alert(body.warnings.join('\n'));
      window.location.reload();
      return;
    }
    setError(body.error ?? 'No se pudo guardar.');
    setSaving(false);
  }

  return (
    <>
      <button
        onClick={openModal}
        className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70 transition hover:bg-white/15 hover:text-white"
      >
        + Evaluar
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <form
            onSubmit={onSubmit}
            className="modal-panel my-auto w-full max-w-md space-y-4 rounded-[2rem] border border-white/15 bg-[#0d2436]/95 p-7 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Nueva evaluación
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
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
              Nivel evaluado
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                className={inputClass}
              >
                {levels.map((l) => (
                  <option key={l.id} value={l.id} className="text-slate-900">
                    {l.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Rúbrica: tocar para alternar resultado */}
            <div>
              <p className="text-sm text-white/70">
                Habilidades{' '}
                <span className="text-xs text-white/40">(toca para cambiar)</span>
              </p>
              <ul className="mt-2 space-y-2">
                {levelSkills.map((s) => {
                  const r =
                    RESULTS.find((x) => x.value === (results[s.id] ?? 'not_attempted')) ??
                    RESULTS[0];
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => cycle(s.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10"
                      >
                        <span className="text-sm text-white/90">{s.name}</span>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${r.cls}`}>
                          {r.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {levelSkills.length === 0 && (
                  <li className="py-2 text-sm text-white/40">
                    Este nivel no tiene habilidades definidas (agrégalas en Rúbricas).
                  </li>
                )}
              </ul>
            </div>

            <label className="block text-sm text-white/70">
              Notas (opcional)
              <textarea
                name="notes"
                rows={2}
                className="mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
              />
            </label>

            <div className="space-y-2 rounded-2xl bg-white/5 p-4">
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={passed}
                  onChange={(e) => setPassed(e.target.checked)}
                  className="accent-[#f7f3e8]"
                />
                Aprueba el nivel
                {allAchieved && !passed && (
                  <span className="text-xs text-emerald-200">
                    (todas logradas ✓)
                  </span>
                )}
              </label>
              {passed && canPromote && (
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={promote}
                    onChange={(e) => setPromote(e.target.checked)}
                    className="accent-[#f7f3e8]"
                  />
                  Promover al siguiente nivel
                </label>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || levelSkills.length === 0}
                className="bg-cream rounded-full px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Guardar evaluación'}
              </button>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </>
  );
}
