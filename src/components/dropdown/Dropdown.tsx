import * as React from 'react';
import Select, { ActionMeta, createFilter } from 'react-select';
import {
  ClearIndicator,
  Control,
  DefaultOptionRenderer,
  DefaultTagRenderer,
  DropdownIndicator,
  Input,
  MultiValueContainerOverride,
  MultiValueRemove,
  SingleValue,
  NoOptionsMessage,
  DropdownList,
  firstOption,
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
  /** Array of options that populate the dropdown menu */
  options: DropdownOption<T>[];
  /** Custom component used to override the default appearance of the list items. */
  optionRenderer?:
    | React.Component<OptionRendererProps<T>, any>
    | React.FunctionComponent<OptionRendererProps<T>>;
  /** Custom component used to override the default appearance of the dropdown select input item/s */
  tagRenderer?:
    | React.Component<TagRendererProps<T>, any>
    | React.FunctionComponent<TagRendererProps<T>>;
  /** Handle blur events on the control */
  onBlur?: (e) => any;
  /** Decides if an item with data and current input value should be displayed in dropdown menu or not */
  filterFunction?: (data: T, inputValue: string) => boolean;
  /** Decides if an item with data and current input value should be disabled in dropdown menu or not */
  isOptionDisabled?: (data: T) => boolean;
  /** Decides if an item with data and current input value should be selected in dropdown menu or not */
  isOptionSelected?: (data: T) => boolean;
  /** If provided, it renders an icon on the left side of the dropdown input*/
  iconName?: string;
  /** If provided, it decides if the input should always be displayed even if the option is selected*/
  inputAlwaysDisplayed?: boolean;
  /** Mesage to display if there isn't any match in the search input */
  noOptionMessage?: string;
  /** Is the dropdown disabled */
  isDisabled?: boolean;
  /** Placeholder text for the dropdown */
  placeHolder?: string;
  /** Label text for the dropdown */
  label?: string;
  /** If false, user can not type on the control Input */
  isTypeAheadEnabled?: boolean;
  /** Enables the indicator to expand the Dropdown */
  displayArrowIndicator?: boolean;
  /** Default value selected on the Dropdown */
  id?: string;
  name?: string;
  /** Optional CSS class name */
  className?: string;
  /** Close the expanded menu when the user selects an option */
  closeMenuOnSelect?: boolean;
  /** Hide the selected option from the list */
  hideSelectedOptions?: boolean;
  /** Is the select value clearable */
  isInputClearable?: boolean;
  /** The value of the search input */
  inputValue?: string;
  /** Maximum height of the menu before scrolling */
  maxMenuHeight?: number;
  /** Allows to scroll automatically to selected option */
  autoScrollToCurrent?: boolean;
  /** Handle key down events on the select */
  onKeyDown?: (event) => any;
  /** Handle key up events on the select */
  onKeyUp?: (event) => any;
  /** Handle change events on the input */
  onInputChange?: (string, any) => any;
  /** Whether the Dropdown menu is expanded */
  menuIsOpen?: boolean;
  /** Handle focus events */
  onFocus?: (event) => any;
  /** Handle the menu opening */
  onMenuOpen?: () => void;
  /** Handle the menu closing */
  onMenuClose?: () => void;
  /** Select the currently focused option when the user presses tab */
  tabSelectsValue?: boolean;
  /** Display a fixed option on the header of the Dropdown with the searched term */
  enableTermSearch?: boolean;
  /** Message to be display on the header of the menu list when searching by term */
  termSearchMessage?: ((term: string) => string) | string;
  /** Handle the selection of search by term option */
  onTermSearch?: (option: SearchHeaderOption) => any;
  onClear?: () => any;
  blurInputOnSelect?: boolean;
  /** Path in custom object to the unique identifier of the option */
  bindValue?: string;
  /** Flag to show the label with a specific styling if the field is required */
  showRequired?: boolean;
} & HasTooltipProps &
  (MultiModeProps<T> | SingleModeProps<T>);

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

type DropdownState<T> = {
  selectedOption: T;
  closeMenuOnSelect?: boolean;
  hideSelectedOptions?: boolean;
  displayArrowIndicator?: boolean;
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
    : undefined;

  get internalOptions() {
    return this.props.enableTermSearch
      ? [this.searchHeaderOption as T, ...this.props.options]
      : this.props.options;
  }

  bindValue = this.props.bindValue
    ? (option) => option[this.props.bindValue]
    : undefined;

  render() {
    const {
      hideSelectedOptions,
      closeMenuOnSelect,
      displayArrowIndicator,
    } = this.state;
    const {
      isMultiSelect,
      isDisabled,
      placeHolder,
      id,
      name,
      defaultValue,
      onFocus,
      onInputChange,
      onKeyDown,
      onKeyUp,
      isInputClearable,
      label,
      optionRenderer,
      iconName,
      inputAlwaysDisplayed,
      tagRenderer,
      value,
      inputValue,
      noOptionMessage,
      isTypeAheadEnabled,
      autoScrollToCurrent,
      maxMenuHeight,
      menuIsOpen,
      tooltip,
      tooltipCloseLabel,
      onMenuOpen,
      onMenuClose,
      tabSelectsValue,
      enableTermSearch,
      termSearchMessage,
      blurInputOnSelect,
      showRequired
    } = this.props;

    return (
      <div>
        <LabelTooltipDecorator
          id={id}
          label={label}
          placement={'top'}
          tooltip={tooltip}
          tooltipCloseLabel={tooltipCloseLabel}
          showRequired={showRequired}
        />
        <Select
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
            MultiValueRemove,
            NoOptionsMessage,
            MenuList: DropdownList,
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
          menuPlacement="auto"
          maxMenuHeight={maxMenuHeight}
          autoScrollToCurrent={autoScrollToCurrent}
          menuIsOpen={menuIsOpen}
          onMenuOpen={onMenuOpen}
          onMenuClose={onMenuClose}
          tabSelectsValue={tabSelectsValue}
          enableTermSearch={enableTermSearch}
          termSearchMessage={termSearchMessage}
          getOptionValue={this.bindValue}
          blurInputOnSelect={blurInputOnSelect}
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
  };
}

export default Dropdown;
