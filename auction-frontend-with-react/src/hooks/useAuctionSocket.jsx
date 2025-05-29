import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export const useAuctionSocket = (auctionId, onUpdate, token) => {
  const client = useRef(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    client.current = Stomp.over(socket);

    client.current.connect({ Authorization: `Bearer ${token}` }, () => {
      client.current.subscribe(`/topic/auction/${auctionId}`, (msg) => {
        onUpdate(JSON.parse(msg.body));
      });
    });

    return () => client.current && client.current.disconnect();
  }, [auctionId, token, onUpdate]);

  const sendBid = (amount) => {
    client.current.send(
      '/app/bid',
      { Authorization: `Bearer ${token}` },
      JSON.stringify({ auctionId, price: amount })
    );
  };

  return { sendBid };
};
