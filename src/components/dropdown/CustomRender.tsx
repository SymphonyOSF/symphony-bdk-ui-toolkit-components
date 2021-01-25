import Icon from '../icon';
import * as React from 'react';
import  { components } from 'react-select';
import * as PropTypes from 'prop-types';
import { CustomRenderProps, SelectOptions } from './Dropdown';


/** The following components are defined to customize 
 * the appereace of the react-select library components **/

export const Option = props => {
  const OptionRender = props?.selectProps?.optionRenderer;
  return (<div> {OptionRender ?
    <components.Option {...props} >
      <OptionRender {...props} />
    </components.Option> : <components.Option {...props} />}</div>
  );
};

Option.propTypes = {
  selectProps: PropTypes.object
}

export const SingleValue = props => {
  const ValueRender = props.selectProps.optionRenderer;
  return (<div> {ValueRender ?
    <components.SingleValue {...props}>
      <ValueRender {...props} />
    </components.SingleValue> : <components.SingleValue {...props} />}</div>
  );
};

SingleValue.propTypes = {
  selectProps: PropTypes.object
}

export const MultiValue = props => {
  const ValueRender = props.selectProps.optionRenderer;
  return (<div> {ValueRender ?
    <components.MultiValue {...props}>
      <ValueRender {...props} />
    </components.MultiValue>
    : <components.MultiValue {...props} />}</div>)
}

MultiValue.propTypes = {
  selectProps: PropTypes.object
}

export const MultiValueRemove = props => {
  const TagRemove = props.selectProps.tagRemoveRenderer;
  return (<div className="tk-d-flex"> {(TagRemove ?
    <div className="tk-d-flex tk-tag-remove">
      <components.MultiValueRemove {...props} >
        <TagRemove {...props} className="tk-tag-remove"/>
      </components.MultiValueRemove> </div> :
    <components.MultiValueRemove {...props}>
      <Icon iconName="cross" />
    </components.MultiValueRemove>)}</div>
  );
};

MultiValueRemove.propTypes = {
  selectProps: PropTypes.object
}

export const DropdownIndicator = props => {
  return (<div>{props?.selectProps?.isMulti ?
    (<div>{props?.selectProps?.isMulti && props?.selectProps?.displayArrowIndicator ?
      <components.DropdownIndicator {...props} /> : <components.DropdownIndicator {...props} className="tk-d-none" />}</div>) :
    <components.DropdownIndicator {...props}>
      <Icon iconName={props?.selectProps.menuIsOpen ? 'drop-up' : 'drop-down'} className="tk-select__single-value"></Icon>
    </components.DropdownIndicator>}</div>
  );
};

DropdownIndicator.propTypes = {
  selectProps: PropTypes.object
}

export const Control = ({ children, ...props }) => {

  const iconName = props.selectProps.iconName;
  console.log('im here', children);
  return (<div className="tk-input-group__header">
    {<label className="tk-label tk-mb-h">{props?.selectProps?.label}</label>}
    {iconName ?
      <components.Control {...props} className="tk-input__container">
        <div className="tk-input__icon">
          <Icon
            iconName={iconName}
            tabIndex={0}
          ></Icon>
        </div>
        {children}
      </components.Control> :  <components.Control {...props}>{children}</components.Control>}

  </div>
  );
}

Control.propTypes = {
  selectProps: PropTypes.object,
  children: PropTypes.element
}

export const customRenderOptions = [
  { value: '1', label: 'app' },
  { value: '2', label: 'bot' },
  { value: '9', label: 'hide' },
  { value: '10', label: 'link' },
  { value: '3', label: 'adjust' },
  { value: '4', label: 'archive' },
  { value: '5', label: 'cashtag' },
  { value: '6', label: 'emoticon' },
  { value: '7', label: 'following' },
  { value: '8', label: 'flags' }
];

export const IconPicker = (props: CustomRenderProps<SelectOptions>) => {
  return (
    <div>
      {props.data.label}
      <Icon className="tk-pl-1" iconName={props.data.label} />
    </div>
  );
};

IconPicker.propTypes = {
  data: PropTypes.object
}