import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositoryService } from '../services/repository.service';
import type { AiSettings } from '../types/repository';
import { useToast } from './useToast';

export const REPOS_KEY = ['repositories'];

export const useRepositories = () => {
  return useQuery({
    queryKey: REPOS_KEY,
    queryFn: repositoryService.list,
    staleTime: 30_000,
  });
};

export const useRepository = (id: string) => {
  return useQuery({
    queryKey: ['repository', id],
    queryFn: () => repositoryService.get(id),
    enabled: !!id,
  });
};

export const useSyncRepositories = () => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: repositoryService.sync,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REPOS_KEY });
      toast.success('Repositories synced', 'Your GitHub repositories have been updated.');
    },
    onError: () => {
      toast.error('Sync failed', 'Could not sync repositories. Please try again.');
    },
  });
};

export const useConnectRepository = () => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => repositoryService.connect(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: REPOS_KEY });
      qc.invalidateQueries({ queryKey: ['repository', data.id] });
      toast.success('Repository connected', `${data.name} is now receiving AI reviews.`);
    },
    onError: () => {
      toast.error('Connection failed', 'Could not connect repository.');
    },
  });
};

export const useDisconnectRepository = () => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => repositoryService.disconnect(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: REPOS_KEY });
      qc.invalidateQueries({ queryKey: ['repository', data.id] });
      toast.success('Repository disconnected', `${data.name} will no longer receive AI reviews.`);
    },
    onError: () => {
      toast.error('Disconnect failed', 'Could not disconnect repository.');
    },
  });
};

export const useDeleteRepository = () => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => repositoryService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REPOS_KEY });
      toast.success('Repository removed');
    },
    onError: () => {
      toast.error('Delete failed', 'Could not remove repository.');
    },
  });
};

export const useRepositorySettings = (id: string) => {
  return useQuery({
    queryKey: ['repository-settings', id],
    queryFn: () => repositoryService.getSettings(id),
    enabled: !!id,
  });
};

export const useUpdateRepositorySettings = (id: string) => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (settings: Partial<AiSettings>) => repositoryService.updateSettings(id, settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repository-settings', id] });
      toast.success('Settings saved', 'AI review settings have been updated.');
    },
    onError: () => {
      toast.error('Save failed', 'Could not update settings.');
    },
  });
};

export const useRepositoryReviews = (id: string, params?: { page?: number; limit?: number; sort?: string }) => {
  return useQuery({
    queryKey: ['repository-reviews', id, params],
    queryFn: () => repositoryService.getReviews(id, params),
    enabled: !!id,
  });
};
