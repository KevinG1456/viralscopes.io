import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import * as accountApi from '../lib/api/account';
import type { AccountExportData } from '../types/api';

export function useExportAccount(): UseMutationResult<AccountExportData, Error, void> {
  return useMutation({ mutationFn: accountApi.exportAccountData });
}

export function useDeleteAccount(): UseMutationResult<void, Error, void> {
  return useMutation({ mutationFn: accountApi.deleteAccount });
}
