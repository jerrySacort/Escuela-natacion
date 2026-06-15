import { useEffect, useMemo, useState } from 'react';

interface Student {
  id: string;
  name: string;
  photo: string | null;
  sex: 'F' | 'M' | null;
}
interface Schedule {
  weekday: number;
  start: string;
  end: string;
}
export interface PoolSession {
  id: string;
  name: string;
  branch_id: string;
  pool_id: string | null;
  lane: number | null;
  level: string | null;
  instructor: string | null;
  schedules: Schedule[];
  students: Student[];
}
interface Pool {
  id: string;
  name: string;
  lanes: number;
  branch_id: string;
}
interface Branch {
  id: string;
  name: string;
}
interface Props {
  branches: Branch[];
  pools: Pool[];
  sessions: PoolSession[];
  kiosk?: boolean;
  fullscreenHref?: string;
}

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function hhmm(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

// Inferencia de sexo por el primer nombre (heurística, no 100% confiable)
const FEMALE_NAMES = new Set([
  'maria', 'sofia', 'sophia', 'valentina', 'camila', 'isabella', 'isabela', 'ximena',
  'regina', 'victoria', 'romina', 'fernanda', 'daniela', 'mariana', 'andrea', 'paula',
  'lucia', 'emma', 'renata', 'ana', 'gabriela', 'natalia', 'alejandra', 'sara', 'sarah',
  'julia', 'martina', 'antonella', 'michelle', 'melany', 'melanie', 'jimena', 'dulce',
  'abril', 'aitana', 'danna', 'dana', 'zoe', 'elena', 'luciana', 'catalina', 'carla',
  'frida', 'ivanna', 'vanessa', 'barbara', 'brenda', 'rosa', 'guadalupe', 'yaretzi',
  'itzel', 'citlali', 'mia', 'allison', 'alison', 'kimberly', 'monserrat', 'montserrat',
  'perla', 'diana', 'karla', 'laura', 'lucero', 'maite', 'noelia', 'ariadna', 'anahi',
  'azul', 'bianca', 'briana', 'dafne', 'denise', 'elisa', 'esmeralda', 'estrella',
  'grecia', 'irene', 'jade', 'karen', 'keira', 'leila', 'luna', 'marian', 'mayte',
  'melissa', 'miranda', 'naomi', 'nora', 'paola', 'paulina', 'priscila', 'rebeca',
  'samantha', 'scarlet', 'sophie', 'valeria', 'wendy', 'yamileth',
  'emily', 'emely', 'emilia', 'ashley', 'britney', 'hailey', 'hayley', 'lesly',
  'leslie', 'lizzy', 'melody', 'nancy', 'betsy', 'ruby', 'lucy', 'mary', 'amy',
  'abby', 'abigail', 'lily', 'lia', 'jenny', 'kelly', 'evelyn', 'madison', 'hannah',
  'ailin', 'aylin', 'dayana', 'dayanara', 'galilea', 'jaqueline', 'jacqueline',
  'jocelyn', 'joselin', 'joselyn', 'maya', 'miley', 'milagros', 'nadia', 'nahomi',
  'tania', 'valery', 'yuliana', 'zuri', 'alexa', 'alexia', 'alondra', 'amelia',
  'antonia', 'ariana', 'ariadne', 'audrey', 'carolina', 'cassandra', 'claudia',
  'cristina', 'elizabeth', 'fatima', 'florencia', 'ines', 'isabel', 'ivana',
  'jazmin', 'jessica', 'johana', 'josefina', 'lorena', 'manuela', 'margarita',
  'marisol', 'martha', 'micaela', 'milena', 'monica', 'nicole', 'nicolle', 'olivia',
  'rocio', 'sabrina', 'samara', 'sandra', 'scarlett', 'silvana', 'susana', 'veronica',
  'itzayana', 'mitzy', 'kayla', 'kiara', 'thais',
]);
const MALE_NAMES = new Set([
  'mateo', 'matheo', 'mathias', 'matias', 'santiago', 'sebastian', 'nicolas', 'alejandro',
  'diego', 'daniel', 'david', 'samuel', 'gael', 'leonardo', 'leo', 'emiliano', 'juan',
  'jose', 'carlos', 'miguel', 'angel', 'iker', 'dylan', 'xavier', 'javier', 'adrian',
  'alan', 'axel', 'benjamin', 'bruno', 'cristobal', 'dante', 'derek', 'eduardo', 'emanuel',
  'emir', 'enrique', 'erick', 'ethan', 'fernando', 'francisco', 'gabriel', 'gerardo',
  'hector', 'hugo', 'ian', 'isaac', 'ivan', 'jesus', 'joaquin', 'jonathan', 'jorge',
  'josue', 'julian', 'kevin', 'liam', 'lucas', 'luis', 'manuel', 'marco', 'mariano',
  'mauricio', 'maximiliano', 'noah', 'oliver', 'oscar', 'pablo', 'patricio', 'pedro',
  'rafael', 'ramon', 'raul', 'ricardo', 'rodrigo', 'roberto', 'saul', 'thiago', 'tadeo',
  'uriel', 'victor', 'yael', 'zaid', 'andres', 'antonio', 'arturo', 'bryan', 'camilo',
  'cesar', 'elias', 'felipe', 'gustavo', 'ignacio', 'israel', 'jaime', 'leonel', 'martin',
  'nestor', 'rene', 'salvador', 'santino', 'sergio', 'tomas', 'vicente',
  'emmanuel', 'jared', 'jayden', 'jaden', 'brandon', 'bryant', 'christopher',
  'cristian', 'christian', 'donovan', 'edwin', 'elian', 'fabian', 'franco',
  'giovanni', 'harold', 'jeremy', 'johan', 'jovani', 'kaleb', 'leandro', 'randy',
  'ronaldo', 'sammy', 'yahir', 'yandel', 'alexander', 'anthony', 'damian', 'jacob',
  'jeronimo', 'jonas', 'joseph', 'lorenzo', 'maddox', 'marcelo', 'marcos', 'mario',
  'matteo', 'maximo', 'michael', 'osvaldo', 'owen', 'ramiro', 'roman', 'ruben',
  'salomon', 'simon', 'teo', 'theo', 'valentino', 'william', 'aaron', 'abraham',
  'caleb', 'dilan', 'gadiel', 'isaias', 'jadiel', 'keny', 'mael', 'neymar',
  'rey', 'thiago', 'yamil',
]);

function normalizeName(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
}

function guessSex(fullName: string): 'F' | 'M' | null {
  const n = normalizeName(firstName(fullName));
  if (!n) return null;
  if (FEMALE_NAMES.has(n)) return 'F';
  if (MALE_NAMES.has(n)) return 'M';
  if (n.endsWith('a')) return 'F';
  if (n.endsWith('o')) return 'M';
  return null;
}

function swimmerSrc(student: { sex?: 'F' | 'M' | null; name: string }) {
  // Usa el sexo registrado; si falta, lo infiere del nombre (respaldo)
  const sex = student.sex ?? guessSex(student.name);
  if (sex === 'F') return '/swimmers/girl.png';
  if (sex === 'M') return '/swimmers/boy.png';
  return '/swimmers/neutral.png';
}

// Fondo de olas: capas de onda apiladas de claro a oscuro, cada una ondulando
const WAVE_COLORS = [
  '#d6effb', '#b9e3f7', '#95d2f2', '#6fbdec', '#49a6e3', '#2b8fd8',
  '#1576c9', '#0a5fb8', '#0b4fae', '#1142a8', '#1a36a0',
];

function buildWavePath(baseY: number, amp: number, waveLen: number): string {
  let d = `M -200 ${baseY}`;
  for (let x = -200; x <= 1400; x += waveLen) {
    const q1 = Math.round(x + waveLen / 4);
    const mid = Math.round(x + waveLen / 2);
    const q2 = Math.round(x + (waveLen * 3) / 4);
    const end = Math.round(x + waveLen);
    d += ` Q ${q1} ${baseY - amp} ${mid} ${baseY} Q ${q2} ${baseY + amp} ${end} ${baseY}`;
  }
  d += ' L 1400 600 L -200 600 Z';
  return d;
}

const WAVE_LAYERS = WAVE_COLORS.map((color, i) => ({
  color,
  d: buildWavePath(i * 54, 48 + (i % 3) * 12, 380 + (i % 4) * 70),
  dur: 5 + (i % 5) * 1.1,
  delay: (i * 0.6) % 3,
}));

export default function PoolBoard({
  branches,
  pools,
  sessions,
  kiosk = false,
  fullscreenHref,
}: Props) {
  const sw = kiosk
    ? {
        title: 'text-2xl sm:text-3xl',
        time: 'text-5xl sm:text-7xl',
        lane: 'min-h-[104px]',
        laneNum: 'h-9 w-9 text-sm',
        avatar: 'h-10 w-10',
        name: 'text-sm',
        swim: 'h-20',
      }
    : {
        title: 'text-lg',
        time: 'text-3xl sm:text-4xl',
        lane: 'min-h-[68px]',
        laneNum: 'h-7 w-7 text-xs',
        avatar: 'h-7 w-7',
        name: 'text-xs',
        swim: 'h-12',
      };
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [poolId, setPoolId] = useState('');
  const [now, setNow] = useState(() => new Date());

  // Reloj en vivo
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  const branchPools = useMemo(
    () => pools.filter((p) => p.branch_id === branchId),
    [pools, branchId],
  );

  // Mantener una alberca válida al cambiar de sucursal
  useEffect(() => {
    setPoolId((prev) =>
      branchPools.some((p) => p.id === prev) ? prev : (branchPools[0]?.id ?? ''),
    );
  }, [branchPools]);

  const pool = branchPools.find((p) => p.id === poolId) ?? branchPools[0] ?? null;

  const nowDow = now.getDay();
  const nowTime = hhmm(now);

  const activeInBranch = useMemo(() => {
    return sessions.filter(
      (s) =>
        s.branch_id === branchId &&
        s.students.length > 0 &&
        s.schedules.some(
          (sc) => sc.weekday === nowDow && sc.start <= nowTime && nowTime <= sc.end,
        ),
    );
  }, [sessions, branchId, nowDow, nowTime]);

  const totalSwimmers = activeInBranch.reduce((n, s) => n + s.students.length, 0);

  // Próxima clase (cuando no hay nadie en el agua)
  const nextClass = useMemo(() => {
    if (totalSwimmers > 0) return null;
    let best:
      | { score: number; inDays: number; weekday: number; start: string; name: string }
      | null = null;
    for (const s of sessions) {
      if (s.branch_id !== branchId || s.students.length === 0) continue;
      for (const sc of s.schedules) {
        let inDays = (sc.weekday - nowDow + 7) % 7;
        if (inDays === 0 && sc.start <= nowTime) inDays = 7;
        const startMins =
          parseInt(sc.start.slice(0, 2), 10) * 60 + parseInt(sc.start.slice(3, 5), 10);
        const score = inDays * 1440 + startMins;
        if (!best || score < best.score) {
          best = { score, inDays, weekday: sc.weekday, start: sc.start, name: s.name };
        }
      }
    }
    return best;
  }, [sessions, branchId, nowDow, nowTime, totalSwimmers]);

  const nextClassLabel = nextClass
    ? `${nextClass.inDays === 0 ? 'hoy' : nextClass.inDays === 1 ? 'mañana' : WEEKDAYS[nextClass.weekday]} a las ${nextClass.start} · ${nextClass.name}`
    : null;

  const lanes = pool ? Array.from({ length: pool.lanes }, (_, i) => i + 1) : [];

  const sessionsForLane = (lane: number) =>
    activeInBranch.filter((s) => s.pool_id === pool?.id && s.lane === lane);

  const unplaced = activeInBranch.filter(
    (s) =>
      s.pool_id == null ||
      (s.pool_id === pool?.id &&
        (s.lane == null || s.lane < 1 || (pool ? s.lane > pool.lanes : true))),
  );

  // Hora bonita "4:00 PM"
  const h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  const timeStr = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;

  function activeScheduleLabel(s: PoolSession) {
    const sc = s.schedules.find(
      (x) => x.weekday === nowDow && x.start <= nowTime && nowTime <= x.end,
    );
    return sc ? `${sc.start} – ${sc.end}` : '';
  }

  function Swimmer({
    student,
    session,
    idx,
  }: {
    student: Student;
    session: PoolSession;
    idx: number;
  }) {
    const [imgErr, setImgErr] = useState(false);
    const delay = { animationDelay: `${(idx % 6) * 0.35}s` };
    return (
      <div className="group relative shrink-0">
        {!imgErr ? (
          <div className="flex flex-col items-center">
            <img
              src={swimmerSrc(student)}
              alt={firstName(student.name)}
              onError={() => setImgErr(true)}
              style={delay}
              className={`swimmer-anim ${sw.swim} w-auto drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]`}
            />
            <span className="-mt-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white">
              {firstName(student.name)}
            </span>
          </div>
        ) : (
          <div
            className="swimmer-anim flex items-center gap-1.5 rounded-full border border-white/30 bg-white/90 py-1 pl-1 pr-2.5 shadow-md"
            style={delay}
          >
          {student.photo ? (
            <img
              src={student.photo}
              alt=""
              className={`${sw.avatar} rounded-full object-cover`}
            />
          ) : (
            <span
              className={`${sw.avatar} grid place-items-center rounded-full bg-sky-500 text-xs font-bold text-white`}
            >
              {firstName(student.name).charAt(0)}
            </span>
          )}
          <span className={`${sw.name} font-semibold text-slate-800`}>
            {firstName(student.name)}
          </span>
        </div>
        )}

        {/* Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-52 -translate-x-1/2 group-hover:block">
          <div className="rounded-2xl border border-white/15 bg-[#0d2436] p-3 text-left shadow-2xl">
            <p className="text-sm font-semibold text-white">{student.name}</p>
            <div className="mt-2 space-y-1 text-xs text-white/70">
              <p>🏊 Clase: <span className="text-white/90">{session.name}</span></p>
              {session.level && <p>📊 Nivel: <span className="text-white/90">{session.level}</span></p>}
              <p>🧑‍🏫 Maestro: <span className="text-white/90">{session.instructor ?? 'Sin asignar'}</span></p>
              <p>🕐 Horario: <span className="text-white/90">{activeScheduleLabel(session)}</span></p>
              <p>
                👥 En la clase:{' '}
                <span className="text-white/90">{session.students.length}</span>
                {session.lane != null && <span> · carril {session.lane}</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="glass-soft rounded-3xl p-5 sm:p-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`flex items-center gap-2 ${sw.title} font-semibold tracking-tight text-white`}>
            🏊 En la alberca ahora
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              EN VIVO
            </span>
          </h2>
          <p className="mt-0.5 text-sm capitalize text-white/45">
            {WEEKDAYS[nowDow]} · {totalSwimmers} alumno{totalSwimmers === 1 ? '' : 's'} en clase
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {fullscreenHref && (
            <a
              href={fullscreenHref}
              className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              ⛶ Pantalla completa
            </a>
          )}
          <p className={`${sw.time} font-bold tabular-nums text-white`}>{timeStr}</p>
        </div>
      </div>

      {/* Selector de sucursal */}
      {branches.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {branches.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBranchId(b.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                b.id === branchId
                  ? 'bg-cream font-semibold text-slate-900'
                  : 'border border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Selector de alberca */}
      {branchPools.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {branchPools.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPoolId(p.id)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                p.id === pool?.id
                  ? 'bg-sky-500/30 font-medium text-sky-100'
                  : 'border border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {p.name} · {p.lanes} carriles
            </button>
          ))}
        </div>
      )}

      {/* Alberca */}
      {pool ? (
        <div className="pool-water relative mt-5 rounded-2xl border border-sky-300/20 py-1.5">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1200 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {WAVE_LAYERS.map((l, i) => (
              <path
                key={i}
                d={l.d}
                fill={l.color}
                className="wave-layer"
                style={{ animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s` }}
              />
            ))}
          </svg>
          </div>
          <div className="relative z-10">
          <div className="lane-rope" />
          {lanes.map((lane) => {
            const laneSessions = sessionsForLane(lane);
            const swimmers = laneSessions.flatMap((s) =>
              s.students.map((st) => ({ st, s })),
            );
            return (
              <div key={lane}>
                <div
                  className={`relative flex ${sw.lane} items-center gap-3 px-3 py-2`}
                >
                  <span
                    className={`grid ${sw.laneNum} shrink-0 place-items-center rounded-full bg-white/15 font-bold text-white`}
                  >
                    {lane}
                  </span>
                  <div className="flex flex-1 flex-wrap gap-2">
                    {swimmers.map(({ st, s }, i) => (
                      <Swimmer key={`${s.id}-${st.id}`} student={st} session={s} idx={i} />
                    ))}
                    {swimmers.length === 0 && (
                      <span className="text-xs text-white/25">— carril libre —</span>
                    )}
                  </div>
                </div>
                <div className="lane-rope" />
              </div>
            );
          })}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/50">
          Esta sucursal no tiene albercas registradas. Agrégalas en Configuración.
        </div>
      )}

      {/* Sin carril asignado */}
      {unplaced.length > 0 && (
        <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-400/5 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-200/80">
            En clase sin carril asignado
          </p>
          <div className="flex flex-wrap gap-2">
            {unplaced.flatMap((s) =>
              s.students.map((st, i) => (
                <Swimmer key={`u-${s.id}-${st.id}`} student={st} session={s} idx={i} />
              )),
            )}
          </div>
        </div>
      )}

      {/* Vacío */}
      {pool && totalSwimmers === 0 && (
        <div className="mt-3 rounded-2xl bg-white/5 p-6 text-center">
          <p className="text-2xl">🌊</p>
          <p className="mt-2 text-sm text-white/50">
            No hay clases en curso en este momento.
          </p>
          {nextClassLabel && (
            <p className="mt-1 text-sm font-medium text-sky-200">
              Próxima clase: {nextClassLabel}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
