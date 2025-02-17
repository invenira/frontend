import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimateTransition } from './AnimateTransition';

describe('AnimateTransition', () => {
  it('renders children correctly', () => {
    render(
      <AnimateTransition>
        <div data-testid="child">Test Child</div>
      </AnimateTransition>,
    );

    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Child');
  });

  it('wraps children in a container element (motion.div)', () => {
    const { container } = render(
      <AnimateTransition>
        <div data-testid="child">Test Child</div>
      </AnimateTransition>,
    );

    // The top-level element should be a div (from motion.div)
    const wrapper = container.firstElementChild;
    expect(wrapper).toBeTruthy();
    expect(wrapper?.tagName).toBe('DIV');

    // The wrapper should contain the child
    const child = screen.getByTestId('child');
    expect(wrapper).toContainElement(child);
  });

  it('matches snapshot', () => {
    const { container } = render(
      <AnimateTransition>
        <div>Snapshot Content</div>
      </AnimateTransition>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
