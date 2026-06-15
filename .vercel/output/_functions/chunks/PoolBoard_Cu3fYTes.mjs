import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
function hhmm(d) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function firstName(name) {
  return name.trim().split(/\s+/)[0] ?? name;
}
const FEMALE_NAMES = /* @__PURE__ */ new Set([
  "maria",
  "sofia",
  "sophia",
  "valentina",
  "camila",
  "isabella",
  "isabela",
  "ximena",
  "regina",
  "victoria",
  "romina",
  "fernanda",
  "daniela",
  "mariana",
  "andrea",
  "paula",
  "lucia",
  "emma",
  "renata",
  "ana",
  "gabriela",
  "natalia",
  "alejandra",
  "sara",
  "sarah",
  "julia",
  "martina",
  "antonella",
  "michelle",
  "melany",
  "melanie",
  "jimena",
  "dulce",
  "abril",
  "aitana",
  "danna",
  "dana",
  "zoe",
  "elena",
  "luciana",
  "catalina",
  "carla",
  "frida",
  "ivanna",
  "vanessa",
  "barbara",
  "brenda",
  "rosa",
  "guadalupe",
  "yaretzi",
  "itzel",
  "citlali",
  "mia",
  "allison",
  "alison",
  "kimberly",
  "monserrat",
  "montserrat",
  "perla",
  "diana",
  "karla",
  "laura",
  "lucero",
  "maite",
  "noelia",
  "ariadna",
  "anahi",
  "azul",
  "bianca",
  "briana",
  "dafne",
  "denise",
  "elisa",
  "esmeralda",
  "estrella",
  "grecia",
  "irene",
  "jade",
  "karen",
  "keira",
  "leila",
  "luna",
  "marian",
  "mayte",
  "melissa",
  "miranda",
  "naomi",
  "nora",
  "paola",
  "paulina",
  "priscila",
  "rebeca",
  "samantha",
  "scarlet",
  "sophie",
  "valeria",
  "wendy",
  "yamileth",
  "emily",
  "emely",
  "emilia",
  "ashley",
  "britney",
  "hailey",
  "hayley",
  "lesly",
  "leslie",
  "lizzy",
  "melody",
  "nancy",
  "betsy",
  "ruby",
  "lucy",
  "mary",
  "amy",
  "abby",
  "abigail",
  "lily",
  "lia",
  "jenny",
  "kelly",
  "evelyn",
  "madison",
  "hannah",
  "ailin",
  "aylin",
  "dayana",
  "dayanara",
  "galilea",
  "jaqueline",
  "jacqueline",
  "jocelyn",
  "joselin",
  "joselyn",
  "maya",
  "miley",
  "milagros",
  "nadia",
  "nahomi",
  "tania",
  "valery",
  "yuliana",
  "zuri",
  "alexa",
  "alexia",
  "alondra",
  "amelia",
  "antonia",
  "ariana",
  "ariadne",
  "audrey",
  "carolina",
  "cassandra",
  "claudia",
  "cristina",
  "elizabeth",
  "fatima",
  "florencia",
  "ines",
  "isabel",
  "ivana",
  "jazmin",
  "jessica",
  "johana",
  "josefina",
  "lorena",
  "manuela",
  "margarita",
  "marisol",
  "martha",
  "micaela",
  "milena",
  "monica",
  "nicole",
  "nicolle",
  "olivia",
  "rocio",
  "sabrina",
  "samara",
  "sandra",
  "scarlett",
  "silvana",
  "susana",
  "veronica",
  "itzayana",
  "mitzy",
  "kayla",
  "kiara",
  "thais"
]);
const MALE_NAMES = /* @__PURE__ */ new Set([
  "mateo",
  "matheo",
  "mathias",
  "matias",
  "santiago",
  "sebastian",
  "nicolas",
  "alejandro",
  "diego",
  "daniel",
  "david",
  "samuel",
  "gael",
  "leonardo",
  "leo",
  "emiliano",
  "juan",
  "jose",
  "carlos",
  "miguel",
  "angel",
  "iker",
  "dylan",
  "xavier",
  "javier",
  "adrian",
  "alan",
  "axel",
  "benjamin",
  "bruno",
  "cristobal",
  "dante",
  "derek",
  "eduardo",
  "emanuel",
  "emir",
  "enrique",
  "erick",
  "ethan",
  "fernando",
  "francisco",
  "gabriel",
  "gerardo",
  "hector",
  "hugo",
  "ian",
  "isaac",
  "ivan",
  "jesus",
  "joaquin",
  "jonathan",
  "jorge",
  "josue",
  "julian",
  "kevin",
  "liam",
  "lucas",
  "luis",
  "manuel",
  "marco",
  "mariano",
  "mauricio",
  "maximiliano",
  "noah",
  "oliver",
  "oscar",
  "pablo",
  "patricio",
  "pedro",
  "rafael",
  "ramon",
  "raul",
  "ricardo",
  "rodrigo",
  "roberto",
  "saul",
  "thiago",
  "tadeo",
  "uriel",
  "victor",
  "yael",
  "zaid",
  "andres",
  "antonio",
  "arturo",
  "bryan",
  "camilo",
  "cesar",
  "elias",
  "felipe",
  "gustavo",
  "ignacio",
  "israel",
  "jaime",
  "leonel",
  "martin",
  "nestor",
  "rene",
  "salvador",
  "santino",
  "sergio",
  "tomas",
  "vicente",
  "emmanuel",
  "jared",
  "jayden",
  "jaden",
  "brandon",
  "bryant",
  "christopher",
  "cristian",
  "christian",
  "donovan",
  "edwin",
  "elian",
  "fabian",
  "franco",
  "giovanni",
  "harold",
  "jeremy",
  "johan",
  "jovani",
  "kaleb",
  "leandro",
  "randy",
  "ronaldo",
  "sammy",
  "yahir",
  "yandel",
  "alexander",
  "anthony",
  "damian",
  "jacob",
  "jeronimo",
  "jonas",
  "joseph",
  "lorenzo",
  "maddox",
  "marcelo",
  "marcos",
  "mario",
  "matteo",
  "maximo",
  "michael",
  "osvaldo",
  "owen",
  "ramiro",
  "roman",
  "ruben",
  "salomon",
  "simon",
  "teo",
  "theo",
  "valentino",
  "william",
  "aaron",
  "abraham",
  "caleb",
  "dilan",
  "gadiel",
  "isaias",
  "jadiel",
  "keny",
  "mael",
  "neymar",
  "rey",
  "thiago",
  "yamil"
]);
function normalizeName(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
}
function guessSex(fullName) {
  const n = normalizeName(firstName(fullName));
  if (!n) return null;
  if (FEMALE_NAMES.has(n)) return "F";
  if (MALE_NAMES.has(n)) return "M";
  if (n.endsWith("a")) return "F";
  if (n.endsWith("o")) return "M";
  return null;
}
function swimmerSrc(student) {
  const sex = student.sex ?? guessSex(student.name);
  if (sex === "F") return "/swimmers/girl.png";
  if (sex === "M") return "/swimmers/boy.png";
  return "/swimmers/neutral.png";
}
const WAVE_COLORS = [
  "#d6effb",
  "#b9e3f7",
  "#95d2f2",
  "#6fbdec",
  "#49a6e3",
  "#2b8fd8",
  "#1576c9",
  "#0a5fb8",
  "#0b4fae",
  "#1142a8",
  "#1a36a0"
];
function buildWavePath(baseY, amp, waveLen) {
  let d = `M -200 ${baseY}`;
  for (let x = -200; x <= 1400; x += waveLen) {
    const q1 = Math.round(x + waveLen / 4);
    const mid = Math.round(x + waveLen / 2);
    const q2 = Math.round(x + waveLen * 3 / 4);
    const end = Math.round(x + waveLen);
    d += ` Q ${q1} ${baseY - amp} ${mid} ${baseY} Q ${q2} ${baseY + amp} ${end} ${baseY}`;
  }
  d += " L 1400 600 L -200 600 Z";
  return d;
}
const WAVE_LAYERS = WAVE_COLORS.map((color, i) => ({
  color,
  d: buildWavePath(i * 54, 48 + i % 3 * 12, 380 + i % 4 * 70),
  dur: 5 + i % 5 * 1.1,
  delay: i * 0.6 % 3
}));
function PoolBoard({
  branches,
  pools,
  sessions,
  kiosk = false,
  fullscreenHref
}) {
  const sw = kiosk ? {
    title: "text-2xl sm:text-3xl",
    time: "text-5xl sm:text-7xl",
    lane: "min-h-[104px]",
    laneNum: "h-9 w-9 text-sm",
    avatar: "h-10 w-10",
    name: "text-sm",
    swim: "h-20"
  } : {
    title: "text-lg",
    time: "text-3xl sm:text-4xl",
    lane: "min-h-[68px]",
    laneNum: "h-7 w-7 text-xs",
    avatar: "h-7 w-7",
    name: "text-xs",
    swim: "h-12"
  };
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [poolId, setPoolId] = useState("");
  const [now, setNow] = useState(() => /* @__PURE__ */ new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(/* @__PURE__ */ new Date()), 15e3);
    return () => clearInterval(t);
  }, []);
  const branchPools = useMemo(
    () => pools.filter((p) => p.branch_id === branchId),
    [pools, branchId]
  );
  useEffect(() => {
    setPoolId(
      (prev) => branchPools.some((p) => p.id === prev) ? prev : branchPools[0]?.id ?? ""
    );
  }, [branchPools]);
  const pool = branchPools.find((p) => p.id === poolId) ?? branchPools[0] ?? null;
  const nowDow = now.getDay();
  const nowTime = hhmm(now);
  const activeInBranch = useMemo(() => {
    return sessions.filter(
      (s) => s.branch_id === branchId && s.students.length > 0 && s.schedules.some(
        (sc) => sc.weekday === nowDow && sc.start <= nowTime && nowTime <= sc.end
      )
    );
  }, [sessions, branchId, nowDow, nowTime]);
  const totalSwimmers = activeInBranch.reduce((n, s) => n + s.students.length, 0);
  const nextClass = useMemo(() => {
    if (totalSwimmers > 0) return null;
    let best = null;
    for (const s of sessions) {
      if (s.branch_id !== branchId || s.students.length === 0) continue;
      for (const sc of s.schedules) {
        let inDays = (sc.weekday - nowDow + 7) % 7;
        if (inDays === 0 && sc.start <= nowTime) inDays = 7;
        const startMins = parseInt(sc.start.slice(0, 2), 10) * 60 + parseInt(sc.start.slice(3, 5), 10);
        const score = inDays * 1440 + startMins;
        if (!best || score < best.score) {
          best = { score, inDays, weekday: sc.weekday, start: sc.start, name: s.name };
        }
      }
    }
    return best;
  }, [sessions, branchId, nowDow, nowTime, totalSwimmers]);
  const nextClassLabel = nextClass ? `${nextClass.inDays === 0 ? "hoy" : nextClass.inDays === 1 ? "mañana" : WEEKDAYS[nextClass.weekday]} a las ${nextClass.start} · ${nextClass.name}` : null;
  const lanes = pool ? Array.from({ length: pool.lanes }, (_, i) => i + 1) : [];
  const sessionsForLane = (lane) => activeInBranch.filter((s) => s.pool_id === pool?.id && s.lane === lane);
  const unplaced = activeInBranch.filter(
    (s) => s.pool_id == null || s.pool_id === pool?.id && (s.lane == null || s.lane < 1 || (pool ? s.lane > pool.lanes : true))
  );
  const h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = (h + 11) % 12 + 1;
  const timeStr = `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  function activeScheduleLabel(s) {
    const sc = s.schedules.find(
      (x) => x.weekday === nowDow && x.start <= nowTime && nowTime <= x.end
    );
    return sc ? `${sc.start} – ${sc.end}` : "";
  }
  function Swimmer({
    student,
    session,
    idx
  }) {
    const [imgErr, setImgErr] = useState(false);
    const delay = { animationDelay: `${idx % 6 * 0.35}s` };
    return /* @__PURE__ */ jsxs("div", { className: "group relative shrink-0", children: [
      !imgErr ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: swimmerSrc(student),
            alt: firstName(student.name),
            onError: () => setImgErr(true),
            style: delay,
            className: `swimmer-anim ${sw.swim} w-auto drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]`
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "-mt-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white", children: firstName(student.name) })
      ] }) : /* @__PURE__ */ jsxs(
        "div",
        {
          className: "swimmer-anim flex items-center gap-1.5 rounded-full border border-white/30 bg-white/90 py-1 pl-1 pr-2.5 shadow-md",
          style: delay,
          children: [
            student.photo ? /* @__PURE__ */ jsx(
              "img",
              {
                src: student.photo,
                alt: "",
                className: `${sw.avatar} rounded-full object-cover`
              }
            ) : /* @__PURE__ */ jsx(
              "span",
              {
                className: `${sw.avatar} grid place-items-center rounded-full bg-sky-500 text-xs font-bold text-white`,
                children: firstName(student.name).charAt(0)
              }
            ),
            /* @__PURE__ */ jsx("span", { className: `${sw.name} font-semibold text-slate-800`, children: firstName(student.name) })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-52 -translate-x-1/2 group-hover:block", children: /* @__PURE__ */ jsxs("div", { className: "bg-modal rounded-2xl border border-white/15 p-3 text-left shadow-2xl", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-white", children: student.name }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-1 text-xs text-white/70", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "🏊 Clase: ",
            /* @__PURE__ */ jsx("span", { className: "text-white/90", children: session.name })
          ] }),
          session.level && /* @__PURE__ */ jsxs("p", { children: [
            "📊 Nivel: ",
            /* @__PURE__ */ jsx("span", { className: "text-white/90", children: session.level })
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "🧑‍🏫 Maestro: ",
            /* @__PURE__ */ jsx("span", { className: "text-white/90", children: session.instructor ?? "Sin asignar" })
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "🕐 Horario: ",
            /* @__PURE__ */ jsx("span", { className: "text-white/90", children: activeScheduleLabel(session) })
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "👥 En la clase:",
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-white/90", children: session.students.length }),
            session.lane != null && /* @__PURE__ */ jsxs("span", { children: [
              " · carril ",
              session.lane
            ] })
          ] })
        ] })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("section", { className: "glass-soft rounded-3xl p-5 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: `flex items-center gap-2 ${sw.title} font-semibold tracking-tight text-white`, children: [
          "🏊 En la alberca ahora",
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-200", children: [
            /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" }),
            "EN VIVO"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-sm capitalize text-white/45", children: [
          WEEKDAYS[nowDow],
          " · ",
          totalSwimmers,
          " alumno",
          totalSwimmers === 1 ? "" : "s",
          " en clase"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1", children: [
        fullscreenHref && /* @__PURE__ */ jsx(
          "a",
          {
            href: fullscreenHref,
            className: "rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10 hover:text-white",
            children: "⛶ Pantalla completa"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: `${sw.time} font-bold tabular-nums text-white`, children: timeStr })
      ] })
    ] }),
    branches.length > 1 && /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: branches.map((b) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setBranchId(b.id),
        className: `rounded-full px-3.5 py-1.5 text-sm transition ${b.id === branchId ? "bg-cream font-semibold text-slate-900" : "border border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`,
        children: b.name
      },
      b.id
    )) }),
    branchPools.length > 1 && /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: branchPools.map((p) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setPoolId(p.id),
        className: `rounded-full px-3 py-1 text-xs transition ${p.id === pool?.id ? "bg-sky-500/30 font-medium text-sky-100" : "border border-white/10 text-white/60 hover:bg-white/10"}`,
        children: [
          p.name,
          " · ",
          p.lanes,
          " carriles"
        ]
      },
      p.id
    )) }),
    pool ? /* @__PURE__ */ jsxs("div", { className: "pool-water relative mt-5 rounded-2xl border border-sky-300/20 py-1.5", children: [
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 overflow-hidden rounded-2xl", children: /* @__PURE__ */ jsx(
        "svg",
        {
          className: "absolute inset-0 h-full w-full",
          viewBox: "0 0 1200 600",
          preserveAspectRatio: "none",
          "aria-hidden": "true",
          children: WAVE_LAYERS.map((l, i) => /* @__PURE__ */ jsx(
            "path",
            {
              d: l.d,
              fill: l.color,
              className: "wave-layer",
              style: { animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s` }
            },
            i
          ))
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
        /* @__PURE__ */ jsx("div", { className: "lane-rope" }),
        lanes.map((lane) => {
          const laneSessions = sessionsForLane(lane);
          const swimmers = laneSessions.flatMap(
            (s) => s.students.map((st) => ({ st, s }))
          );
          return /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: `relative flex ${sw.lane} items-center gap-3 px-3 py-2`,
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `grid ${sw.laneNum} shrink-0 place-items-center rounded-full bg-white/15 font-bold text-white`,
                      children: lane
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-wrap gap-2", children: [
                    swimmers.map(({ st, s }, i) => /* @__PURE__ */ jsx(Swimmer, { student: st, session: s, idx: i }, `${s.id}-${st.id}`)),
                    swimmers.length === 0 && /* @__PURE__ */ jsx("span", { className: "text-xs text-white/25", children: "— carril libre —" })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "lane-rope" })
          ] }, lane);
        })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "mt-5 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/50", children: "Esta sucursal no tiene albercas registradas. Agrégalas en Configuración." }),
    unplaced.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-2xl border border-amber-300/20 bg-amber-400/5 p-3", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-medium uppercase tracking-wide text-amber-200/80", children: "En clase sin carril asignado" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: unplaced.flatMap(
        (s) => s.students.map((st, i) => /* @__PURE__ */ jsx(Swimmer, { student: st, session: s, idx: i }, `u-${s.id}-${st.id}`))
      ) })
    ] }),
    pool && totalSwimmers === 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-2xl bg-white/5 p-6 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-2xl", children: "🌊" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-white/50", children: "No hay clases en curso en este momento." }),
      nextClassLabel && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm font-medium text-sky-200", children: [
        "Próxima clase: ",
        nextClassLabel
      ] })
    ] })
  ] });
}

export { PoolBoard as P };
