'use client';

import { useState, useEffect } from 'react';
import { getBeacons } from './api';

export function useBeacons() {
  const [beacons, setBeacons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBeacons() {
      setLoading(true);
      try {
        const data = await getBeacons();
        setBeacons(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al obtener los dispositivos');
      } finally {
        setLoading(false);
      }
    }
    fetchBeacons();
  }, []);

  return { beacons, loading, error };
}
