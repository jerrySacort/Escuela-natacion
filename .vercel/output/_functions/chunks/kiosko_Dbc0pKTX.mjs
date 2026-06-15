import { c as createComponent } from './astro-component_auFlcV9k.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead } from './sequence_CVaQCOaa.mjs';
import { r as renderComponent } from './entrypoint_Dl6_iOoR.mjs';
import { $ as $$BaseLayout } from './BaseLayout_IRvy86g9.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useRef, useState, useEffect } from 'react';

function KioskScanner() {
  const videoRef = useRef(null);
  const lastCode = useRef({ code: "", at: 0 });
  const [cameraState, setCameraState] = useState("starting");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  async function submitCode(code, groupId) {
    if (busy) return;
    setBusy(true);
    const fd = new FormData();
    fd.set("code", code);
    if (groupId) fd.set("group_id", groupId);
    try {
      const res = await fetch("/api/attendance/checkin", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.status === "ok") {
        setResult({ kind: "ok", student: body.student_name, group: body.group_name });
      } else if (res.ok && body.status === "already") {
        setResult({ kind: "already", student: body.student_name, group: body.group_name });
      } else if (res.ok && body.status === "choose") {
        setResult({
          kind: "choose",
          student: body.student_name,
          code,
          candidates: body.candidates ?? []
        });
        setBusy(false);
        return;
      } else {
        setResult({ kind: "error", message: body.error ?? "Error desconocido." });
      }
    } catch {
      setResult({ kind: "error", message: "Sin conexión con el servidor." });
    }
    setBusy(false);
    setTimeout(() => setResult((r) => r?.kind === "choose" ? r : null), 3500);
  }
  function onScan(code) {
    const now = Date.now();
    if (code === lastCode.current.code && now - lastCode.current.at < 5e3) return;
    lastCode.current = { code, at: now };
    void submitCode(code);
  }
  useEffect(() => {
    let stream = null;
    let timer = null;
    let cancelled = false;
    async function start() {
      const Detector = window.BarcodeDetector;
      if (!Detector) {
        setCameraState("unavailable");
        return;
      }
      try {
        const supported = await Detector.getSupportedFormats();
        if (!supported.includes("qr_code")) {
          setCameraState("unavailable");
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraState("on");
        const detector = new Detector({ formats: ["qr_code"] });
        timer = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0 && codes[0].rawValue) {
              onScan(codes[0].rawValue);
            }
          } catch {
          }
        }, 350);
      } catch {
        setCameraState("unavailable");
      }
    }
    void start();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  function onManualSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = fd.get("manual_code")?.toString().trim();
    if (code) void submitCode(code);
    e.currentTarget.reset();
  }
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-md", children: [
    /* @__PURE__ */ jsx("div", { className: "glass relative overflow-hidden rounded-[2rem]", children: cameraState !== "unavailable" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "video",
        {
          ref: videoRef,
          muted: true,
          playsInline: true,
          className: "aspect-square w-full object-cover"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsx("div", { className: "h-52 w-52 rounded-3xl border-2 border-white/60" }) }),
      cameraState === "starting" && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 grid place-items-center bg-black/50 text-white/70", children: "Iniciando cámara…" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid aspect-square w-full place-items-center p-8 text-center text-white/50", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-4xl", children: "📷" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm", children: "El escáner no está disponible en este navegador. Usa la entrada manual de abajo." })
    ] }) }) }),
    result && result.kind !== "choose" && /* @__PURE__ */ jsxs(
      "div",
      {
        className: `modal-panel mt-4 rounded-3xl p-5 text-center ${result.kind === "ok" ? "bg-emerald-400/20 text-emerald-100" : result.kind === "already" ? "bg-amber-400/20 text-amber-100" : "bg-red-400/20 text-red-100"}`,
        children: [
          result.kind === "ok" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("p", { className: "text-3xl", children: "✅" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-semibold", children: result.student }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm opacity-80", children: [
              "Asistencia registrada · ",
              result.group
            ] })
          ] }),
          result.kind === "already" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("p", { className: "text-3xl", children: "👋" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-semibold", children: result.student }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm opacity-80", children: [
              "Ya tenía asistencia hoy · ",
              result.group
            ] })
          ] }),
          result.kind === "error" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("p", { className: "text-3xl", children: "⚠️" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm", children: result.message })
          ] })
        ]
      }
    ),
    result?.kind === "choose" && /* @__PURE__ */ jsxs("div", { className: "modal-panel mt-4 rounded-3xl bg-white/10 p-5", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-white/70", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-white", children: result.student }),
        " — ",
        "¿a qué grupo asiste?"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: result.candidates.map((c) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => void submitCode(result.code, c.group_id),
          className: "glass-soft w-full rounded-full px-5 py-3 text-sm text-white/90 transition hover:bg-white/15",
          children: [
            c.name,
            c.start_time && /* @__PURE__ */ jsx("span", { className: "ml-2 text-white/50", children: c.start_time }),
            c.has_class_today && /* @__PURE__ */ jsx("span", { className: "bg-cream ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-900", children: "hoy" })
          ]
        },
        c.group_id
      )) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setResult(null),
          className: "mt-3 w-full text-center text-xs text-white/40 hover:text-white/70",
          children: "Cancelar"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: onManualSubmit, className: "mt-4 flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "manual_code",
          placeholder: "O escribe el código del alumno…",
          className: "flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          disabled: busy,
          className: "bg-cream rounded-full px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50",
          children: "Registrar"
        }
      )
    ] })
  ] });
}

const $$Kiosko = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Kiosko de asistencia" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="dash-bg fixed inset-0 -z-10"></div> <div class="mx-auto max-w-md p-4 text-white sm:p-6"> <header class="mb-6 flex items-center justify-between"> <a href="/dashboard/asistencia" class="text-sm text-white/50 transition hover:text-white">
← Salir del kiosko
</a> <span class="text-sm text-white/50">🏊 Check-in</span> </header> <h1 class="mb-1 text-center text-2xl font-semibold tracking-tight">
¡Bienvenido!
</h1> <p class="mb-6 text-center text-sm text-white/50">
Acerca tu código QR a la cámara
</p> ${renderComponent($$result2, "KioskScanner", KioskScanner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/KioskScanner", "client:component-export": "default" })} </div> ` })}`;
}, "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/asistencia/kiosko.astro", void 0);

const $$file = "D:/Proyectos/IA/Escuela natacion/src/pages/dashboard/asistencia/kiosko.astro";
const $$url = "/dashboard/asistencia/kiosko";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Kiosko,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
