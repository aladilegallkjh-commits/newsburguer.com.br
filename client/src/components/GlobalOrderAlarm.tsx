import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function GlobalOrderAlarm() {
  const { data: orders } = trpc.orders.getAll.useQuery(undefined, { refetchInterval: 5000 });
  const prevOrdersCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(() => localStorage.getItem('audioEnabled') === 'true');
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio('/phone.mp3');
  }, []);

  const playBeep = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn('Audio autoplay blocked', e));
      }
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  };

  const startAlarm = () => {
    if (alarmIntervalRef.current) return;
    setAlarmActive(true);
    playBeep();
    alarmIntervalRef.current = setInterval(() => {
      playBeep();
    }, 2500);
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAlarmActive(false);
    setHasNewOrder(false);
  };

  useEffect(() => {
    if (!orders) return;

    const pendingOrders = orders.filter((o: any) => o.status === 'pending');
    const hasPending = pendingOrders.length > 0;
    const newOrderArrived = prevOrdersCount.current > 0 && orders.length > prevOrdersCount.current;

    if (hasPending && audioEnabled) {
      if (!alarmIntervalRef.current) {
        setHasNewOrder(true);
        if (newOrderArrived) {
          toast('🔔 Novo pedido recebido! Acesse Pedidos para aceitar.', {
            duration: 10000,
            style: { background: '#C9A227', color: '#0A0A0A', fontWeight: 'bold' },
          });
        }
        startAlarm();
      }
    } else {
      if (alarmIntervalRef.current) {
        stopAlarm();
      }
    }

    prevOrdersCount.current = orders.length;
  }, [orders, audioEnabled]);

  useEffect(() => {
    return () => {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => {
            const nextState = !audioEnabled;
            setAudioEnabled(nextState);
            localStorage.setItem('audioEnabled', String(nextState));
            if (nextState) {
              playBeep();
              toast.success('Som ativado! Você ouvirá um alerta para cada novo pedido.', { style: { background: '#C9A227', color: '#111', fontWeight: 'bold' } });
            } else {
              stopAlarm();
              toast('Som desativado.', { style: { background: '#111', color: '#8A7A5A' } });
            }
          }}
          className="px-3 py-1.5 rounded font-semibold text-xs flex items-center gap-2 transition-all relative"
          style={{ 
            background: audioEnabled ? 'rgba(201,162,39,0.2)' : 'rgba(255,107,107,0.1)', 
            color: audioEnabled ? '#C9A227' : '#FF6B6B',
            border: `1px solid ${audioEnabled ? 'rgba(201,162,39,0.5)' : 'rgba(255,107,107,0.3)'}`
          }}
        >
          {audioEnabled ? <Bell size={14} /> : <Bell size={14} className="opacity-50" />}
          {audioEnabled ? 'Som Ativado' : 'Ativar Som'}
          {hasNewOrder && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping" style={{ background: '#C9A227' }} />
          )}
        </button>
        
        {alarmActive && (
          <button
            onClick={stopAlarm}
            className="px-3 py-1.5 rounded font-bold text-xs flex items-center gap-2 animate-pulse"
            style={{ background: 'rgba(255,60,60,0.25)', color: '#FF4444', border: '1px solid rgba(255,60,60,0.6)' }}
          >
            🔕 Silenciar
          </button>
        )}
    </div>
  );
}
