import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = "http://localhost:3002";

function App() {
  const [data, setData] = useState({ trades: [], cargos: [] });

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

    socket.on('real-time-updates', (updates) => {
      setData(updates);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h1>Real-Time Analytics Dashboard</h1>
      <h2>Trades</h2>
      {data.trades.map((trade) => (
        <div key={trade.transaction_id}>
          <p>{trade.buyer_id} bought from {trade.seller_id}</p>
        </div>
      ))}

      <h2>Cargos</h2>
      {data.cargos.map((cargo) => (
        <div key={cargo.shipment_id}>
          <p>Shipment from {cargo.origin_station_id} to {cargo.destination_station_id}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
