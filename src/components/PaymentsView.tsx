import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';

export interface ChargeRow {
  id: string;
  student_id: string;
  student_name: string;
  group_name: string | null;
  concept: string;
  amount_due: number;
  due_date: string;
  status: 'pending' | 'overdue' | 'paid' | 'cancelled';
}

interface Props {
  charges: ChargeRow[];
  canManage: boolean;
}

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'overdue', label: 'Vencidos' },
  { key: 'paid', label: 'Pagados' },
  { key: 'cancelled', label: 'Cancelados' },
] as const;

const METHOD_OPTIONS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'spei', label: 'SPEI' },
  { value: 'oxxo', label: 'OXXO' },
];

const STATUS_STYLES: Record<ChargeRow['status'], string> = {
  pending: 'bg-white/10 text-white/60',
  overdue: 'bg-red-400/20 text-red-200',
  paid: 'bg-emerald-400/20 text-emerald-200',
  cancelled: 'bg-white/5 text-white/30',
};

const STATUS_LABELS: Record<ChargeRow['status'], string> = {
  pending: 'Pendiente',
  overdue: 'Vencido',
  paid: 'Pagado',
  cancelled: 'Cancelado',
};

const inputClass =
  'mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40';

const mxn = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 });

/** Cobranza: resumen, filtros, tabla de cargos y modal de pago. */
export default function PaymentsView({ charges, canManage }: Props) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [query, setQuery] = useState('');
  const [paying, setPaying] = useState<ChargeRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const summary = useMemo(() => {
    const sum = (st: ChargeRow['status']) =>
      charges.filter((c) => c.status === st).reduce((s, c) => s + c.amount_due, 0);
    return {
      paid: sum('paid'),
      pending: sum('pending'),
      overdue: sum('overdue'),
    };
  }, [charges]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return charges.filter(
      (c) =>
        (filter === 'all' ? c.status !== 'cancelled' : c.status === filter) &&
        `${c.student_name} ${c.concept}`.toLowerCase().includes(q),
    );
  }, [charges, filter, query]);

  useEffect(() => {
    if (!paying) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPaying(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paying]);

  async function onGenerate() {
    if (!confirm('¿Generar los cargos de mensualidad del mes en curso para todas las inscripciones activas?'))
      return;
    setGenerating(true);
    const res = await fetch('/api/charges/generate', { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      alert(
        `Cargos nuevos: ${body.created} · ya existían: ${body.skipped} · marcados vencidos: ${body.overdue_marked}`,
      );
      window.location.reload();
      return;
    }
    setGenerating(false);
    alert(body.error ?? 'No se pudieron generar los cargos.');
  }

  async function onPay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!paying) return;
    setSaving(true);
    setError('');
    const res = await fetch(`/api/charges/${paying.id}/pay`, {
      method: 'POST',
      body: new FormData(e.currentTarget),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? 'No se pudo registrar el pago.');
    setSaving(false);
  }

  async function onCancel(c: ChargeRow) {
    if (!confirm(`¿Cancelar el cargo "${c.concept}" de ${c.student_name}?`)) return;
    const fd = new FormData();
    fd.set('action', 'cancel');
    const res = await fetch(`/api/charges/${c.id}`, { method: 'PATCH', body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    alert('No se pudo cancelar el cargo.');
  }

  return (
    <>
      {/* Resumen */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-soft rounded-3xl p-5">
          <p className="text-xs uppercase tracking-wide text-white/40">Pagado</p>
          <p className="mt-1 text-3xl font-bold text-emerald-200">
            ${mxn.format(summary.paid)}
          </p>
        </div>
        <div className="glass-soft rounded-3xl p-5">
          <p className="text-xs uppercase tracking-wide text-white/40">Pendiente</p>
          <p className="mt-1 text-3xl font-bold">${mxn.format(summary.pending)}</p>
        </div>
        <div className="glass-soft rounded-3xl p-5">
          <p className="text-xs uppercase tracking-wide text-white/40">Vencido</p>
          <p className="mt-1 text-3xl font-bold text-red-200">
            ${mxn.format(summary.overdue)}
          </p>
        </div>
      </section>

      {/* Filtros + acciones */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              filter === f.key
                ? 'bg-cream font-medium text-slate-900 shadow'
                : 'glass-soft text-white/60 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
        {canManage && (
          <button
            onClick={onGenerate}
            disabled={generating}
            className="bg-cream ml-auto rounded-full px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {generating ? 'Generando…' : 'Generar cargos del mes'}
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="glass-soft rounded-3xl">
        <div className="border-b border-white/10 p-4">
          <input
            type="search"
            placeholder="Buscar por alumno o concepto…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-sm rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/40"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50">
                <th className="px-5 py-3 font-medium">Alumno</th>
                <th className="px-5 py-3 font-medium">Concepto</th>
                <th className="px-5 py-3 font-medium">Monto</th>
                <th className="px-5 py-3 font-medium">Vence</th>
                <th className="px-5 py-3 font-medium">Estatus</th>
                {canManage && <th className="px-5 py-3 font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-white/10 transition hover:bg-white/5"
                >
                  <td className="px-5 py-3">
                    <a
                      href={`/dashboard/alumnos/${c.student_id}`}
                      className="text-white/90 hover:underline underline-offset-4"
                    >
                      {c.student_name}
                    </a>
                    {c.group_name && (
                      <p className="text-xs text-white/40">{c.group_name}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-white/70">{c.concept}</td>
                  <td className="px-5 py-3 text-white/90">
                    ${mxn.format(c.amount_due)}
                  </td>
                  <td className="px-5 py-3 text-white/70">
                    {new Date(c.due_date + 'T00:00:00').toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${STATUS_STYLES[c.status]}`}
                    >
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-5 py-3">
                      {c.status === 'paid' && (
                        <a
                          href={`/api/charges/${c.id}/receipt`}
                          target="_blank"
                          rel="noopener"
                          className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70 transition hover:bg-white/15 hover:text-white"
                        >
                          🧾 Recibo
                        </a>
                      )}
                      {(c.status === 'pending' || c.status === 'overdue') && (
                        <span className="flex gap-2">
                          <button
                            onClick={() => setPaying(c)}
                            className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-400/25"
                          >
                            Registrar pago
                          </button>
                          <button
                            onClick={() => onCancel(c)}
                            title="Cancelar cargo"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-red-400/20 hover:text-red-200"
                          >
                            ✕
                          </button>
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className="border-t border-white/10">
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="px-5 py-10 text-center text-white/40"
                  >
                    Sin cargos. Usa "Generar cargos del mes" para crearlos desde
                    las inscripciones activas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de pago */}
      {paying && typeof document !== 'undefined' && createPortal(
        <div
          className="modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setPaying(null)}
        >
          <form
            onSubmit={onPay}
            className="modal-panel my-auto w-full max-w-sm space-y-4 rounded-[2rem] border border-white/15 bg-[#0d2436]/95 p-7 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Registrar pago
              </h2>
              <button
                type="button"
                onClick={() => setPaying(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 text-sm">
              <p className="text-white/90">{paying.student_name}</p>
              <p className="text-white/50">{paying.concept}</p>
            </div>

            {error && (
              <p className="rounded-xl bg-red-400/15 p-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <label className="block text-sm text-white/70">
              Monto $
              <input
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                required
                defaultValue={paying.amount_due}
                className={inputClass}
              />
            </label>

            <label className="block text-sm text-white/70">
              Método de pago
              <select name="method" required className={inputClass}>
                {METHOD_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value} className="text-slate-900">
                    {m.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-white/70">
              Referencia (opcional)
              <input
                type="text"
                name="provider_ref"
                placeholder="Folio, núm. de transferencia…"
                className={inputClass}
              />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaying(null)}
                className="rounded-full px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-cream rounded-full px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {saving ? 'Registrando…' : 'Confirmar pago'}
              </button>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </>
  );
}
