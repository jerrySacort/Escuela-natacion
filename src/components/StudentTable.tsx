import { useMemo, useState } from 'react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  is_active: boolean;
  levels: { name: string } | null;
}

function age(birthDate: string): number {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

/** React Island: tabla de alumnos con búsqueda client-side. */
export default function StudentTable({ students }: { students: Student[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return students.filter((s) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q),
    );
  }, [students, query]);

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="border-b p-4">
        <input
          type="search"
          placeholder="Buscar alumno…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded border px-3 py-2 text-sm"
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Edad</th>
            <th className="px-4 py-2">Nivel</th>
            <th className="px-4 py-2">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.id} className="border-b hover:bg-slate-50">
              <td className="px-4 py-2">
                {s.last_name}, {s.first_name}
              </td>
              <td className="px-4 py-2">{age(s.birth_date)} años</td>
              <td className="px-4 py-2">{s.levels?.name ?? '—'}</td>
              <td className="px-4 py-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    s.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {s.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
