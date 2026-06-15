import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';

interface Org {
  school_name: string;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  theme: string;
}
interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
}
interface Pool {
  id: string;
  name: string;
  lanes: number;
  branch_id: string;
}
interface User {
  full_name: string;
  phone: string | null;
  email: string;
  role: string;
}
interface Props {
  org: Org;
  branches: Branch[];
  pools: Pool[];
  user: User;
}

type BranchModal = { mode: 'create' } | { mode: 'edit'; branch: Branch } | null;
type PoolModal =
  | { mode: 'create'; branchId: string }
  | { mode: 'edit'; pool: Pool }
  | null;

const inputClass =
  'mt-1 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40';
const labelClass = 'block text-sm text-white/70';
const cardClass = 'glass-soft rounded-3xl p-6';
const saveBtn =
  'bg-cream rounded-full px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50';

async function patch(url: string, fd: FormData) {
  return fetch(url, { method: 'PATCH', body: fd });
}

const THEMES = [
  { id: 'ocean', name: 'Océano', bg: '#0d2436', accent: '#f7f3e8', brand: '#0e7bb8' },
  { id: 'sunset', name: 'Atardecer', bg: '#2a1530', accent: '#fde3c4', brand: '#e8915a' },
  { id: 'forest', name: 'Bosque', bg: '#0d2418', accent: '#cdeed9', brand: '#1fae7a' },
  { id: 'cherry', name: 'Cereza', bg: '#2a0c16', accent: '#f6d4dd', brand: '#d65a78' },
  { id: 'midnight', name: 'Medianoche', bg: '#0b1024', accent: '#d6dcff', brand: '#5a6cf0' },
  { id: 'grape', name: 'Uva', bg: '#1c1230', accent: '#e7d9ff', brand: '#9a6cf0' },
  { id: 'steel', name: 'Acero', bg: '#141c26', accent: '#dbe4ee', brand: '#6b8fc0' },
  { id: 'coral', name: 'Coral', bg: '#221310', accent: '#ffd9cc', brand: '#f0805a' },
  { id: 'gold', name: 'Oro', bg: '#221b0c', accent: '#f3e3b0', brand: '#d9a93a' },
  { id: 'garnet', name: 'Granate', bg: '#2d0f16', accent: '#fcd9dd', brand: '#e0455a' },
  { id: 'neon', name: 'Neón', bg: '#120817', accent: '#f0d9f7', brand: '#d633e8' },
];

