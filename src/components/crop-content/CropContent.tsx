import * as React from 'react';
import ResizeDetectDiv from '../../core/hoc/ResizeDetectDiv';
import * as PropTypes from 'prop-types';

type CropContentProps = {
  children?: React.ReactNode;
  cropHeight?: string;
  className?: string;
  initCollapsed?: boolean;
  style?: any;
};

export default class CropContent extends React.Component<CropContentProps> {
  private containerElRef: HTMLDivElement;

  public state = {
    collapsed:
      this.props.initCollapsed === undefined || this.props.initCollapsed,
    hasOverflow: false
  };

  onToggle() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  componentDidMount() {
    // after first render check if component needs toggle
    this.handleOverflow();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.cropHeight !== this.props.cropHeight) {
      this.handleOverflow();
    }
  }

  handleOverflow() {
    if (this.state.collapsed) {
      const hasOverflow =
        this.containerElRef &&
        this.containerElRef.offsetHeight < this.containerElRef.scrollHeight;
      this.setState({ hasOverflow });
    }
  }

  render() {
    const collapsedHeight = `${this.props.cropHeight || '80px'}`
    const fullHeight = (this.containerElRef && this.containerElRef.scrollHeight ? `${this.containerElRef.scrollHeight}px` : '100%');

    const height = this.state.collapsed
      ? collapsedHeight
      : fullHeight;

    return (
      <ResizeDetectDiv
        onWidthChange={this.handleOverflow.bind(this)}
        className={'tk-crop-content ' + this.props.className}
        style={this.props.style}
      >
        <div
          ref={el => {
            this.containerElRef = el;
          }}
          className="content"
          style={{ maxHeight: height }}
        >
          {this.props.children}
        </div>
        {/* this should only display if there's overflow or collapsed false */}
        {this.state.hasOverflow ? (
          <div className="toggle-container">
            <a onClick={this.onToggle.bind(this)} className="tk-link">
              Show {this.state.collapsed ? 'more' : 'less'}
            </a>
          </div>
        ) : null}
      </ResizeDetectDiv>
    );
  }

  static propTypes = {
    cropHeight: PropTypes.string,
    initCollapsed: PropTypes.bool
  };
}
