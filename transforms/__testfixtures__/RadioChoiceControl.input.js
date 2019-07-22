// @flow
import React from 'react';
import classNames from 'classnames';

import {
  cxControl,
  cxInput,
  cxLabel,
  cxLabelChecked,
  cxRoot,
} from './RadioChoiceControl.module.scss';

/**
 * Разметка и стили контрола radio choices.
 */
export default class RadioChoiceControl<
  V: string = string
> extends React.Component<{|
  choices: Array<{ id: V, title: Node } & *>,
  classes?: {
    control?: string,
    label?: string,
    getLabel?: (V) => string,
  },
  disabled?: boolean,
  label?: string,
  multiple?: boolean,
  onChange: (value: V) => any,
  placeholder?: string,
  value?: V,
|}> {
  static defaultProps = {
    multiple: false,
    classes: {},
  };
  /**
   * Рендерит лейбл, если он задан.
   */
  renderLabel = () => {
    if (!this.props.label) {
      return null;
    }
    return this.props.label;
  };

  /**
   * Рендерит селект контрол с лейблом.
   */
  render() {
    const { classes = {} } = this.props;
    const controlClassName = classNames(cxControl, classes.control);
    const Wrapper = classes.rowWrapper ? 'div' : React.Fragment;

    return (
      <>
        {this.renderLabel()}
        <div className={classNames(classes.root, cxRoot)}>
          {this.props.choices.map(
            ({ id, title, classValidate = false }, index) => {
              const baseLabelClassName = classNames(classes.label, cxLabel, {
                [cxLabelChecked]: id === this.props.value,
                [classes.labelChecked]:
                  classes.labelChecked && id === this.props.value,
              });

              const labelClassName = classes.getLabel
                ? classes.getLabel(id)
                : '';

              return (
                <Wrapper
                  key={id}
                  {...(classes.rowWrapper
                    ? {
                        className: classNames(
                          !!classValidate && classValidate,
                          classes.rowWrapperLast &&
                            index === this.props.choices.length - 1
                            ? classes.rowWrapperLast
                            : classes.rowWrapper
                        ),
                      }
                    : {})}
                >
                  <div
                    key={id}
                    className={classNames(
                      controlClassName,
                      !!classValidate && classValidate
                    )}
                  >
                    <label
                      className={classNames(baseLabelClassName, labelClassName)}
                    >
                      {title}
                      <input
                        className={cxInput}
                        type={'radio'}
                        disabled={this.props.disabled}
                        checked={id === this.props.value}
                        onChange={() => this.props.onChange(id)}
                      />
                    </label>
                  </div>
                </Wrapper>
              );
            }
          )}
        </div>
      </>
    );
  }
}