export default function SettingsView({ org, branches, pools, user }: Props) {
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [schoolSaving, setSchoolSaving] = useState(false);
  const [schoolMsg, setSchoolMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [branchModal, setBranchModal] = useState<BranchModal>(null);
  const [poolModal, setPoolModal] = useState<PoolModal>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const [theme, setTheme] = useState(org.theme ?? 'ocean');

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function onLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function submitProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    const res = await patch('/api/profile', new FormData(e.currentTarget));
    if (res.ok) {
      setProfileMsg({ ok: true, text: 'Datos actualizados.' });
      setProfileSaving(false);
      return;
    }
    const body = await res.json().catch(() => ({}));
    setProfileMsg({ ok: false, text: body.error ?? 'No se pudo guardar.' });
    setProfileSaving(false);
  }

  async function submitSchool(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSchoolSaving(true);
    setSchoolMsg(null);
    const res = await patch('/api/settings', new FormData(e.currentTarget));
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setSchoolMsg({ ok: false, text: body.error ?? 'No se pudo guardar.' });
    setSchoolSaving(false);
  }

  async function submitBranch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!branchModal) return;
    setModalSaving(true);
    setModalError('');
    const fd = new FormData(e.currentTarget);
    const url =
      branchModal.mode === 'edit'
        ? `/api/branches/${branchModal.branch.id}`
        : '/api/branches';
    const res =
      branchModal.mode === 'edit'
        ? await patch(url, fd)
        : await fetch(url, { method: 'POST', body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setModalError(body.error ?? 'No se pudo guardar.');
    setModalSaving(false);
  }

  async function submitPool(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!poolModal) return;
    setModalSaving(true);
    setModalError('');
    const fd = new FormData(e.currentTarget);
    const url =
      poolModal.mode === 'edit' ? `/api/pools/${poolModal.pool.id}` : '/api/pools';
    const res =
      poolModal.mode === 'edit'
        ? await patch(url, fd)
        : await fetch(url, { method: 'POST', body: fd });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setModalError(body.error ?? 'No se pudo guardar.');
    setModalSaving(false);
  }

  async function toggleBranch(b: Branch) {
    const action = b.is_active ? 'desactivar' : 'reactivar';
    if (!confirm(`¿Seguro que quieres ${action} la sucursal "${b.name}"?`)) return;
    const fd = new FormData();
    fd.set('is_active', String(!b.is_active));
    const res = await patch(`/api/branches/${b.id}`, fd);
    if (res.ok) window.location.reload();
    else alert('No se pudo actualizar la sucursal.');
  }

  async function deletePool(p: Pool) {
    if (!confirm(`¿Eliminar la alberca "${p.name}"?`)) return;
    const res = await fetch(`/api/pools/${p.id}`, { method: 'DELETE' });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const body = await res.json().catch(() => ({}));
    alert(body.error ?? 'No se pudo eliminar la alberca.');
  }

  function closeModal() {
    setBranchModal(null);
    setPoolModal(null);
    setModalError('');
    setModalSaving(false);
  }

  async function pickTheme(id: string) {
    // Aplica el tema al instante en toda la app y lo guarda
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = id;
    }
    setTheme(id);
    const fd = new FormData();
    fd.set('theme', id);
    const res = await patch('/api/theme', fd);
    if (!res.ok) alert('No se pudo guardar el tema.');
  }

  function Msg({ msg }: { msg: { ok: boolean; text: string } | null }) {
    if (!msg) return null;
    return (
      <p
        className={`rounded-xl p-3 text-sm ${
          msg.ok ? 'bg-emerald-400/15 text-emerald-200' : 'bg-red-400/15 text-red-200'
        }`}
      >
        {msg.text}
      </p>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Mi cuenta */}
      <section className={cardClass}>
        <h2 className="text-lg font-semibold tracking-tight">Mi cuenta</h2>
        <p className="mt-1 text-sm text-white/50">Tus datos de acceso y contacto.</p>
        <form onSubmit={submitProfile} className="mt-4 space-y-3.5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Correo
              <input
                type="email"
                value={user.email}
                disabled
                className={`${inputClass} opacity-60`}
              />
            </label>
            <label className={labelClass}>
              Rol
              <input
                type="text"
                value={user.role}
                disabled
                className={`${inputClass} capitalize opacity-60`}
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Nombre completo
              <input
                type="text"
                name="full_name"
                required
                defaultValue={user.full_name}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Teléfono
              <input
                type="tel"
                name="phone"
                defaultValue={user.phone ?? ''}
                className={inputClass}
              />
            </label>
          </div>
          <label className={labelClass}>
            Nueva contraseña (opcional)
            <input
              type="password"
              name="password"
              minLength={8}
              placeholder="Déjalo en blanco para no cambiarla"
              className={inputClass}
            />
          </label>
          <Msg msg={profileMsg} />
          <div className="flex justify-end">
            <button type="submit" disabled={profileSaving} className={saveBtn}>
              {profileSaving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>

      {/* Datos de la escuela */}
      <section className={cardClass}>
        <h2 className="text-lg font-semibold tracking-tight">Datos de la escuela</h2>
        <p className="mt-1 text-sm text-white/50">
          Nombre, contacto y logotipo que se mostrarán en el sistema.
        </p>
        <form onSubmit={submitSchool} className="mt-4 space-y-3.5">
          <div className="flex items-center gap-4">
            <label
              className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/25 bg-white/5 transition hover:border-white/50"
              title="Subir logotipo"
            >
              {logoPreview || org.logo_url ? (
                <img
                  src={logoPreview ?? org.logo_url ?? ''}
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl text-white/40 group-hover:text-white/70">🏊</span>
              )}
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={onLogoChange}
                className="hidden"
              />
            </label>
            <div className="text-sm text-white/50">
              Logotipo (opcional)
              <span className="block text-xs text-white/30">JPG o PNG, máx. 5 MB</span>
            </div>
          </div>
          <label className={labelClass}>
            Nombre de la escuela
            <input
              type="text"
              name="school_name"
              required
              defaultValue={org.school_name}
              className={inputClass}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Teléfono de contacto
              <input
                type="tel"
                name="phone"
                defaultValue={org.phone ?? ''}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Correo de contacto
              <input
                type="email"
                name="email"
                defaultValue={org.email ?? ''}
                className={inputClass}
              />
            </label>
          </div>
          <Msg msg={schoolMsg} />
          <div className="flex justify-end">
            <button type="submit" disabled={schoolSaving} className={saveBtn}>
              {schoolSaving ? 'Guardando…' : 'Guardar datos'}
            </button>
          </div>
        </form>
      </section>

      {/* Tema de la aplicación */}
      <section className={cardClass}>
        <h2 className="text-lg font-semibold tracking-tight">Tema de la aplicación</h2>
        <p className="mt-1 text-sm text-white/50">
          Cambia los colores del sistema (fondo, botones, modales). Se aplica al instante.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => pickTheme(t.id)}
              className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
                theme === t.id
                  ? 'border-cream ring-2 ring-cream/40'
                  : 'border-white/10 hover:bg-white/5'
              }`}
            >
              <div
                className="flex h-14 items-center gap-2 rounded-xl px-3"
                style={{ background: t.bg }}
              >
                <span
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ background: t.accent }}
                />
                <span
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ background: t.brand }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-white/90">{t.name}</span>
                {theme === t.id && (
                  <span className="text-xs text-emerald-300">✓ activo</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Sucursales y albercas */}
      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Sucursales y albercas</h2>
            <p className="mt-1 text-sm text-white/50">
              Direcciones, teléfonos y carriles de cada alberca.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setModalError('');
              setBranchModal({ mode: 'create' });
            }}
            className="bg-cream rounded-full px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5"
          >
            + Sucursal
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {branches.map((b) => {
            const branchPools = pools.filter((p) => p.branch_id === b.id);
            return (
              <div
                key={b.id}
                className={`rounded-2xl border border-white/10 p-4 ${
                  b.is_active ? 'bg-white/5' : 'bg-white/[0.02] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white/90">
                      {b.name}
                      {!b.is_active && (
                        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                          inactiva
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-white/50">
                      {b.address || 'Sin dirección'}
                      {b.phone ? ` · ${b.phone}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setModalError('');
                        setBranchModal({ mode: 'edit', branch: b });
                      }}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBranch(b)}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      {b.is_active ? 'Desactivar' : 'Reactivar'}
                    </button>
                  </div>
                </div>

                {/* Albercas */}
                <div className="mt-3 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/40">
                      Albercas
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setModalError('');
                        setPoolModal({ mode: 'create', branchId: b.id });
                      }}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/15 hover:text-white"
                    >
                      + Alberca
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {branchPools.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm"
                      >
                        <span className="text-white/85">{p.name}</span>
                        <span className="flex items-center gap-3">
                          <span className="text-xs text-white/50">
                            {p.lanes} carril{p.lanes === 1 ? '' : 'es'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setModalError('');
                              setPoolModal({ mode: 'edit', pool: p });
                            }}
                            className="text-xs text-white/50 transition hover:text-white"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePool(p)}
                            className="text-xs text-white/40 transition hover:text-red-200"
                          >
                            Eliminar
                          </button>
                        </span>
                      </li>
                    ))}
                    {branchPools.length === 0 && (
                      <li className="py-1 text-xs text-white/35">Sin albercas registradas.</li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
          {branches.length === 0 && (
            <p className="py-2 text-sm text-white/40">No hay sucursales todavía.</p>
          )}
        </div>
      </section>

      {/* Modal sucursal */}
      {branchModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <form
              onSubmit={submitBranch}
              className="modal-panel my-auto w-full max-w-md space-y-3.5 rounded-[2rem] border border-white/15 bg-[#0d2436]/95 p-7 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">
                  {branchModal.mode === 'edit' ? 'Editar sucursal' : 'Nueva sucursal'}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
              {modalError && (
                <p className="rounded-xl bg-red-400/15 p-3 text-sm text-red-200">{modalError}</p>
              )}
              <label className={labelClass}>
                Nombre
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={branchModal.mode === 'edit' ? branchModal.branch.name : ''}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Dirección
                <input
                  type="text"
                  name="address"
                  defaultValue={
                    branchModal.mode === 'edit' ? (branchModal.branch.address ?? '') : ''
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Teléfono
                <input
                  type="tel"
                  name="phone"
                  defaultValue={
                    branchModal.mode === 'edit' ? (branchModal.branch.phone ?? '') : ''
                  }
                  className={inputClass}
                />
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={modalSaving} className={saveBtn}>
                  {modalSaving ? 'Guardando…' : branchModal.mode === 'edit' ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}

      {/* Modal alberca */}
      {poolModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="modal-overlay fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <form
              onSubmit={submitPool}
              className="modal-panel my-auto w-full max-w-sm space-y-3.5 rounded-[2rem] border border-white/15 bg-[#0d2436]/95 p-7 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">
                  {poolModal.mode === 'edit' ? 'Editar alberca' : 'Nueva alberca'}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
              {modalError && (
                <p className="rounded-xl bg-red-400/15 p-3 text-sm text-red-200">{modalError}</p>
              )}
              {poolModal.mode === 'create' && (
                <input type="hidden" name="branch_id" value={poolModal.branchId} />
              )}
              <label className={labelClass}>
                Nombre de la alberca
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Alberca principal"
                  defaultValue={poolModal.mode === 'edit' ? poolModal.pool.name : ''}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Número de carriles
                <input
                  type="number"
                  name="lanes"
                  min="1"
                  required
                  defaultValue={poolModal.mode === 'edit' ? poolModal.pool.lanes : 4}
                  className={inputClass}
                />
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={modalSaving} className={saveBtn}>
                  {modalSaving ? 'Guardando…' : poolModal.mode === 'edit' ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </div>
  );
}
