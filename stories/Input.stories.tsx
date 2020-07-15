import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import React from 'react';
import { Input } from '../src/components';
import { Validators } from '../src/core/validators/validators';

export const Inputs: React.SFC = () => {
  const logChange = value => {
    console.info(value);
  };

  return (
    <div style={{ width: '50%' }}>
      <div>
        <p>Simple Input with change handler and a label</p>
        <Input
          label="Ipsum"
          placeholder="Firstname"
          value="Lorem"
          onChange={logChange}
        ></Input>
      </div>
      <hr />
      <div>
        <p>
          Input with Required validator: validation only executes when field is
          touched or dirty, you can also assign a validation change handler
        </p>
        <Input
          placeholder="Firstname"
          errors={{ required: 'This field is mandatory' }}
          onValidationChanged={logChange}
          validator={Validators.Required}
        ></Input>
      </div>
      <hr />
      <div>
        <p>Input with MinLength validator</p>
        <Input
          placeholder="How are you?"
          errors={{ minlength: 'You need to enter 3 characters minimum' }}
          validator={Validators.MinLength(3)}
        ></Input>
      </div>
      <hr />
      <div>
        <p>Support multiple validators: Mandatory number, with a minimum length of 3 characters</p>
        <Input
          onChange={logChange}
          label="Number"
          errors={{
            required: 'This field is mandatory',
            number: 'Should be a number',
            minlength: 'Please type at least 3 numbers'
          }}
          validator={[Validators.Required, Validators.Number, Validators.MinLength(3)]}
          placeholder="Age"
        ></Input>
      </div>
      <hr />
      <div>
        <p>Using pattern validator</p>
        <Input
          errors={{
            pattern: 'Should start with lorem'
          }}
          validator={[Validators.Pattern(/lorem.*/)]}
          placeholder="Magic word"
        ></Input>
      </div>
    </div>
  );
};

export const ChangeProgrammatically = () => (
  <div style={{ width: '50%' }}>
    <p>Manipulate programmatically: Use knobs</p>
    <Input
      placeholder="Firstname"
      value=""
      dirty={boolean('Dirty', false)}
      errors={{ required: 'This field is mandatory' }}
      validator={Validators.Required}
      aria-label="Field"
    ></Input>
  </div>
);

export default {
  title: 'Input',
  decorators: [withKnobs]
};
