import { shallow, mount } from 'enzyme';
import React from 'react';
import { Checkbox } from '../../../src/components';
import SelectionTypes from '../../../src/components/selection/SelectionTypes';
import { SelectionInput } from '../../../src/components/selection/SelectionInput';

describe('Checkbox Component', () => {
  describe('Checkbox component test suite => ', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('render with default props and initial value', () => {
      const wrapper = shallow(
        <Checkbox name="default-checkbox-name" value="default-checkbox-value" />
      );
      expect(wrapper.length).toEqual(1);
      expect(wrapper.find(SelectionInput).length).toBe(1);
      expect(wrapper.find(SelectionInput).prop('type')).toEqual(
        SelectionTypes.CHECKBOX
      );
      expect(wrapper.find(SelectionInput).prop('name')).toEqual(
        'default-checkbox-name'
      );
      expect(wrapper.find(SelectionInput).prop('value')).toEqual(
        'default-checkbox-value'
      );
    });

    it('with "checked" state', () => {
      const onChangeCallback = jest.fn();
      const wrapper = mount(
        <Checkbox
          name="checked-state-checkbox-name"
          value="checked-state-checkbox-value"
          checked="checked"
          onChange={onChangeCallback}
        />
      );
      expect(wrapper.length).toEqual(1);
      expect(wrapper.find(SelectionInput).length).toBe(1);
      expect(wrapper.find(SelectionInput).prop('type')).toEqual(
        SelectionTypes.CHECKBOX
      );
      expect(wrapper.find(SelectionInput).prop('checked')).toBe('checked');
      wrapper.unmount();
    });

    it('with "mixed" state', () => {
      const onChangeCallback = jest.fn();
      const wrapper = shallow(
        <Checkbox
          name="mixed-checkbox-name"
          value="mixed-checkbox-value"
          checked="mixed"
          onChange={onChangeCallback}
        />
      );
      expect(wrapper.length).toEqual(1);
      expect(wrapper.find(SelectionInput).length).toBe(1);
      expect(wrapper.find(SelectionInput).prop('type')).toEqual(
        SelectionTypes.CHECKBOX
      );
      expect(wrapper.find(SelectionInput).prop('checked')).toBe('mixed');
    });

    it('with click handler', () => {
      const clickCallback = jest.fn();
      const wrapper = shallow(
        <Checkbox
          name="click-checkbox-name"
          value="click-checkbox-value"
          onClick={clickCallback}
        />
      );
      expect(wrapper.length).toEqual(1);
      wrapper.find(SelectionInput).props().onClick(null);
      expect(clickCallback).toBeCalled();
    });
  });
});
