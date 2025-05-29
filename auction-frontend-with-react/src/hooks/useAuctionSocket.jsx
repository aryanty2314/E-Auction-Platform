import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const SOCKET_URL = 'http://localhost:8080/ws';

export const useAuctionSocket = (auctionId, onUpdate, token, onError, onConnect) => {
  const clientRef = useRef(null);
  const [stompConnected, setStompConnected] = useState(false);
  
  // Refs for callbacks to ensure they are always up-to-date without causing effect re-runs
  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);
  const onConnectRef = useRef(onConnect);

  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onConnectRef.current = onConnect; }, [onConnect]);

  useEffect(() => {
    if (!auctionId || !token) {
      if (clientRef.current && clientRef.current.connected) {
        console.log(`[Socket-${auctionId}] Disconnecting: No auctionId or token.`);
        clientRef.current.disconnect(() => setStompConnected(false));
      }
      return;
    }

    // Initialize Stomp client if not already done
    if (!clientRef.current) {
      console.log(`[Socket-${auctionId}] Initializing Stomp client.`);
      const socket = new SockJS(SOCKET_URL);
      clientRef.current = Stomp.over(socket);
      clientRef.current.reconnect_delay = 5000; // Auto-reconnect delay

      // Global error handlers for the WebSocket/Stomp connection itself
      clientRef.current.onWebSocketError = (error) => {
        console.error(`[Socket-${auctionId}] WebSocket transport error:`, error);
        setStompConnected(false);
        onErrorRef.current?.(error);
      };
      
      clientRef.current.onStompError = (frame) => {
        console.error(`[Socket-${auctionId}] STOMP Broker error: ${frame.headers['message']}. Details: ${frame.body}`, frame);
        setStompConnected(false);
        onErrorRef.current?.(frame);
      };
    }
    
    const connectHeaders = { 'Authorization': `Bearer ${token}` };

    if (!clientRef.current.connected) {
      console.log(`[Socket-${auctionId}] Attempting to connect STOMP...`);
      clientRef.current.connect(
        connectHeaders, 
        () => { // onConnect frame
          console.log(`[Socket-${auctionId}] STOMP Connected.`);
          setStompConnected(true);
          onConnectRef.current?.();

          const subscription = clientRef.current.subscribe(
            `/topic/auction/${auctionId}`, 
            (message) => {
              try {
                const updateData = JSON.parse(message.body);
                // console.log(`[Socket-${auctionId}] Received update:`, updateData);
                onUpdateRef.current?.(updateData);
              } catch (e) {
                console.error(`[Socket-${auctionId}] Failed to parse message:`, message.body, e);
              }
            }, 
            connectHeaders // Some brokers might need headers for subscribe too
          );
          // Store subscription to unsubscribe on cleanup if needed, though disconnect handles it
          clientRef.current.stompSubscription = subscription; 
        },
        (errorFrame) => { // onError (connection specific error)
          console.error(`[Socket-${auctionId}] STOMP Connection failed:`, errorFrame);
          setStompConnected(false);
          onErrorRef.current?.(errorFrame);
        }
      );
    }

    return () => {
      if (clientRef.current) {
        if (clientRef.current.stompSubscription && typeof clientRef.current.stompSubscription.unsubscribe === 'function') {
            // console.log(`[Socket-${auctionId}] Unsubscribing STOMP subscription.`);
            // clientRef.current.stompSubscription.unsubscribe(); // Specific unsubscription
        }
        if (clientRef.current.connected) {
            console.log(`[Socket-${auctionId}] Disconnecting STOMP client on cleanup.`);
            clientRef.current.disconnect(() => {
                setStompConnected(false);
                console.log(`[Socket-${auctionId}] STOMP Disconnected.`);
            });
        }
        // To ensure a fresh client on next connect if issues persist with re-init:
        // clientRef.current = null; 
      }
    };
  }, [auctionId, token]); // Re-run effect if auctionId or token changes

  const sendBid = useCallback((amount) => {
    if (clientRef.current && clientRef.current.connected && auctionId && token) {
      const bidPayload = { auctionId: parseInt(auctionId), price: amount };
      // console.log(`[Socket-${auctionId}] Sending bid:`, bidPayload);
      try {
        clientRef.current.send(
          '/app/bid', // STOMP destination
          { 'Authorization': `Bearer ${token}` }, // Headers
          JSON.stringify(bidPayload) // Body
        );
      } catch (e) {
        console.error(`[Socket-${auctionId}] Error sending bid via STOMP:`, e);
        onErrorRef.current?.(e);
      }
    } else {
      const reason = !clientRef.current?.connected ? "client not connected" : "missing auctionId/token";
      console.warn(`[Socket-${auctionId}] Cannot send bid: ${reason}.`);
      onErrorRef.current?.(new Error(`Cannot send bid: ${reason}.`));
    }
  }, [auctionId, token]);

  const isConnected = useCallback(() => {
    return clientRef.current?.connected && stompConnected;
  }, [stompConnected]);

  return { sendBid, isConnected };
};