import * as React from 'react';
import { components } from 'react-select';
import Icon from '../icon';

/**
 * Useful to stop propagating on mouse down events in custom renderers
 * This way Dropdown won't be opened with custom delete
 * @param e Propagated event
 */
const stopPropagation = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

/** The following components are defined to override
 * the appereace of the react-select library components **/

export const DefaultOptionRenderer = (props: any) => {
  const OptionRenderer = props?.selectProps?.optionRenderer;
  const rendererProps = {
    data: props.data,
    inputValue: props.selectProps?.inputValue,
  };
  return (
    <div>
      {OptionRenderer ? (
        <components.Option {...props}>
          <OptionRenderer {...rendererProps} />
        </components.Option>
      ) : (
        <components.Option {...props} />
      )}
    </div>
  );
};

// Specific Input to fix input not displayed in React-Select
// See https://github.com/JedWatson/react-select/issues/3068
// See https://github.com/JedWatson/react-select/discussions/4302
export const Input = (props: any) => {
  const inputAlwaysDisplayed = props?.selectProps?.inputAlwaysDisplayed;
  return inputAlwaysDisplayed ? <components.Input {...props} isHidden={false} /> : <components.Input {...props}/>
};

export const SingleValue = (props: any) => {
  const OptionRenderer = props.selectProps.optionRenderer;
  const rendererProps = { data: props.data };
  return (
    <div>
      {OptionRenderer ? (
        <components.SingleValue {...props}>
          <OptionRenderer {...rendererProps} />
        </components.SingleValue>
      ) : (
        <components.SingleValue {...props} />
      )}
    </div>
  );
};

export const DefaultTagRenderer = (props: any) => {
  const TagRender = props.selectProps?.tagRenderer;
  const rendererProps = { remove: props.removeProps.onClick, data: props.data };
  return (
    <div>
      {TagRender ? (
        <components.MultiValue {...props} className="tk-tag">
          <div onMouseDown={stopPropagation}>
            <TagRender {...rendererProps} />
          </div>
        </components.MultiValue>
      ) : (
        <components.MultiValue {...props}>
          <div onMouseDown={stopPropagation}>
            <span className="tk-pr-1">{props.data?.label}</span>
            <Icon
              iconName="cross"
              onClick={() => props.removeProps.onClick()}
            />
          </div>
        </components.MultiValue>
      )}
    </div>
  );
};

export const MultiValueContainerOverride = ({ children, ...props }: any) => {
  return (
    <components.MultiValueContainer {...props}>
      <div>{children}</div>
    </components.MultiValueContainer>
  );
};

export const MultiValueRemove = () => {
  return null;
};

/**
 * This component controls the behavior of the expandable arrow displayed on
 * the right side of the Dropdown component. 
 * 
 * Default:
 *    visible -> Simple select
 *    hidden -> Multiple Select (isMulti prop)
 * 
 * The displayArrowIndicator prop from the Dropdown can override it
 */
export const DropdownIndicator = (props: any) => {
  const {isMulti, displayArrowIndicator, menuIsOpen } = props?.selectProps;
  return (
    <div>
      {isMulti ? (
        <div>
          {displayArrowIndicator ? (
            <components.DropdownIndicator {...props} />
          ) : (
            <components.DropdownIndicator {...props} className="tk-d-none" />
          )}
        </div>
      ) : ( <div>
        {displayArrowIndicator ?
          <components.DropdownIndicator {...props}>
            <Icon
              iconName={menuIsOpen ? 'drop-up' : 'drop-down'}
              className="tk-select__single-value"
            ></Icon>
          </components.DropdownIndicator> : <components.DropdownIndicator {...props} className="tk-d-none" />}
      </div>
      )}
    </div>
  );
};

export const ClearIndicator = (props: any) => {
  return (
    <components.ClearIndicator {...props}>
      <Icon iconName="cross-round"></Icon>
    </components.ClearIndicator>
  );
};

export const Control = ({ children, ...props }: any) => {
  const iconName = props.selectProps.iconName;
  return (
    <div className="tk-input-group__header">
      {<label className="tk-label tk-mb-h">{props?.selectProps?.label}</label>}
      {iconName ? (
        <components.Control {...props} className="tk-input__container">
          <div className="tk-input__icon">
            <Icon iconName={iconName} tabIndex={0}></Icon>
          </div>
          {children}
        </components.Control>
      ) : (
        <components.Control {...props}>{children}</components.Control>
      )}
    </div>
  );
};

export const NoOptionsMessage = (props: any) => {
  const noOptionMessage = props.selectProps?.noOptionMessage;
  return (
    <div>
      {noOptionMessage ? (
        <components.NoOptionsMessage {...props}>
          <div>{noOptionMessage}</div>
        </components.NoOptionsMessage>
      ) : (
        <components.NoOptionsMessage {...props} />
      )}
    </div>
  );
};
