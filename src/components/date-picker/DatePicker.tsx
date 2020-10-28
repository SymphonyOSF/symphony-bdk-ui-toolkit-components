import PropTypes from 'prop-types';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import { usePopper } from 'react-popper';

import { CSSTransition } from 'react-transition-group';

import DayPicker, {
  DayModifiers,
  LocaleUtils,
  Modifier,
} from 'react-day-picker';

import 'react-day-picker/lib/style.css';

import TextField from '../input/TextField';
import Icon from '../icon/Icon';

import styled from 'styled-components';

import { PopperContainer, popperProps } from '../common/popperUtils';

import {
  formatDay,
  getMonths,
  getWeekdaysLong,
  getWeekdaysShort,
} from './utils/dateUtils';

import { matchDay } from './utils/matchDayUtils';

import {
  handleKeyDownCell,
  handleKeyDownIcon,
  handleKeyDownInput,
  handleKeyDownPicker,
} from './utils/keyUtils';

import { addLoopNavigation, removeTabIndex } from './utils/datePickerUtils';
import { modifierPropTypes } from './utils/propTypesUtils';

import { format as formatDate, isValid, parse } from 'date-fns';

import Header from './Header';

const DatePickerContainer = styled.div`
  z-index: 2;
  &.DatePickerContainer {
    ${PopperContainer}
  }
`;

type DatePickerComponentProps = {
  className?: string;
  date?: Date;
  disabledDays?: Modifier | Modifier[];
  disabled?: boolean;
  dir?: 'ltr' | 'rtl';
  format?: string;
  initialMonth?: Date;
  label?: string;
  labels?: {
    previousYear: string;
    nextYear: string;
    previousMonth: string;
    nextMonth: string;
  };
  name?: string;
  placeholder?: string;
  locale?: string;
  placement?: 'top' | 'bottom' | 'right' | 'left';
  todayButton?: string;
  tooltip?: string;
  showOverlay?: boolean;
  onBlur?: () => any;
  onChange?: (event) => any;
};

