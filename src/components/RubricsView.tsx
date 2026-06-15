import { useState, type FormEvent } from 'react';
import { confirmDialog, alertDialog } from '@/lib/dialog';

interface Skill {
  id: string;
  level_id: string;
  name: string;
  sort_order: number;
}

interface Level {
  id: string;
  name: string;
  description: string | null;
}

interface Props {
  levels: Level[];
  skills: Skill[];
  canEdit: boolean; // solo superadmin
}

/** Catálogo de rúbricas: habilidades por nivel con CRUD inline. */
export default function RubricsView({ levels, skills, canEdit }: Props) {
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [saving, setSaving] = useState(false);

  async function onAdd(e: FormEvent<HTMLFormElement>, level: Level) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.set('level_id', level.id);
    const count = skills.filter((s) => s.level_id === level.id).length;
    fd.set('sort_order', String(count + 1));
    const res = await fetch('/api/skills', { method: 'POST', body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    void alertDialog(body.error ?? 'No se pudo crear.');
    setSaving(false);
  }

  async function onRename(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/skills/${editing.id}`, {
      method: 'PATCH',
      body: new FormData(e.currentTarget),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    void alertDialog(body.error ?? 'No se pudo renombrar.');
    setSaving(false);
  }

  async function onDelete(skill: Skill) {
    if (!(await confirmDialog(`¿Eliminar "${skill.name}" de la rúbrica?`, { tone: 'danger', confirmText: 'Eliminar' }))) return;
    const res = await fetch(`/api/skills/${skill.id}`, { method: 'DELETE' });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    void alertDialog(body.error ?? 'No se pudo eliminar.');
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {levels.map((level) => {
        const levelSkills = skills
          .filter((s) => s.level_id === level.id)
          .sort((a, b) => a.sort_order - b.sort_order);
        return (
          <div key={level.id} className="glass-soft rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-white/90">{level.name}</h2>
              <span className="text-xs text-white/40">
                {levelSkills.length} habilidades
              </span>
            </div>
            {level.description && (
              <p className="mt-1 text-xs text-white/40">{level.description}</p>
            )}

            <ul className="mt-4 space-y-2">
              {levelSkills.map((s) => (
                <li
                  key={s.id}
                  className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5"
                >
                  {editing?.id === s.id ? (
                    <form onSubmit={onRename} className="flex flex-1 gap-2">
                      <input
                        type="text"
                        name="name"
                        defaultValue={s.name}
                        autoFocus
                        required
                        className="flex-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white outline-none"
                      />
                      <button
                        disabled={saving}
                        className="bg-cream rounded-full px-3 py-1 text-xs font-semibold text-slate-900"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="text-xs text-white/40 hover:text-white"
                      >
                        ✕
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-white/80">{s.name}</span>
                      {canEdit && (
                        <span className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                          <button
                            onClick={() => setEditing(s)}
                            title="Renombrar"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => onDelete(s)}
                            title="Eliminar"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-white/40 hover:bg-red-400/20 hover:text-red-200"
                          >
                            ✕
                          </button>
                        </span>
                      )}
                    </>
                  )}
                </li>
              ))}
              {levelSkills.length === 0 && (
                <li className="py-1 text-sm text-white/35">Sin habilidades.</li>
              )}
            </ul>

            {canEdit &&
              (addingTo === level.id ? (
                <form
                  onSubmit={(e) => onAdd(e, level)}
                  className="mt-3 flex gap-2"
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Nueva habilidad…"
                    autoFocus
                    required
                    className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
                  />
                  <button
                    disabled={saving}
                    className="bg-cream rounded-full px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
                  >
                    Añadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingTo(null)}
                    className="text-xs text-white/40 hover:text-white"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setAddingTo(level.id)}
                  className="mt-3 w-full rounded-full border border-dashed border-white/15 py-2 text-xs text-white/40 transition hover:border-white/30 hover:text-white/70"
                >
                  + Añadir habilidad
                </button>
              ))}
          </div>
        );
      })}
    </div>
  );
}
