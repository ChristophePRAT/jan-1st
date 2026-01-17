import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { CalendarEvent } from '@/types/chat';

export interface SpecializedAgent {
    name: string;
    response: string;
}

interface SocketState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    specializedAgents: SpecializedAgent[];
    calendarEvents: CalendarEvent[];
}

// const SOCKET_URL = 'http://127.0.0.1:3000';
const SOCKET_URL = 'https://jan-1st.onrender.com';

export const useSocketIntegration = () => {
    const [state, setState] = useState<SocketState>({
        isConnected: false,
        isConnecting: true,
        error: null,
        specializedAgents: [],
        calendarEvents: [],
    });

    const socketRef = useRef<Socket | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 10000,
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected to server:', SOCKET_URL);
            reconnectAttempts.current = 0;
            setState(prev => ({
                ...prev,
                isConnected: true,
                isConnecting: false,
                error: null,
            }));
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            setState(prev => ({
                ...prev,
                isConnected: false,
                isConnecting: false,
            }));
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
            reconnectAttempts.current++;
            setState(prev => ({
                ...prev,
                isConnecting: reconnectAttempts.current < maxReconnectAttempts,
                error: `Connexion échouée: ${error.message}`,
            }));
        });

        // Listen for create_specialized_agents (creates multiple agents at once)
        socket.on('create_specialized_agent', (data: { name: string } | string) => {
            console.log('[Socket] Create specialized agent:', data);
            const name = typeof data === 'string' ? data : data.name;
            if (name && !state.specializedAgents.some(agent => agent.name === name)) {
                setState(prev => ({
                    ...prev,
                    specializedAgents: [{ name, response: '' }, ...prev.specializedAgents],
                }));
            }
        });


        // Listen for specialized agent response
        socket.on('specialized_agent_response', (data: { name: string; chunk: string }) => {
            console.log('[Socket] Specialized agent response:', data);
            setState(prev => ({
                ...prev,
                specializedAgents: prev.specializedAgents.map(agent =>
                    agent.name === data.name
                        ? { ...agent, response: agent.response + data.chunk }
                        : agent
                ),
            }));
        });

        // Listen for individual calendar events and accumulate them
        socket.on('calendar_event', (event: CalendarEvent) => {
            console.log('[Socket] Calendar event received:', event);
            setState(prev => ({
                ...prev,
                calendarEvents: [...prev.calendarEvents, event],
            }));
        });

        socketRef.current = socket;
    }, []);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setState(prev => ({
                ...prev,
                isConnected: false,
                isConnecting: false,
            }));
        }
    }, []);

    const sendMessage = useCallback((message: string) => {
        if (socketRef.current?.connected) {
            console.log('[Socket] Sending message:', message);
            // Reset agents for new conversation
            setState(prev => ({
                ...prev,
                specializedAgents: [],
                calendarEvents: [],
            }));
            socketRef.current.emit('message', message);
        } else {
            console.warn('[Socket] Cannot send message, not connected');
            setState(prev => ({ ...prev, error: 'Socket non connecté' }));
        }
    }, []);

    const clearAgents = useCallback(() => {
        setState(prev => ({ ...prev, specializedAgents: [], calendarEvents: [] }));
    }, []);

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        ...state,
        connect,
        disconnect,
        sendMessage,
        clearAgents,
        socket: socketRef.current,
    };
};
