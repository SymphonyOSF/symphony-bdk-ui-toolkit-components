import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, waitForElementToBeRemoved, fireEvent } from '@testing-library/react';
import Dropdown, { DropdownOption, LabelValue } from '../../../src/components/dropdown';
import '@testing-library/jest-dom/extend-expect';
import { Button, Validation } from '../../../src/components';
import { Validators } from '../../../src/core/validators/validators';
import { Keys } from '../../../src/components/common/keyUtils';

const CustomComponent = (props) => {
  if (props.data) {
    return (<div>{props?.data?.label}</div>);
  }
}
const filterFunction = (element: any, input: string) => {
  return !input || element.displayName.indexOf(input) > -1;
};

const onChange = jest.fn();
const onTermSearch = jest.fn();
const onClear = jest.fn();
const onBlur = jest.fn();
const optionDisabled = jest.fn();
const optionSelected = jest.fn();

const options = [{ label: 'banana' }, { label: 'avocado' }, { label: 'orange' }]

describe('Dropdown component test suite =>', () => {
  const dropdownProps = {
    options: [],
    id: 'testId'
  };

  describe('when options are Sync', () => {
    beforeEach(() => {
      dropdownProps.options = options;
    });

    describe('when is simple Dropdown', () => {
      it('should render the Dropdown component by default', async () => {
        const { getByText } = render(<Dropdown options={dropdownProps.options} />);
        expect(getByText('Select...')).toBeInTheDocument();

      });

      it('should render the Dropdown component by default', async () => {
        const timeZoneOptions: DropdownOption<LabelValue>[] = [
          { label: '(GMT +03:00) Tanzania', value: '8' },
          { label: '(GMT +03:00) Uganda', value: '9' },
          {
            label: 'United states of America (USA)',
            options: [
              { label: '(GMT -04:00) United states of America (USA) - New York', value: '1' },
              { label: '(GMT -04:00) United states of America (USA) - Detroit', value: '2' },
              { label: '(GMT -04:00) United states of America (USA) - Menominee', value: '3' },
              { label: '(GMT -05:00) United states of America (USA) - Center', value: '4' },
            ]
          }
        ];
        render(<Dropdown options={timeZoneOptions} mode="nested" />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        const nestedItem = screen.getByText('(GMT -04:00) United states of America (USA) - New York');
        expect(nestedItem.classList.contains('tk-select__option--nested')).toBeTruthy();
      });

      it('should show/hide options menu', async () => {
        const { getByText } = render(<Dropdown options={dropdownProps.options} hideSelectedOptions closeMenuOnSelect enableTermSearch />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        expect(getByText('banana')).toBeTruthy();
        expect(getByText('avocado')).toBeTruthy();
        expect(getByText('orange')).toBeTruthy();

      });

      it('should select first option', async () => {
        const { getByText } = render(<Dropdown options={dropdownProps.options} noOptionMessage="no options message" />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        const option = screen.getByText('banana');
        userEvent.click(option);
        expect(getByText('banana')).toBeTruthy();
        userEvent.type(input, 'zz');
        expect(screen.getByText('no options message')).toBeTruthy();
      });

      it('should render costum render dropdown', async () => {
        const { container, getByText } = render(
          <Dropdown
            isMultiSelect
            options={dropdownProps.options}
            optionRenderer={CustomComponent}
            displayArrowIndicator
            tagRenderer={CustomComponent}
            isInputClearable
            onChange={onChange}
            onClear={onClear}
          />
        );
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        const option = screen.getByText('banana');
        userEvent.click(option);
        expect(getByText('banana')).toBeTruthy();
        const cross = container.querySelector('i')
        userEvent.click(cross);
        expect(onClear).toBeCalled();
        expect(getByText('Select...')).toBeTruthy();
      });
    });

    describe('when is Multiselect', () => {

      it('should render the Multiselect component by default', async () => {
        const { getByText } = render(<Dropdown options={dropdownProps.options} isMultiSelect />);
        expect(getByText('Select...')).toBeInTheDocument();
      });

      it('should show/hide options menu', async () => {
        const { getByText } = render(<Dropdown options={dropdownProps.options} isMultiSelect filterFunction={filterFunction} />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        expect(getByText('banana')).toBeTruthy();
        expect(getByText('avocado')).toBeTruthy();
        expect(getByText('orange')).toBeTruthy();
      });

      it('should select first option', async () => {
        const { getByText } = render(<Dropdown options={dropdownProps.options} isMultiSelect />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        const option = screen.getByText('banana');
        userEvent.click(option);
        expect(getByText('banana')).toBeTruthy();
      });

      it('should clean selection', () => {
        const { getByText, container } = render(<Dropdown options={dropdownProps.options} isMultiSelect />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        const option = screen.getByText('banana');
        userEvent.click(option);
        const cross = container.querySelector('i')
        userEvent.click(cross);
        expect(getByText('Select...')).toBeTruthy();
      });

      it('should render custom render dropdown', async () => {
        const { getByText } = render(
          <Dropdown
            isMultiSelect
            options={dropdownProps.options}
            optionRenderer={CustomComponent}
            displayArrowIndicator
            tagRenderer={CustomComponent}
          />
        );
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        const option = screen.getByText('banana');
        userEvent.click(option);
        expect(getByText('banana')).toBeTruthy();
      });
    });

    describe('when search by term is enabled', () => {
      it('should render the header option when user starts typing', async () => {
        const { queryByText } = render(
          <Dropdown
            options={dropdownProps.options}
            displayArrowIndicator
            enableTermSearch
            termSearchMessage="Search for term"
          />
        );
        const input = screen.getByRole('textbox');
        userEvent.type(input, 'B');
        expect(queryByText(/Search for term/)).toBeInTheDocument();
      });

      describe('when focusing on the dropdown list', () => {
        it('should focus on the first option (skiping the headerOption) when there is a value on the input', async () => {
          const { getByText } = render(
            <Dropdown
              options={dropdownProps.options}
              displayArrowIndicator
              enableTermSearch
            />
          );
          const input = screen.getByRole('textbox');
          userEvent.type(input, 'B');
          expect(getByText('banana').className).toContain('tk-select__option--is-focused');
        });

        it('should focus on the first option (skiping the headerOption) when the user presses the `home` key', async () => {
          const { getByText } = render(
            <Dropdown
              options={dropdownProps.options}
              displayArrowIndicator
              enableTermSearch
            />
          );
          const input = screen.getByRole('textbox');
          userEvent.click(input);
          fireEvent.keyDown(input, { key: Keys.ARROW_DOWN });
          expect(getByText('avocado').className).toContain('tk-select__option--is-focused');
          fireEvent.keyDown(input, { key: Keys.HOME });
          expect(getByText('banana').className).toContain('tk-select__option--is-focused');
        });
      });

      it('should select option header', async () => {
        const searchedTerm = 'BBBmous';
        const { getByText, queryByText } = render(
          <Dropdown
            isOptionDisabled={optionDisabled}
            isOptionSelected={optionSelected}
            bindValue={'bindValue'}
            options={dropdownProps.options}
            displayArrowIndicator
            enableTermSearch
            onTermSearch={onTermSearch}
            onBlur={onBlur}
          />
        );
        const input = screen.getByRole('textbox');
        fireEvent.blur(input);
        expect(onBlur).toBeCalled();
        userEvent.type(input, searchedTerm);
        fireEvent.mouseDown(input);
        //Select header option
        fireEvent.click(queryByText(/Search for term/));
        expect(getByText(searchedTerm)).toBeInTheDocument();
      });
    });

    describe('when is with Validation Component', () => {
      it('should be triggered on Blur and on Change', async () => {
        const { getByText } = render(<>
          <Button>Outside target</Button>
          <Validation
            validator={[Validators.Required]}
            errorMessage={{ required: 'This field is required' }}>
            <Dropdown
              isMultiSelect
              options={dropdownProps.options}
              optionRenderer={CustomComponent}
              displayArrowIndicator
              tagRenderer={CustomComponent}
            />
          </Validation>
        </>
        );
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        // on Blur
        const button = screen.getByRole('button');
        userEvent.click(button);
        await waitFor(() => expect(getByText('This field is required')).toBeTruthy())

        // on Change
        userEvent.click(input);
        const option = screen.getByText('banana');
        userEvent.click(option);
        expect(getByText('banana')).toBeTruthy();
        waitForElementToBeRemoved(() => getByText('This field is required'));
      });
    });
  });


  describe('when options are Async', () => {

    describe('when is simple Dropdown', () => {
      it('should render the Dropdown component by default', async () => {
        const { getByText } = render(<Dropdown asyncOptions={() => Promise.resolve(options)} defaultOptions />);
        expect(getByText('Select...')).toBeInTheDocument();
      });
      it('should render the `asyncOptions` to the dropdown menu', async () => {
        const { getByText } = render(<Dropdown asyncOptions={() => Promise.resolve(options)} defaultOptions />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        await waitFor(async () => {
          expect(getByText('banana')).toBeTruthy();
          expect(getByText('avocado')).toBeTruthy();
          expect(getByText('orange')).toBeTruthy();
        })
      });
      it('should filter the `asyncOptions` if user types on the input', async () => {
        const { queryByText } = render(<Dropdown asyncOptions={() => Promise.resolve(options)} />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        await waitFor(async () => {
          expect(queryByText('banana')).toBeTruthy();
          expect(queryByText('avocado')).toBeTruthy();
          expect(queryByText('orange')).toBeTruthy();
        })
        userEvent.type(input, 'ban');
        await waitFor(async () => {
          expect(queryByText('banana')).toBeTruthy();
          expect(queryByText('avocado')).toBeFalsy();
          expect(queryByText('orange')).toBeFalsy();
        })
      });
      describe('when `defaultOptions` is provided with a different list', () => {
        it('should render different default options to the dropdown menu', async () => {
          const { getByText } = render(<Dropdown asyncOptions={() => Promise.resolve(options)} defaultOptions={[{ label: 'salmon' }]} />);
          const input = screen.getByRole('textbox');
          userEvent.click(input);
          expect(getByText('salmon')).toBeTruthy();
        });
        it('should filter the options if user types on the input', async () => {
          const { getByText, queryByText } = render(<Dropdown asyncOptions={() => Promise.resolve(options)} defaultOptions={[{ label: 'salmon' }]} />);
          const input = screen.getByRole('textbox');
          userEvent.click(input);
          expect(getByText('salmon')).toBeTruthy();
          userEvent.type(input, 'ban');
          await waitFor(async () => {
            expect(queryByText('banana')).toBeTruthy();
            expect(queryByText('avocado')).toBeFalsy();
            expect(queryByText('orange')).toBeFalsy();
          })
        });
      });


      it('should render the Dropdown component by default', async () => {
        render(<Dropdown asyncOptions={() => Promise.resolve(options)} mode="nested" defaultOptions />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        await waitFor(async () => {
          const nestedItem = screen.getByText('banana');
          expect(nestedItem.classList.contains('tk-select__option--nested')).toBeTruthy();
        })

      });

      it('should show/hide options menu', async () => {
        const { getByText } = render(<Dropdown asyncOptions={() => Promise.resolve(options)} hideSelectedOptions closeMenuOnSelect enableTermSearch defaultOptions />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        await waitFor(async () => {
          expect(getByText('banana')).toBeTruthy();
          expect(getByText('avocado')).toBeTruthy();
          expect(getByText('orange')).toBeTruthy();
        })

      });

      it('should select first option', async () => {
        const { getByText } = render(<Dropdown asyncOptions={() => Promise.resolve(options)} noOptionMessage="no options message" />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        await waitFor(async () => {
          const option = screen.getByText('banana');
          userEvent.click(option);
          expect(getByText('banana')).toBeTruthy();
        })
        userEvent.type(input, 'zz');
        await waitFor(async () => {
          expect(screen.getByText('no options message')).toBeTruthy();
        })
      });

      it('should render costum render dropdown', async () => {
        const { container, getByText } = render(
          <Dropdown
            isMultiSelect
            asyncOptions={() => Promise.resolve(options)}
            optionRenderer={CustomComponent}
            displayArrowIndicator
            tagRenderer={CustomComponent}
            isInputClearable
            onChange={onChange}
            onClear={onClear}
          />
        );
        await waitFor(async () => {
          const input = screen.getByRole('textbox');
          userEvent.click(input);
        })
        const option = screen.getByText('banana');
        userEvent.click(option);
        expect(getByText('banana')).toBeTruthy();
        const cross = container.querySelector('i')
        userEvent.click(cross);
        expect(onClear).toBeCalled();
        expect(getByText('Select...')).toBeTruthy();
      });
    });

    describe('when is Multiselect', () => {

      it('should render the Multiselect component by default', async () => {
        const { getByText } = render(<Dropdown asyncOptions={() => Promise.resolve(options)} isMultiSelect />);
        expect(getByText('Select...')).toBeInTheDocument();
      });

      it('should show/hide options menu', async () => {
        const { getByText } = render(<Dropdown asyncOptions={() => Promise.resolve(options)} isMultiSelect filterFunction={filterFunction} />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        await waitFor(async () => {
          expect(getByText('banana')).toBeTruthy();
          expect(getByText('avocado')).toBeTruthy();
          expect(getByText('orange')).toBeTruthy();
        })
      });

      it('should select first option', async () => {
        const { getByText } = render(<Dropdown asyncOptions={() => Promise.resolve(options)} isMultiSelect />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        await waitFor(async () => {
          const option = screen.getByText('banana');
          userEvent.click(option);
          expect(getByText('banana')).toBeTruthy();
        })
      });

      it('should clean selection', async () => {
        const { getByText, container } = render(<Dropdown asyncOptions={() => Promise.resolve(options)} isMultiSelect />);
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        await waitFor(async () => {
          const option = screen.getByText('banana');
          userEvent.click(option);
          const cross = container.querySelector('i')
          userEvent.click(cross);
          expect(getByText('Select...')).toBeTruthy();
        })
      });


      it('should render custom render dropdown', async () => {
        const { getByText } = render(
          <Dropdown
            isMultiSelect
            asyncOptions={() => Promise.resolve(options)}
            optionRenderer={CustomComponent}
            displayArrowIndicator
            tagRenderer={CustomComponent}
          />
        );
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        await waitFor(async () => {
          const option = screen.getByText('banana');
          userEvent.click(option);
          expect(getByText('banana')).toBeTruthy();
        })
      });
    });

    describe('when search by term is enabled', () => {
      it('should render the header option when user starts typing', async () => {
        const { queryByText } = render(
          <Dropdown
            asyncOptions={() => Promise.resolve(options)}
            displayArrowIndicator
            enableTermSearch
            termSearchMessage="Search for term"
          />
        );

        const input = screen.getByRole('textbox');
        userEvent.type(input, 'B');
        await waitFor(async () => {
          expect(queryByText(/Search for term/)).toBeInTheDocument();
        })
      });

      it('should select option header', async () => {
        const searchedTerm = 'BBBmous';
        const { getByText, queryByText } = render(
          <Dropdown
            isOptionDisabled={optionDisabled}
            isOptionSelected={optionSelected}
            bindValue={'bindValue'}
            asyncOptions={() => Promise.resolve(options)}
            displayArrowIndicator
            enableTermSearch
            onTermSearch={onTermSearch}
            onBlur={onBlur}
          />
        );
        const input = screen.getByRole('textbox');
        await waitFor(async () => {
          userEvent.type(input, searchedTerm);
          fireEvent.mouseDown(input);
          //Select header option
          fireEvent.click(queryByText(/Search for term/));
          expect(getByText('BBBmousBBBmous')).toBeInTheDocument();
        })

      });
    });

    describe('when is with Validation Component', () => {
      it('should be triggered on Blur and on Change', async () => {
        const { getByText } = render(<>
          <Button>Outside target</Button>
          <Validation
            validator={[Validators.Required]}
            errorMessage={{ required: 'This field is required' }}>
            <Dropdown
              isMultiSelect
              asyncOptions={() => Promise.resolve(options)}
              optionRenderer={CustomComponent}
              displayArrowIndicator
              tagRenderer={CustomComponent}
            />
          </Validation>
        </>
        );
        const input = screen.getByRole('textbox');
        userEvent.click(input);
        // on Blur
        const button = screen.getByRole('button');
        userEvent.click(button);
        await waitFor(() => expect(getByText('This field is required')).toBeTruthy())
        // on Change
        await waitFor(async () => {
          userEvent.click(input);
          const option = screen.getByText('banana');
          userEvent.click(option);
          expect(getByText('banana')).toBeTruthy();
          waitForElementToBeRemoved(() => getByText('This field is required'));
        })
      });
    });
  });

  describe('when there are several options with same value', () => {
    it('should select only one option', () => {
      const options: LabelValue[] = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '1' },
        { label: 'Option 3 ', value: '1' },
      ];
      
      render(<Dropdown options={options}/>);
      const input = screen.getByRole('textbox');
      userEvent.click(input);
      userEvent.click(screen.getByText('Option 1'));
      userEvent.click(input);
      // First reference is the selected option on the input
      expect(screen.getAllByText('Option 1')[1].classList.contains('tk-select__option--is-selected')).toBeTruthy();
      expect(screen.getByText('Option 2').classList.contains('tk-select__option--is-selected')).toBeFalsy();
      expect(screen.getByText('Option 3').classList.contains('tk-select__option--is-selected')).toBeFalsy();
    }); 
  });
});
