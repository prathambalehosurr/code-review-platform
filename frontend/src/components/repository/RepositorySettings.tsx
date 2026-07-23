import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { AiSettings } from '../../types/repository';
import { useRepositorySettings, useUpdateRepositorySettings } from '../../hooks/useRepositories';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Save } from 'lucide-react';

type Props = { repositoryId: string };

export const RepositorySettings: React.FC<Props> = ({ repositoryId }) => {
  const { data: settings, isLoading } = useRepositorySettings(repositoryId);
  const { mutate: updateSettings, isPending } = useUpdateRepositorySettings(repositoryId);

  const { register, handleSubmit, reset, watch } = useForm<AiSettings>();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const onSubmit = (data: AiSettings) => {
    updateSettings(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Enable toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-800">
        <div>
          <p className="text-sm font-medium text-white">Enable AI Reviews</p>
          <p className="text-xs text-zinc-500 mt-0.5">Toggle reviews without disconnecting the repository</p>
        </div>
        <label className="relative inline-flex cursor-pointer">
          <input type="checkbox" {...register('enabled')} className="sr-only peer" />
          <div className="w-11 h-6 bg-zinc-700 peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:bg-red-600 transition-all" />
          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5" />
        </label>
      </div>

      {/* Review Level */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Review Level</label>
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'standard', 'strict'] as const).map((level) => (
            <label
              key={level}
              className={`flex items-center justify-center h-10 rounded-xl border cursor-pointer transition-all text-sm font-medium capitalize ${
                watch('reviewLevel') === level
                  ? 'border-red-500/50 bg-red-600/20 text-red-300'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <input type="radio" {...register('reviewLevel')} value={level} className="sr-only" />
              {level}
            </label>
          ))}
        </div>
      </div>

      {/* AI Model */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">AI Model</label>
        <select
          {...register('model')}
          className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-red-500/50 transition-all"
        >
          <option value="meta/llama-3.1-8b-instruct">Llama 3.1 8B (Fast)</option>
          <option value="meta/llama-3.1-70b-instruct">Llama 3.1 70B (More thorough)</option>
        </select>
      </div>

      {/* Max Files & Max Patch Characters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Max Files</label>
          <input
            type="number"
            {...register('maxFiles', { valueAsNumber: true })}
            min={1}
            max={200}
            className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-red-500/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Max Patch Characters</label>
          <input
            type="number"
            {...register('maxPatchCharacters', { valueAsNumber: true })}
            min={500}
            max={10000}
            className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-red-500/50 transition-all"
          />
        </div>
      </div>

      {/* Analysis toggles */}
      <div>
        <p className="text-sm font-medium text-zinc-300 mb-3">Analysis Categories</p>
        <div className="space-y-3">
          {(
            [
              { field: 'includeSecurity', label: 'Security' },
              { field: 'includePerformance', label: 'Performance' },
              { field: 'includeMaintainability', label: 'Maintainability' },
              { field: 'includeBestPractices', label: 'Best Practices' },
            ] as const
          ).map(({ field, label }) => (
            <label
              key={field}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 border border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-all"
            >
              <span className="text-sm text-zinc-300">{label}</span>
              <div className="relative">
                <input type="checkbox" {...register(field)} className="sr-only peer" />
                <div className="w-9 h-5 bg-zinc-700 peer-checked:bg-red-600 rounded-full transition-all" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4" />
              </div>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" variant="primary" isLoading={isPending} leftIcon={<Save className="w-4 h-4" />}>
        Save Settings
      </Button>
    </form>
  );
};
