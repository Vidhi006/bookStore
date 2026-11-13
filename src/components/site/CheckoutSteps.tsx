import React from 'react';
import { CheckOutlined } from '@ant-design/icons';

export type CheckoutStep = 'cart' | 'address' | 'summary' | 'done';

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: 'cart', label: 'Cart' },
  { key: 'address', label: 'Address' },
  { key: 'summary', label: 'Summary' },
  { key: 'done', label: 'Done' },
];

type CheckoutStepsProps = {
  current: CheckoutStep;
};

/**
 * Green / blue / grey progress bar used across the checkout journey.
 * Completed steps show a white tick on green, the current step shows a
 * white tick on blue, and upcoming steps show their number in grey.
 */
export function CheckoutSteps({ current }: CheckoutStepsProps) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <ol className="checkout-steps" aria-label="Checkout progress">
      {STEPS.map((step, index) => {
        const state =
          index < currentIndex ? 'complete' : index === currentIndex ? 'active' : 'upcoming';
        const isLast = index === STEPS.length - 1;

        return (
          <li
            key={step.key}
            className={`checkout-step checkout-step--${state}`}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <span className="checkout-step__marker" aria-hidden="true">
              {state === 'upcoming' ? index + 1 : <CheckOutlined />}
            </span>
            <span className="checkout-step__label">{step.label}</span>
            {!isLast ? <span className="checkout-step__line" aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
