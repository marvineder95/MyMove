import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseButton from '../ui/BaseButton.vue';

describe('BaseButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(BaseButton, {
      slots: { default: 'Click me' },
    });
    expect(wrapper.text()).toContain('Click me');
  });

  it('is disabled when loading', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true },
      slots: { default: 'Save' },
    });
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
