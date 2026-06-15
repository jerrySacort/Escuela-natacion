import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
import { a as alertDialog } from './dialog_CWCWZkCC.mjs';

function AttendanceView({ groups, canManage }) {
  const [selectedId, setSelectedId] = useState(groups[0]?.id ?? "");
  const [presence, setPresence] = useState(() => {
    const map = {};
    for (const g of groups)
      for (const s of g.roster) map[`${g.id}:${s.student_id}`] = s.present;
    return map;
  });
  const [pending, setPending] = useState(null);
  const selected = useMemo(
    () => groups.find((g) => g.id === selectedId) ?? null,
    [groups, selectedId]
  );
  const presentCount = selected ? selected.roster.filter((s) => presence[`${selected.id}:${s.student_id}`]).length : 0;
  async function toggle(s) {
    if (!canManage || !selected) return;
    const key = `${selected.id}:${s.student_id}`;
    const next = !presence[key];
    setPending(key);
    setPresence((p) => ({ ...p, [key]: next }));
    const fd = new FormData();
    fd.set("student_id", s.student_id);
    fd.set("group_id", selected.id);
    fd.set("present", String(next));
    const res = await fetch("/api/attendance/toggle", { method: "POST", body: fd });
    if (!res.ok) {
      setPresence((p) => ({ ...p, [key]: !next }));
      void alertDialog("No se pudo actualizar la asistencia.");
    }
    setPending(null);
  }
  if (groups.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "glass-soft rounded-3xl p-10 text-center text-white/50", children: [
      /* @__PURE__ */ jsx("p", { className: "text-3xl", children: "🗓️" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3", children: "No hay grupos con clase hoy." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: groups.map((g) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setSelectedId(g.id),
        className: `w-full rounded-3xl p-5 text-left transition ${g.id === selectedId ? "bg-cream text-slate-900 shadow-lg" : "glass-soft text-white/80 hover:bg-white/10"}`,
        children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: g.name }),
          /* @__PURE__ */ jsxs(
            "p",
            {
              className: `mt-0.5 text-sm ${g.id === selectedId ? "text-slate-500" : "text-white/50"}`,
              children: [
                g.level_name,
                " · ",
                g.times
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "p",
            {
              className: `mt-1 text-xs ${g.id === selectedId ? "text-slate-500" : "text-white/40"}`,
              children: [
                g.roster.filter((s) => presence[`${g.id}:${s.student_id}`]).length,
                "/",
                g.roster.length,
                " presentes"
              ]
            }
          )
        ]
      },
      g.id
    )) }),
    /* @__PURE__ */ jsx("div", { className: "glass-soft rounded-3xl p-6 lg:col-span-2", children: selected ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-medium text-white/80", children: selected.name }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-white/50", children: [
          presentCount,
          "/",
          selected.roster.length,
          " presentes"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-2", children: [
        selected.roster.map((s) => {
          const key = `${selected.id}:${s.student_id}`;
          const isPresent = presence[key];
          return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => toggle(s),
              disabled: !canManage || pending === key,
              className: `flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition disabled:cursor-default ${isPresent ? "border-emerald-300/25 bg-emerald-400/15" : "border-white/10 bg-white/5 hover:bg-white/10"}`,
              children: [
                s.photo_url ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: s.photo_url,
                    alt: "",
                    className: "h-10 w-10 rounded-full border border-white/15 object-cover"
                  }
                ) : /* @__PURE__ */ jsx("span", { className: "bg-cream/90 flex h-10 w-10 items-center justify-center rounded-full font-bold text-slate-900", children: s.name.charAt(0) }),
                /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate text-sm text-white/90", children: s.name }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `flex h-7 w-7 items-center justify-center rounded-full text-sm ${isPresent ? "bg-emerald-400/90 text-slate-900" : "border border-white/20 text-white/30"}`,
                    children: "✓"
                  }
                )
              ]
            }
          ) }, s.student_id);
        }),
        selected.roster.length === 0 && /* @__PURE__ */ jsx("li", { className: "py-4 text-center text-sm text-white/40", children: "Sin alumnos inscritos en este grupo." })
      ] })
    ] }) : /* @__PURE__ */ jsx("p", { className: "text-white/40", children: "Selecciona un grupo." }) })
  ] });
}

export { AttendanceView as A };
