import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export const useImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/images/history');
      setImages(data.images || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load images.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { images, loading, refresh };
};
