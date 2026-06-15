const OVERLAY = "modal-overlay fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm";
const PANEL = "modal-panel my-auto w-full max-w-sm space-y-4 rounded-[2rem] border border-white/15 p-6 text-white shadow-2xl";
const BTN_BASE = "rounded-full px-5 py-2.5 text-sm font-semibold transition";
const BTN_CANCEL = "glass-soft text-white/80 hover:bg-white/10";
const BTN_PRIMARY = "bg-cream text-slate-900 shadow-lg hover:-translate-y-0.5";
const BTN_DANGER = "bg-red-500/90 text-white shadow-lg hover:-translate-y-0.5 hover:bg-red-500";
function render(o) {
  if (typeof document === "undefined") {
    o.onResolve(false);
    return;
  }
  const overlay = document.createElement("div");
  overlay.className = OVERLAY;
  overlay.setAttribute("role", "alertdialog");
  overlay.setAttribute("aria-modal", "true");
  const panel = document.createElement("div");
  panel.className = PANEL;
  if (o.title) {
    const h = document.createElement("h2");
    h.className = "text-lg font-semibold tracking-tight";
    h.textContent = o.title;
    panel.appendChild(h);
  }
  const msg = document.createElement("p");
  msg.className = "whitespace-pre-line text-sm leading-relaxed text-white/75";
  msg.textContent = o.message;
  panel.appendChild(msg);
  const actions = document.createElement("div");
  actions.className = "flex justify-end gap-3 pt-1";
  let done = false;
  const onKey = (e) => {
    if (e.key === "Escape") close(false);
    else if (e.key === "Enter") close(true);
  };
  function close(v) {
    if (done) return;
    done = true;
    document.removeEventListener("keydown", onKey);
    overlay.style.transition = "opacity 0.15s ease";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 150);
    o.onResolve(v);
  }
  if (o.cancelText) {
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = `${BTN_BASE} ${BTN_CANCEL}`;
    cancel.textContent = o.cancelText;
    cancel.addEventListener("click", () => close(false));
    actions.appendChild(cancel);
  }
  const ok = document.createElement("button");
  ok.type = "button";
  ok.className = `${BTN_BASE} ${o.tone === "danger" ? BTN_DANGER : BTN_PRIMARY}`;
  ok.textContent = o.confirmText;
  ok.addEventListener("click", () => close(true));
  actions.appendChild(ok);
  panel.appendChild(actions);
  overlay.appendChild(panel);
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) close(false);
  });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => ok.focus());
}
function confirmDialog(message, opts = {}) {
  return new Promise((resolve) => {
    render({
      message,
      title: opts.title,
      confirmText: opts.confirmText ?? "Aceptar",
      cancelText: opts.cancelText ?? "Cancelar",
      tone: opts.tone ?? "default",
      onResolve: resolve
    });
  });
}
function alertDialog(message, opts = {}) {
  return new Promise((resolve) => {
    render({
      message,
      title: opts.title,
      confirmText: opts.confirmText ?? "Entendido",
      tone: opts.tone ?? "default",
      onResolve: () => resolve()
    });
  });
}

export { alertDialog as a, confirmDialog as c };
