import { AnyRouter, Navigate } from '@tanstack/react-router';

export type NavigateProps = {
  to?: string;
  search?: Record<string, unknown>;
  [p: string]: unknown;
};

export const CustomNavigate = (props: NavigateProps) => {
  let to = props.to;
  if (!to) {
    to = localStorage.getItem('last_url') || '/';
  }

  localStorage.setItem('last_url', to);

  return <Navigate to={to} {...props} />;
};

// eslint-disable-next-line react-refresh/only-export-components
export const userCustomRouter = (router: AnyRouter) => {
  const sup = router.navigate;

  return {
    ...router,
    navigate: (props: NavigateProps) => {
      if (!props.to) {
        throw new Error(`Missing to`);
      }
      localStorage.setItem('last_url', props.to);
      return sup({
        ...props,
        to: props.to || '',
      });
    },
  };
};
