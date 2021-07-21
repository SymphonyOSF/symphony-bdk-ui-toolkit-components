import * as React from 'react';
import Select,{ ActionMeta, createFilter, MenuPlacement } from 'react-select';
import AsyncSelect from 'react-select/async';
import {
  ClearIndicator,
  Control,
  DefaultOptionRenderer,
  DefaultTagRenderer,
  DropdownIndicator,
  Input,
  MultiValueContainerOverride,
  SingleValue,
  NoOptionsMessage,
  DropdownList,
  LoadingMessage,
  firstOption
} from './CustomRender';
import {
  DropdownOption,
  LabelValue,
  OptionRendererProps,
  SearchHeaderOption,
  TagRendererProps,
} from './interfaces';
import { HasValidationProps } from '../validation/interfaces';
import { HasTooltipProps } from '../tooltip/interfaces';
import LabelTooltipDecorator from '../label-tooltip-decorator/LabelTooltipDecorator';

// css baseclass prefix
const prefix = 'tk-select';

export type DropdownProps<T> = {
  /** Allows to scroll automatically to selected option */
  autoScrollToCurrent?: boolean;
  /** Path in custom object to the unique identifier of the option */
  bindValue?: string;
  /** Blur the field when an item is selected */
  blurInputOnSelect?: boolean;
  /** Optional CSS class name for the dropdown container */
  className?: string;
  /** Close the expanded menu when the user selects an option */
  closeMenuOnSelect?: boolean;
  /** Enables the indicator to expand the Dropdown */
  displayArrowIndicator?: boolean;
  /** Display a fixed option on the header of the Dropdown with the searched term */
  enableTermSearch?: boolean;
  /** Decides if an item with data and current input value should be displayed in dropdown menu or not */
  filterFunction?: (data: T, inputValue: string) => boolean;
  /** Hide the selected option from the list */
  hideSelectedOptions?: boolean;
  /** If provided, it renders an icon on the left side of the dropdown input*/
  iconName?: string;
  id?: string;
  /** If provided, it decides if the input should always be displayed even if the option is selected*/
  inputAlwaysDisplayed?: boolean;
  /** The value of the search input */
  inputValue?: string;
  /** Is the select value clearable */
  isInputClearable?: boolean;
  /** If false, user can not type on the control Input */
  isTypeAheadEnabled?: boolean;
  /** Decides if an item with data and current input value should be disabled in dropdown menu or not */
  isOptionDisabled?: (data: T) => boolean;
  /** Decides if an item with data and current input value should be selected in dropdown menu or not */
  isOptionSelected?: (data: T) => boolean;
  /** Is the dropdown disabled */
  isDisabled?: boolean;
  /** Label text for the dropdown */
  label?: string;
  /** Maximum height of the menu before scrolling */
  maxMenuHeight?: number;
  /** Max height of the select input before scrolling */
  maxHeight?: number;
  /** Whether the Dropdown menu is expanded */
  menuIsOpen?: boolean;
  /** Placement of the menu in relation to the control */
  menuPlacement?: MenuPlacement;
  /** Whether the Dropdown menu should scroll into view when pressed */
  menuShouldScrollIntoView?: boolean;
  /** Styling options depending on the need */
  mode?: 'nested' | 'aligned';
  name?: string;
  /** Mesage to display if there isn't any match in the search input */
  noOptionMessage?: string;
  /** Placeholder text for the dropdown */
  placeHolder?: string;
  /** Custom component used to override the default appearance of the list items. */
  optionRenderer?:
    | React.Component<OptionRendererProps<T>, any>
    | React.FunctionComponent<OptionRendererProps<T>>;
  /** Handle blur events on the control */
  onBlur?: (e) => any;
  /** Handle key down events on the select */
  onKeyDown?: (event) => any;
  /** Handle key up events on the select */
  onKeyUp?: (event) => any;
  /** Handle change events on the input */
  onInputChange?: (string, any) => any;
  /** Handle clear event */
  onClear?: () => any;
  /** Handle focus event */
  onFocus?: (event) => any;
  /** Handle the menu opening */
  onMenuOpen?: () => void;
  /** Handle the menu closing */
  onMenuClose?: () => void;
  /** Handle the selection of search by term option */
  onTermSearch?: (option: SearchHeaderOption) => any;
  /** Flag to show the label with a specific styling if the field is required */
  showRequired?: boolean;
  /** Select the currently focused option when the user presses tab */
  tabSelectsValue?: boolean;
  /** Custom component used to override the default appearance of the dropdown select input item/s */
  tagRenderer?:
    | React.Component<TagRendererProps<T>, any>
    | React.FunctionComponent<TagRendererProps<T>>;
  /** Message to be display on the header of the menu list when searching by term */
  termSearchMessage?: ((term: string) => string) | string;
} &
  HasTooltipProps &
  (MultiModeProps<T> | SingleModeProps<T>) &
  (AsyncProps<T> | SyncProps<T>);

