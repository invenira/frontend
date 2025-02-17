import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export type AnimateTransitionProps = {
  children: ReactNode;
};

export const AnimateTransition = (props: AnimateTransitionProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={pageTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        {props.children}
      </motion.div>
    </AnimatePresence>
  );
};
