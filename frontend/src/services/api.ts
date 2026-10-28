import { io, type Socket } from 'socket.io-client';
import type { PredictionResponse, HealthResponse } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const checkHealth = async (): Promise<HealthResponse> => {
  const res = await fetch(`${BACKEND_URL}/api/health`);
  if (!res.ok) {
    throw new Error('Failed to fetch backend health status');
  }
  return res.json();
};

export const predictText = async (text: string): Promise<PredictionResponse> => {
  const res = await fetch(`${BACKEND_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Prediction request failed');
  }
  return res.json();
};
