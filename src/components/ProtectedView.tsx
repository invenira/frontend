import { ReactNode } from 'react';
import { AnimateTransition, ProtectedRoute } from '@/components/index.ts';

export type ProtectedViewProps = {
  children: ReactNode;
};

export const ProtectedView = (props: ProtectedViewProps) => {
  return (
    <ProtectedRoute>
      <AnimateTransition>{props.children}</AnimateTransition>
    </ProtectedRoute>
  );
};