type MultiModeProps<T> = {
  /** Support multiple selected options */
  isMultiSelect: true;
  defaultValue?: T[];
  value?: T[];
} & HasValidationProps<T[]>;

type SingleModeProps<T> = {
  isMultiSelect: false;
  /** Default value selected on the Dropdown */
  defaultValue?: T;
  /** Allows the usage of the component in controlled value mode */
  value?: T;
} & HasValidationProps<T>;

type AsyncProps<T> = {
  options?: undefined;
  /** Load the options that populate the dropdown from a returned promise */
  asyncOptions: (inputValue: string) =>Promise<DropdownOption<T>[]>;
  /**
   * The default set of options to show before the user starts searching. When
   * set to `true`, the results for asyncOptions('') will be autoloaded.
   */
  defaultOptions?:  DropdownOption<T>[] | boolean;
} & HasValidationProps<T>;
type SyncProps<T> = {
  /** Array of options that populate the dropdown menu */
  options: DropdownOption<T>[];
  asyncOptions?: undefined;
  defaultOptions?: undefined;
} & HasValidationProps<T>;

type DropdownState<T> = {
  selectedOption: T;
  closeMenuOnSelect?: boolean;
  hideSelectedOptions?: boolean;
  displayArrowIndicator?: boolean;
  DropdownTag: Select | any;
};
export class Dropdown<T = LabelValue> extends React.Component<
  DropdownProps<T>,
  DropdownState<T>
