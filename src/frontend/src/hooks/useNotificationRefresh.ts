import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export function useNotificationRefresh() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.refetchQueries({ queryKey: ['notifications'] });
    } finally {
      setIsRefreshing(false);
    }
  };

  return { refresh, isRefreshing };
}
