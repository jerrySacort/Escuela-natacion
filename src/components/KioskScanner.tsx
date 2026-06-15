import { useEffect, useRef, useState, type FormEvent } from 'react';

interface Candidate {
  group_id: string;
  name: string;
  has_class_today: boolean;
  start_time: string | null;
}

type Result =
  | { kind: 'ok' | 'already'; student: string; group: string }
  | { kind: 'error'; message: string }
  | { kind: 'choose'; student: string; code: string; candidates: Candidate[] }
  | null;

/** Kiosko de check-in: escáner QR con cámara (BarcodeDetector) + entrada manual. */
export default function KioskScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastCode = useRef<{ code: string; at: number }>({ code: '', at: 0 });
  const [cameraState, setCameraState] = useState<'starting' | 'on' | 'unavailable'>('starting');
  const [result, setResult] = useState<Result>(null);
  const [busy, setBusy] = useState(false);

  async function submitCode(code: string, groupId?: string) {
    if (busy) return;
    setBusy(true);
    const fd = new FormData();
    fd.set('code', code);
    if (groupId) fd.set('group_id', groupId);
    try {
      const res = await fetch('/api/attendance/checkin', { method: 'POST', body: fd });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.status === 'ok') {
        setResult({ kind: 'ok', student: body.student_name, group: body.group_name });
      } else if (res.ok && body.status === 'already') {
        setResult({ kind: 'already', student: body.student_name, group: body.group_name });
      } else if (res.ok && body.status === 'choose') {
        setResult({
          kind: 'choose',
          student: body.student_name,
          code,
          candidates: body.candidates ?? [],
        });
        setBusy(false);
        return; // no auto-limpiar: espera elección
      } else {
        setResult({ kind: 'error', message: body.error ?? 'Error desconocido.' });
      }
    } catch {
      setResult({ kind: 'error', message: 'Sin conexión con el servidor.' });
    }
    setBusy(false);
    setTimeout(() => setResult((r) => (r?.kind === 'choose' ? r : null)), 3500);
  }

  function onScan(code: string) {
    const now = Date.now();
    if (code === lastCode.current.code && now - lastCode.current.at < 5000) return;
    lastCode.current = { code, at: now };
    void submitCode(code);
  }

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    async function start() {
      const Detector = (window as any).BarcodeDetector;
      if (!Detector) {
        setCameraState('unavailable');
        return;
      }
      try {
        const supported: string[] = await Detector.getSupportedFormats();
        if (!supported.includes('qr_code')) {
          setCameraState('unavailable');
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraState('on');

        const detector = new Detector({ formats: ['qr_code'] });
        timer = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0 && codes[0].rawValue) {
              onScan(codes[0].rawValue);
            }
          } catch {
            /* frame no decodificable: ignorar */
          }
        }, 350);
      } catch {
        setCameraState('unavailable');
      }
    }

    void start();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onManualSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = fd.get('manual_code')?.toString().trim();
    if (code) void submitCode(code);
    e.currentTarget.reset();
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Cámara */}
      <div className="glass relative overflow-hidden rounded-[2rem]">
        {cameraState !== 'unavailable' ? (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              className="aspect-square w-full object-cover"
            />
            {/* Marco guía */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="h-52 w-52 rounded-3xl border-2 border-white/60" />
            </div>
            {cameraState === 'starting' && (
              <div className="absolute inset-0 grid place-items-center bg-black/50 text-white/70">
                Iniciando cámara…
              </div>
            )}
          </>
        ) : (
          <div className="grid aspect-square w-full place-items-center p-8 text-center text-white/50">
            <div>
              <p className="text-4xl">📷</p>
              <p className="mt-3 text-sm">
                El escáner no está disponible en este navegador.
                Usa la entrada manual de abajo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resultado */}
      {result && result.kind !== 'choose' && (
        <div
          className={`modal-panel mt-4 rounded-3xl p-5 text-center ${
            result.kind === 'ok'
              ? 'bg-emerald-400/20 text-emerald-100'
              : result.kind === 'already'
                ? 'bg-amber-400/20 text-amber-100'
                : 'bg-red-400/20 text-red-100'
          }`}
        >
          {result.kind === 'ok' && (
            <>
              <p className="text-3xl">✅</p>
              <p className="mt-1 text-lg font-semibold">{result.student}</p>
              <p className="text-sm opacity-80">Asistencia registrada · {result.group}</p>
            </>
          )}
          {result.kind === 'already' && (
            <>
              <p className="text-3xl">👋</p>
              <p className="mt-1 text-lg font-semibold">{result.student}</p>
              <p className="text-sm opacity-80">Ya tenía asistencia hoy · {result.group}</p>
            </>
          )}
          {result.kind === 'error' && (
            <>
              <p className="text-3xl">⚠️</p>
              <p className="mt-1 text-sm">{result.message}</p>
            </>
          )}
        </div>
      )}

      {/* Elección de grupo */}
      {result?.kind === 'choose' && (
        <div className="modal-panel mt-4 rounded-3xl bg-white/10 p-5">
          <p className="text-center text-sm text-white/70">
            <span className="font-semibold text-white">{result.student}</span>
            {' — '}¿a qué grupo asiste?
          </p>
          <div className="mt-3 space-y-2">
            {result.candidates.map((c) => (
              <button
                key={c.group_id}
                onClick={() => void submitCode(result.code, c.group_id)}
                className="glass-soft w-full rounded-full px-5 py-3 text-sm text-white/90 transition hover:bg-white/15"
              >
                {c.name}
                {c.start_time && (
                  <span className="ml-2 text-white/50">{c.start_time}</span>
                )}
                {c.has_class_today && (
                  <span className="bg-cream ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-900">
                    hoy
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setResult(null)}
            className="mt-3 w-full text-center text-xs text-white/40 hover:text-white/70"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Entrada manual */}
      <form onSubmit={onManualSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          name="manual_code"
          placeholder="O escribe el código del alumno…"
          className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
        />
        <button
          disabled={busy}
          className="bg-cream rounded-full px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          Registrar
        </button>
      </form>
    </div>
  );
}
