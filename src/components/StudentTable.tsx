import { useMemo, useState } from 'react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  is_active: boolean;
  photo_url: string | null;
  levels: { name: string } | null;
}

function age(birthDate: string): number {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

/** React Island: tabla de alumnos con búsqueda client-side (estilo glass). */
export default function StudentTable({ students }: { students: Student[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return students.filter((s) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q),
    );
  }, [students, query]);

  return (
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
      <table className="w-full min-w-[34rem] text-sm">
        <thead>
          <tr className="text-left text-white/50">
            <th className="px-5 py-3 font-medium">Nombre</th>
            <th className="px-5 py-3 font-medium">Edad</th>
            <th className="px-5 py-3 font-medium">Nivel</th>
            <th className="px-5 py-3 font-medium">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr
              key={s.id}
              className="border-t border-white/10 transition hover:bg-white/5"
            >
              <td className="px-5 py-3 text-white/90">
                <span className="flex items-center gap-3">
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
                </span>
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
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr className="border-t border-white/10">
              <td colSpan={4} className="px-5 py-10 text-center text-white/40">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