const DatePicker: FunctionComponent<DatePickerComponentProps> = ({
  date,
  disabledDays,
  disabled,
  dir = 'ltr',
  format = 'MM-dd-yyyy', // format is case sensitive, see https://date-fns.org/v2.16.1/docs/format
  initialMonth,
  label,
  labels = {
    previousYear: 'Previous Year',
    nextYear: 'Next Year',
    previousMonth: 'Previous Month',
    nextMonth: 'Next Month',
  },
  name,
  placeholder,
  locale = 'en-US',
  placement = 'bottom',
  todayButton = 'Today',
  tooltip,
  showOverlay,
  onBlur,
  onChange,
}) => {
  const [popperElement, setPopperElement] = useState(null);
  const [referenceElement, setReferenceElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: `${placement}-start` as
      | 'bottom-start'
      | 'top-start'
      | 'right-start'
      | 'left-start',
    modifiers: [
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['top-start', 'right-start', 'left-start'],
        },
      },
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
    ],
  });

  const computeDate = (date) => {
    if (isValid(date) && !matchDay(date, disabledDays)) {
      return date;
    } else {
      return null;
    }
  };

  const [selectedDate, setSelectedDate] = useState(computeDate(date));
  const [navigationDate, setNavigationDate] = useState(
    initialMonth || date || new Date()
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const getLocale: Locale = require(`date-fns/locale/${locale}/index.js`);

  const [showPicker, setShowPicker] = useState(showOverlay || false);

  const [divToFocus, setDivToFocus] = useState(null);

  const [inputValue, setInputValue] = useState(
    computeDate(date) ? formatDate(date, format, { locale: getLocale }) : null
  );

  const refContainer = useRef(null);
  const refPicker = useRef(null);
  const refIcon = useRef(null);

  useEffect(() => {
    // setTimeout force to wait for the react-day-picker to re-render
    setTimeout(() => {
      focusDiv(divToFocus);
    });
  }, [divToFocus]);

  const focusDiv = (divToFocus) => {
    if (refPicker.current) {
      if (divToFocus) {
        const dayNodes = refPicker.current.dayPicker.querySelectorAll(
          '.DayPicker-Day'
        );
        dayNodes[divToFocus.value - 1].focus();
      }
    }
  };

  function handleEventClickOutside(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowPicker(false);
        }
      }

      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref]);
  }

  const handleHeaderChange = (date) => {
    setNavigationDate(date);
  };

  const handleDayClick = (date: Date, modifiers: DayModifiers) => {
    if (modifiers.disabled) {
      return;
    }
    setSelectedDate(modifiers.selected ? undefined : date);
    setNavigationDate(modifiers.selected ? undefined : date);

    const inputValue = formatDate(date, format, { locale: getLocale });
    setInputValue(modifiers.selected ? undefined : inputValue);
    setShowPicker(false);
    if (onChange) {
      onChange({ target: { value: inputValue } });
    }
  };

  /** DayPicker adjustment */
  addLoopNavigation(
    refPicker,
    '.DayPicker-TodayButton',
    '.DayPicker-Caption--prevYear',
    '.DayPicker-Day:not(.DayPicker-Day--outside)'
  );

  removeTabIndex(refPicker, '.DayPicker-wrapper');

  /** `now` to handle locale dictionary (months, weekdaysLong, weekdaysShort attributes) */
  const now = new Date();
  const localeUtils = {
    ...LocaleUtils,
    formatDay: (d: Date) => formatDay(d, getLocale),
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    let newDate = parse(newValue, format, new Date(), { locale: getLocale });
    // If year not typed, take the current year
    if (!isValid(newDate)) {
      // regex: remove -yyyy, yyyy-, /yyyy, yyyy/, .yyyy, ...
      newDate = parse(
        newValue,
        format.replace(/[\W]?y{4}[\W]?/, ''),
        new Date(),
        {
          locale: getLocale,
        }
      );
    }

    if (isValid(newDate)) {
      setNavigationDate(newDate);
    }
    setSelectedDate(computeDate(newDate));

    if (onChange) {
      onChange(e);
    }
  };

  const handleClickIcon = () => {
    setShowPicker(!showPicker);
  };

  const textfieldProps = {
    disabled,
    label,
    name,
    placeholder: placeholder || format.toUpperCase(),
    tooltip,
  };

  handleEventClickOutside(refContainer);

  return (
    <div className={'tk-datepicker'} ref={refContainer}>
      <div ref={setReferenceElement}>
        <TextField
          {...textfieldProps}
          className={classNames({
            active: showPicker,
          })}
          iconElement={
            <Icon
              className={classNames('tk-input__icon', {
                active: showPicker,
              })}
              disabled={disabled}
              iconName={'calendar'}
              forwardRef={refIcon}
              tabIndex={0}
              onClick={() => handleClickIcon()}
              onKeyDown={(e) => handleKeyDownIcon(e, showPicker, refPicker)}
            ></Icon>
          }
          value={inputValue || ''}
          onChange={handleInputChange}
          onBlur={onBlur}
          onFocus={() => setShowPicker(true)}
          onKeyDown={(e) => handleKeyDownInput(e, setShowPicker)}
        ></TextField>
      </div>
      <CSSTransition
        {...popperProps}
        in={showPicker}
        classNames="DatePickerContainer"
      >
        <DatePickerContainer
          role="tooltip"
          ref={setPopperElement}
          style={{ ...styles.popper, direction: dir }}
          {...attributes.popper}
        >
          <DayPicker
            aria-labelledby={label}
            ref={refPicker}
            selectedDays={selectedDate}
            disabledDays={disabledDays}
            dir={dir}
            todayButton={todayButton}
            month={navigationDate}
            captionElement={({ date }) => (
              <Header
                date={date}
                dir={dir}
                months={getMonths(now, getLocale)}
                onChange={handleHeaderChange}
                labels={labels}
                parentRef={refPicker}
              />
            )}
            onKeyDown={(e) => handleKeyDownPicker(e, setShowPicker, refIcon)}
            onDayKeyDown={(day, modifiers, e) =>
              handleKeyDownCell(
                day,
                e,
                setNavigationDate,
                setDivToFocus,
                focusDiv,
                getLocale
              )
            }
            onDayClick={handleDayClick}
            onTodayButtonClick={handleDayClick}
            locale={locale}
            localeUtils={localeUtils}
            months={getMonths(now, getLocale)}
            weekdaysLong={getWeekdaysLong(now, getLocale)}
            weekdaysShort={getWeekdaysShort(now, getLocale)}
            fixedWeeks
          ></DayPicker>
        </DatePickerContainer>
      </CSSTransition>
    </div>
  );
};

DatePicker.propTypes = {
  className: PropTypes.string,
  date: PropTypes.instanceOf(Date),
  format: PropTypes.string,
  dir: PropTypes.oneOf(['ltr', 'rtl']),
  disabled: PropTypes.bool,
  disabledDays: PropTypes.oneOfType(modifierPropTypes),
  initialMonth: PropTypes.instanceOf(Date),
  label: PropTypes.string,
  labels: PropTypes.exact({
    previousYear: PropTypes.string,
    previousMonth: PropTypes.string,
    nextYear: PropTypes.string,
    nextMonth: PropTypes.string,
  }),
  locale: PropTypes.string,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  placement: PropTypes.oneOf(['top', 'bottom', 'right', 'left']),
  todayButton: PropTypes.string,
  tooltip: PropTypes.string,
  showOverlay: PropTypes.bool,
};

export default DatePicker;
