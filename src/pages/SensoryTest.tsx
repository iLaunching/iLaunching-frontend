import { useCallback, useEffect, useRef, useState } from 'react';

/** WebSocket URL for synaptic-mind tele-somatic bridge (default local synaptic-mind). */
const defaultWsUrl = () => {
  const fromEnv = import.meta.env.VITE_SYNAPTIC_MIND_WS_URL as string | undefined;
  if (fromEnv) return fromEnv;
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.hostname}:8080/peripheral/somatic`;
};

type PerceptionSummary = {
  frame_seq: number;
  nuxon_id: number;
  salience: number;
  db_level: number;
  duration_sec: number;
  ventral_magnitudes: number[];
  sensory_deprivation: boolean;
  hypothyx_homeostasis_alert: boolean;
};

/**
 * Tele-somatic test bench: browser mic → WebSocket → Railway synaptic-mind (afferent → Thalyx).
 * Uses ScriptProcessorNode (2048 samples) per project spec; prefer secure context for getUserMedia.
 */
export default function SensoryTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [running, setRunning] = useState(false);
  const [wsUrl, setWsUrl] = useState(defaultWsUrl);
  const [log, setLog] = useState<string>('');
  const [last, setLast] = useState<PerceptionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const drawSpectrum = useCallback((mags: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas || mags.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    const max = Math.max(...mags, 1e-9);
    const barW = w / mags.length;
    ctx.fillStyle = '#38bdf8';
    mags.forEach((v, i) => {
      const bh = (v / max) * (h - 8);
      ctx.fillRect(i * barW, h - bh, Math.max(barW - 0.5, 1), bh);
    });
  }, []);

  useEffect(() => {
    if (last?.ventral_magnitudes?.length) {
      drawSpectrum(last.ventral_magnitudes);
    }
  }, [last, drawSpectrum]);

  const stop = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    setRunning(false);
  }, []);

  const start = async () => {
    setError(null);
    stop();

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => resolve();
      ws.onerror = () => reject(new Error('WebSocket failed to connect'));
      const t = setTimeout(() => reject(new Error('WebSocket timeout')), 15000);
      ws.addEventListener('open', () => clearTimeout(t), { once: true });
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    streamRef.current = stream;

    const audioContext = new AudioContext({ sampleRate: 44100 });
    audioCtxRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);

    // ScriptProcessorNode: 2048 buffer, 1 in / 1 out (deprecated but specified for this test page)
    const processor = audioContext.createScriptProcessor(2048, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const copy = Float32Array.from(inputData);
      ws.send(JSON.stringify(Array.from(copy)));
    };

    const silent = audioContext.createGain();
    silent.gain.value = 0;
    source.connect(processor);
    processor.connect(silent);
    silent.connect(audioContext.destination);

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data as string) as Record<string, unknown>;
        if (typeof data.error === 'string') {
          setError(data.error);
          return;
        }
        const p = data as unknown as PerceptionSummary;
        setLast(p);
        setLog(
          `frame ${p.frame_seq} | salience ${p.salience.toFixed(3)} | dB ${p.db_level.toFixed(1)} | deprivation ${p.sensory_deprivation}`,
        );
      } catch {
        setLog(String(ev.data));
      }
    };

    ws.onclose = () => setRunning(false);
    setRunning(true);
  };

  useEffect(() => () => stop(), [stop]);

  const homeostasisOk = last && !last.hypothyx_homeostasis_alert && !last.sensory_deprivation;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Somatic → Afferent (Synaptic Mind)</h1>
        <p className="text-slate-400 text-sm">
          Mic frames (2048 samples, 44.1 kHz) over WebSocket to{' '}
          <code className="text-cyan-400">/peripheral/somatic</code>. Set{' '}
          <code className="text-cyan-400">VITE_SYNAPTIC_MIND_WS_URL</code> to your Railway{' '}
          <code className="text-cyan-400">wss://…/peripheral/somatic</code>.
        </p>

        <label className="block space-y-1">
          <span className="text-xs uppercase text-slate-500">WebSocket URL</span>
          <input
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm font-mono"
            value={wsUrl}
            onChange={(e) => setWsUrl(e.target.value)}
            disabled={running}
          />
        </label>

        <div className="flex gap-3">
          {!running ? (
            <button
              type="button"
              onClick={() => void start().catch((e: Error) => setError(e.message))}
              className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-sm font-medium"
            >
              Start sensing
            </button>
          ) : (
            <button
              type="button"
              onClick={stop}
              className="rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-2 text-sm font-medium"
            >
              Stop
            </button>
          )}
        </div>

        {error && <p className="text-rose-400 text-sm">{error}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="text-sm font-medium text-slate-400 mb-2">Salience (Medial MGN)</h2>
            <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-[width] duration-75"
                style={{ width: `${Math.min(100, (last?.salience ?? 0) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 font-mono">{last != null ? last.salience.toFixed(4) : '—'}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="text-sm font-medium text-slate-400 mb-2">Hypothyx / homeostasis</h2>
            <div
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                homeostasisOk ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-200'
              }`}
            >
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: homeostasisOk ? '#34d399' : '#f87171' }} />
              {homeostasisOk ? 'Sensory stream OK' : 'Sensory deprivation / alert'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <h2 className="text-sm font-medium text-slate-400 mb-2">Ventral MGN (spectrum preview)</h2>
          <canvas ref={canvasRef} width={512} height={120} className="w-full rounded-md border border-slate-800" />
        </div>

        <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap break-all">{log || '—'}</pre>
      </div>
    </div>
  );
}