> {
  myRef: any;
  searchHeaderOption: any;
  lastSelectedOption: any;
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.searchHeaderOption = { ...firstOption };
    this.state = {
      DropdownTag: this.props.options ? Select : AsyncSelect,
      selectedOption: null,
      hideSelectedOptions:
        this.props.hideSelectedOptions === undefined
          ? this.props?.isMultiSelect
          : this.props.hideSelectedOptions,
      closeMenuOnSelect:
        this.props.closeMenuOnSelect === undefined
          ? !this.props?.isMultiSelect
          : this.props.closeMenuOnSelect,
      displayArrowIndicator:
        this.props.displayArrowIndicator === undefined
          ? !this.props?.isMultiSelect
          : this.props.displayArrowIndicator,
    };
  }

  componentDidMount() {
    const { onInit, value } = this.props;
    if (onInit && value) {
      onInit(value as any);
    }
  }

  handleChange = (selectedOption, meta: ActionMeta<T>) => {
    const isClearingTermSearch =
      this.lastSelectedOption === this.searchHeaderOption && !selectedOption;
    this.lastSelectedOption = selectedOption;
    if (
      this.props.onChange &&
      !selectedOption?.searchHeader &&
      !isClearingTermSearch
    ) {
      this.props.onChange({ target: { value: selectedOption } });
    }
    if (this.props.onTermSearch && selectedOption?.searchHeader) {
      this.props.onTermSearch(selectedOption);
    }
    if (meta.action === 'clear' && this.props.onClear) {
      this.props.onClear();
    }
  };

  handleBlur = () => {
    const { value } = this.props;
    if (this.props.onBlur) {
      this.props.onBlur({ target: { value: value as any } });
    }
  };

  private internalFiltering = this.props.filterFunction
    ? (o, input) => this.props.filterFunction(o.data, input)
    : createFilter(null);

  private filter = (o, input) => {
    return o.data.searchHeader || this.internalFiltering(o, input);
  };

  handleIsOptionDisabled = this.props.isOptionDisabled
    ? (option: any) => this.props.isOptionDisabled(option.data)
    : undefined;

  handleIsOptionSelected = this.props.isOptionSelected
    ? (option: any) => this.props.isOptionSelected(option.data)
    :  (option: DropdownOption<T>, selectValue: any) => selectValue?.some(i => i === option);

  get internalOptions() {
    if (this.props?.options) {
      return this.props.enableTermSearch
        ? [this.searchHeaderOption as T, ...this.props.options]
        : this.props.options;
    }
  }
  
  internalAsyncOptions = async (inputValue:string) => {
    return this.props?.asyncOptions(inputValue)
      .then(options => new Promise(resolve => 
        resolve(this.props.enableTermSearch ?
          [this.searchHeaderOption as T, ...options] 
          : options))
      )
  }
  
  bindValue = this.props.bindValue
    ? (option) => option[this.props.bindValue]
    : undefined;

  render() {
    const {
      hideSelectedOptions,
      closeMenuOnSelect,
      displayArrowIndicator,
      DropdownTag,
    } = this.state;
    const {
      autoScrollToCurrent,
      blurInputOnSelect,
      className,
      defaultValue,
      enableTermSearch,
      iconName,
      id,
      inputAlwaysDisplayed,
      inputValue,
      isDisabled,
      isInputClearable,
      isMultiSelect,
      isTypeAheadEnabled,
      label,
      maxHeight,
      maxMenuHeight,
      menuIsOpen,
      mode,
      name,
      noOptionMessage,
      placeHolder,
      onFocus,
      onInputChange,
      onKeyDown,
      onKeyUp,
      onMenuOpen,
      onMenuClose,
      optionRenderer,
      tagRenderer,
      tooltip,
      tooltipCloseLabel,
      showRequired,
      tabSelectsValue,
      termSearchMessage,
      value,
      defaultOptions,
      menuPlacement,
      menuShouldScrollIntoView,
      ...otherProps
    } = this.props;

    return (
      <div className={className}>
        <LabelTooltipDecorator
          htmlFor={id}
          label={label}
          placement={'top'}
          tooltip={tooltip}
          tooltipCloseLabel={tooltipCloseLabel}
          showRequired={showRequired}
        />
        <DropdownTag
          {...otherProps}
          styles={{
            valueContainer: provided => ({
              ...provided,  maxHeight:`${maxHeight}px`})
          }}
          parentInstance={this}
          ref={this.myRef}
          selectRef={this.myRef}
          displayArrowIndicator={displayArrowIndicator}
          optionRenderer={optionRenderer}
          tagRenderer={tagRenderer}
          isClearable={isInputClearable}
          components={{
            DropdownIndicator,
            Control,
            SingleValue,
            Input,
            Option: DefaultOptionRenderer,
            MultiValueContainer: MultiValueContainerOverride,
            MultiValue: DefaultTagRenderer,
            ClearIndicator,
            MultiValueRemove: () => null,
            NoOptionsMessage,
            MenuList: DropdownList,
            LoadingIndicator: () => null,
            LoadingMessage
          }}
          defaultValue={defaultValue}
          id={id}
          name={name}
          className={prefix}
          closeMenuOnSelect={closeMenuOnSelect}
          classNamePrefix={prefix}
          value={value}
          inputValue={inputValue}
          inputAlwaysDisplayed={inputAlwaysDisplayed}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onFocus={onFocus}
          onInputChange={onInputChange}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          options={this.internalOptions}
          loadOptions={this.internalAsyncOptions}
          defaultOptions={defaultOptions !== undefined ? defaultOptions : true}
          hideSelectedOptions={hideSelectedOptions}
          placeholder={placeHolder}
          isMulti={isMultiSelect}
          isDisabled={isDisabled}
          iconName={iconName}
          noOptionMessage={noOptionMessage}
          filterOption={this.filter}
          isSearchable={isTypeAheadEnabled}
          isOptionDisabled={this.handleIsOptionDisabled}
          isOptionSelected={this.handleIsOptionSelected}
          menuPlacement={menuPlacement}
          maxMenuHeight={maxMenuHeight}
          mode={mode ? mode : 'aligned'}
          autoScrollToCurrent={autoScrollToCurrent}
          menuIsOpen={menuIsOpen}
          onMenuOpen={onMenuOpen}
          onMenuClose={onMenuClose}
          tabSelectsValue={tabSelectsValue}
          enableTermSearch={enableTermSearch}
          termSearchMessage={termSearchMessage}
          getOptionValue={this.bindValue}
          blurInputOnSelect={blurInputOnSelect}
          menuShouldScrollIntoView={menuShouldScrollIntoView}
        />
      </div>
    );
  }

  static defaultProps = {
    isDisabled: false,
    isMultiSelect: false,
    isInputClearable: false,
    isTypeAheadEnabled: true,
    autoScrollToCurrent: false,
    enableTermSearch: false,
    menuShouldScrollIntoView: true,
    menuPlacement: 'auto'
  };
}

export default Dropdown;
