import { shallow } from 'enzyme';
import React from 'react';
import { TextField, Validation } from '../../../src/components';
import { Validators } from '../../../src/core/validators/validators';

describe('Validation Component', () => {
  describe('Validation test suite => ', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('if a validator is present no error message appears before modified', async () => {
      const validate = jest.spyOn(Validation.prototype, 'validate');
      const wrapper = shallow(
        <Validation validator={Validators.Required} errorMessage={'Required'}>
          <TextField />
        </Validation>
      );
      expect(wrapper.length).toEqual(1);
      expect(wrapper.find('.tk-validation--error').exists()).toBeFalsy();
      expect(wrapper.find('.tk-validation__error').exists()).toBeFalsy();
      const mockEvent = { target: { value: 'This is just for test' } };
      wrapper.find('TextField').simulate('change', mockEvent);
      expect(validate).toHaveBeenCalledWith(mockEvent.target.value);
    });
    it('"onValidationChanged" callback should be called on validation', async () => {
      const zone = {
        onChange: () => null,
        onValidationChanged: () => null,
        validator: Validators.Required,
      };
      const change = jest.spyOn(zone, 'onChange');
      const validate = jest.spyOn(Validation.prototype, 'validate');
      const valChange = jest.spyOn(zone, 'onValidationChanged');
      const wrapper = shallow(
        <Validation
          validator={zone.validator}
          errorMessage={'Required'}
          onValidationChanged={zone.onValidationChanged}
        >
          <TextField onChange={zone.onChange} />
        </Validation>
      );
      const mockEvent = { target: { value: 'This is just for test' } };
      wrapper.find('TextField').simulate('change', mockEvent);
      expect(change).toHaveBeenCalledWith(mockEvent);
      await validate;
      expect(valChange).toHaveBeenCalledWith(true);
    });
    it('validation should be called when the child component is updated', async () => {
      const zone = {
        onChange: () => null,
        validator: Validators.Required,
      };
      const change = jest.spyOn(zone, 'onChange');
      const validate = jest.spyOn(Validation.prototype, 'validate');
      const wrapper = shallow(
        <Validation validator={zone.validator} errorMessage={'Required'}>
          <TextField onChange={zone.onChange} />
        </Validation>
      );
      const mockEvent = { target: { value: 'This is just for test' } };
      wrapper.find('TextField').simulate('change', mockEvent);
      expect(change).toHaveBeenCalledWith(mockEvent);
      await validate;
      expect(validate).toHaveBeenCalledWith(mockEvent.target.value);
    });
    it('validation should be called when the child component loses focus', async () => {
      const zone = {
        onBlur: () => null,
        validator: Validators.Required,
      };
      const blur = jest.spyOn(zone, 'onBlur');
      const validate = jest.spyOn(Validation.prototype, 'validate');
      const wrapper = shallow(
        <Validation validator={zone.validator} errorMessage={'Required'}>
          <TextField onBlur={zone.onBlur} />
        </Validation>
      );
      const mockEvent = { target: { value: 'This is just for test' } };
      wrapper.find('TextField').simulate('blur', mockEvent);
      expect(blur).toHaveBeenCalledWith(mockEvent);
      await validate;
      expect(validate).toHaveBeenCalledWith(mockEvent.target.value);
    });
    it('validation should be called at initialization if validateOnInit is defined', async () => {
      const validate = jest.spyOn(Validation.prototype, 'validate');
      const valueToCheck = 'A value to test';
      const wrapper = shallow(
        <Validation
          validateOnInit={valueToCheck}
          validator={Validators.Required}
          errorMessage={'Required'}
        >
          <TextField />
        </Validation>
      );
      expect(wrapper.length).toEqual(1);
      expect(validate).toHaveBeenCalled();
      expect(validate).toHaveBeenCalledWith(valueToCheck);
    });
    it('should chain validators in an array', async () => {
      const promiseAll = jest
        .spyOn(Promise, 'all')
        .mockImplementation(() => Promise.resolve([{ number: true }]));
      const validate = jest.spyOn(Validation.prototype, 'validate');
      const wrapper = shallow(
        <Validation
          validator={[Validators.Required, Validators.Number]}
          errorMessage={{ required: 'Required', number: 'Number' }}
        >
          <TextField />
        </Validation>
      );
      const mockEvent = { target: { value: 'This is just for test' } };
      wrapper.find('TextField').simulate('change', mockEvent);
      await promiseAll;
      await validate;
      wrapper.render();
      expect(wrapper.find('.tk-validation__error').text()).toEqual('Number');
    });
    it('should force validation', async () => {
      const zone = {
        onChange: () => null,
        onValidationChanged: () => null,
        validator: Validators.Required,
      };
      const validate = jest.spyOn(Validation.prototype, 'validate');
      const validator = jest.spyOn(zone, 'validator');

      const wrapper = shallow(
        <Validation validator={zone.validator} errorMessage={'Required'}>
          <TextField />
        </Validation>
      );
      (wrapper.instance() as Validation).refreshValidation();

      await validator;
      await validate;
      wrapper.render();
      expect(wrapper.find('.tk-validation__error').text()).toEqual('Required');
    });
    it('should reset validation', async () => {
      const zone = {
        validator: Validators.Required,
      };
      const validate = jest.spyOn(Validation.prototype, 'validate');
      const validator = jest.spyOn(zone, 'validator');

      const wrapper = shallow(
        <Validation validator={zone.validator} errorMessage={'Required'}>
          <TextField />
        </Validation>
      );
      (wrapper.instance() as Validation).refreshValidation();
      // Now some errors should be displayed
      await validator;
      await validate;
      wrapper.render();
      expect(wrapper.find('.tk-validation__error').text()).toEqual('Required');

      (wrapper.instance() as Validation).reset();
      await validator;
      await validate;
      wrapper.render();
      // Now no errors should be displayed
      expect(wrapper.find('.tk-validation__error').exists()).toBeFalsy();
    });
  });
});