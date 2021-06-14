import * as React from 'react';
import classNames from 'classnames';

const prefix = 'tk-size';

type ScaleProps = {
  size?: 'xx-small' | 'x-small' | 'small' | 'medium' | 'large' | 'x-large' | 'xx-large',
  /** Optional CSS class name */
  className?: string,

};

const Scale: React.FC<ScaleProps> = ({
  size,
  className,
  ...rest
}: ScaleProps) => {
  console.warn('You are using a deprecated component. Scaling won\'t be supported anymore in next major. Please consider removing it');
  const classes = classNames(
    className,
    `${prefix}-${size}`,
  );
  return (
    <span
      className={classes}
      {...rest}>
    </span>
  );
};

Scale.defaultProps = {
  size: 'medium',
};

export default Scale;