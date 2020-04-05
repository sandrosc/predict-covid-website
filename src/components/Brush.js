/**
 * @fileOverview Brush
 */
import React, { PureComponent, Children } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { scalePoint } from 'd3-scale';
import _ from 'lodash';
import { getValueByDataKey } from 'recharts/lib/util/ChartUtils';
import Layer from 'recharts/lib/container/Layer';
import Text from 'recharts/lib/component/Text';
import { isNumber } from 'recharts/lib/util/DataUtils';
import { generatePrefixStyle } from 'recharts/lib/util/CssPrefixUtils';

class Brush extends PureComponent {
  static displayName = 'Brush';

  static propTypes = {
    className: PropTypes.string,

    fill: PropTypes.string,
    stroke: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number.isRequired,
    travellerWidth: PropTypes.number,
    gap: PropTypes.number,
    padding: PropTypes.shape({
      top: PropTypes.number,
      right: PropTypes.number,
      bottom: PropTypes.number,
      left: PropTypes.number,
    }),

    dataKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.func]),
    data: PropTypes.array,
    startIndex: PropTypes.number,
    endIndex: PropTypes.number,
    tickFormatter: PropTypes.func,

    children: PropTypes.node,

    onChange: PropTypes.func,
    updateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    leaveTimeOut: PropTypes.number,
    alwaysShowText: PropTypes.bool,
  };

  static defaultProps = {
    height: 40,
    travellerWidth: 5,
    gap: 1,
    fill: '#fff',
    stroke: '#666',
    padding: { top: 1, right: 1, bottom: 1, left: 1 },
    leaveTimeOut: 1000,
    alwaysShowText: false,
  };

  constructor(props) {
    super(props);

    this.travellerDragStartHandlers = {
      startX: this.handleTravellerDragStart.bind(this, 'startX'),
      endX: this.handleTravellerDragStart.bind(this, 'endX'),
    };

    this.state = props.data && props.data.length ? this.updateScale(props) : {};
  }

  // eslint-disable-next-line camelcase
  componentWillReceiveProps(nextProps) {
    const { data, width, x, travellerWidth, updateId } = this.props;

    if ((nextProps.data !== data || nextProps.updateId !== updateId) && nextProps.data && nextProps.data.length) {
      this.setState(this.updateScale(nextProps));
    } else if (nextProps.width !== width || nextProps.x !== x || nextProps.travellerWidth !== travellerWidth) {
      this.scale.range([nextProps.x, nextProps.x + nextProps.width - nextProps.travellerWidth]);
      this.scaleValues = this.scale.domain().map(entry => this.scale(entry));

      this.setState({
        startX: this.scale(nextProps.startIndex),
        endX: this.scale(nextProps.endIndex),
      });
    }
  }

  componentWillUnmount() {
    this.scale = null;
    this.scaleValues = null;

    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
  }

  static getIndexInRange(range, x) {
    const len = range.length;
    let start = 0;
    let end = len - 1;

    while (end - start > 1) {
      const middle = Math.floor((start + end) / 2);

      if (range[middle] > x) {
        end = middle;
      } else {
        start = middle;
      }
    }

    return x >= range[end] ? end : start;
  }

  getIndex({ startX, endX }) {
    const { gap } = this.props;
    const min = Math.min(startX, endX);
    const max = Math.max(startX, endX);
    const minIndex = this.constructor.getIndexInRange(this.scaleValues, min);
    const maxIndex = this.constructor.getIndexInRange(this.scaleValues, max);
    return {
      startIndex: Math.round(minIndex / gap) * gap,
      endIndex: Math.round(maxIndex / gap) * gap,
    };
  }

  getTextOfTick(index) {
    const { data, tickFormatter, dataKey } = this.props;
    const text = getValueByDataKey(data[index], dataKey, index);

    return _.isFunction(tickFormatter) ? tickFormatter(text) : text;
  }

  handleDrag = e => {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }

    if (this.state.isTravellerMoving) {
      this.handleTravellerMove(e);
    } else if (this.state.isSlideMoving) {
      this.handleSlideDrag(e);
    }
  };

  handleTouchMove = e => {
    if (e.changedTouches != null && e.changedTouches.length > 0) {
      this.handleDrag(e.changedTouches[0]);
    }
  };

  handleDragEnd = () => {
    const { startIndex, endIndex, onChange } = this.props;
    this.setState({
      isTravellerMoving: false,
      isSlideMoving: false,
    });
    const newIndex = this.getIndex({
      startX: this.state.startX,
      endX: this.state.endX,
    });
    this.setState({
      startX: this.scale(newIndex.startIndex),
      endX: this.scale(newIndex.endIndex),
    });
    if ((newIndex.startIndex !== startIndex || newIndex.endIndex !== endIndex) && onChange) {
      onChange(newIndex);
    }
  };

  handleLeaveWrapper = () => {
    if (this.state.isTravellerMoving || this.state.isSlideMoving) {
      this.leaveTimer = setTimeout(this.handleDragEnd, this.props.leaveTimeOut);
    }
  };

  handleEnterSlideOrTraveller = () => {
    this.setState({
      isTextActive: true,
    });
  };

  handleLeaveSlideOrTraveller = () => {
    this.setState({
      isTextActive: false,
    });
  };

  handleSlideDragStart = e => {
    const event = e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : e;

    this.setState({
      isTravellerMoving: false,
      isSlideMoving: true,
      slideMoveStartX: event.pageX,
    });
  };

  handleSlideDrag(e) {
    const { slideMoveStartX, startX, endX } = this.state;
    const { x, width, travellerWidth } = this.props;
    let delta = e.pageX - slideMoveStartX;

    if (delta > 0) {
      delta = Math.min(delta, x + width - travellerWidth - endX, x + width - travellerWidth - startX);
    } else if (delta < 0) {
      delta = Math.max(delta, x - startX, x - endX);
    }

    this.setState({
      startX: startX + delta,
      endX: endX + delta,
      slideMoveStartX: e.pageX,
    });
  }

  handleTravellerDragStart(id, e) {
    const event = e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : e;

    this.setState({
      isSlideMoving: false,
      isTravellerMoving: true,
      movingTravellerId: id,
      brushMoveStartX: event.pageX,
    });
  }

  handleTravellerMove(e) {
    const { brushMoveStartX, movingTravellerId } = this.state;
    const prevValue = this.state[movingTravellerId];

    const { x, width, travellerWidth } = this.props;
    const params = { startX: this.state.startX, endX: this.state.endX };

    let delta = e.pageX - brushMoveStartX;
    if (delta > 0) {
      delta = Math.min(delta, x + width - travellerWidth - prevValue);
    } else if (delta < 0) {
      delta = Math.max(delta, x - prevValue);
    }

    params[movingTravellerId] = prevValue + delta;

    this.setState({
      [movingTravellerId]: prevValue + delta,
      brushMoveStartX: e.pageX,
    });
  }

  updateScale(props) {
    const { data, startIndex, endIndex, x, width, travellerWidth } = props;
    const len = data.length;
    this.scale = scalePoint()
      .domain(_.range(0, len))
      .range([x, x + width - travellerWidth]);
    this.scaleValues = this.scale.domain().map(entry => this.scale(entry));
    return {
      isTextActive: false,
      isSlideMoving: false,
      isTravellerMoving: false,
      startX: this.scale(startIndex),
      endX: this.scale(endIndex),
    };
  }

  renderBackground() {
    const { x, y, width, height, fill, stroke } = this.props;

    return <rect stroke={stroke} fill={fill} x={x} y={y} width={width} height={height} />;
  }

  renderPanorama() {
    const { x, y, width, height, data, children, padding } = this.props;
    const chartElement = Children.only(children);

    if (!chartElement) {
      return null;
    }

    return React.cloneElement(chartElement, {
      x,
      y,
      width,
      height,
      margin: padding,
      compact: true,
      data,
    });
  }

  renderTraveller(travellerX, id) {
    const { y, travellerWidth, height, stroke } = this.props;
    const lineY = Math.floor(y + height / 2) - 1;
    const x = Math.max(travellerX, this.props.x);

    return (
      <Layer
        className="recharts-brush-traveller"
        onMouseEnter={this.handleEnterSlideOrTraveller}
        onMouseLeave={this.handleLeaveSlideOrTraveller}
        onMouseDown={this.travellerDragStartHandlers[id]}
        onTouchStart={this.travellerDragStartHandlers[id]}
        style={{ cursor: 'col-resize' }}
      >
        <rect x={x} y={y} width={travellerWidth} height={height} fill={stroke} stroke="none" />
        <line x1={x + 1} y1={lineY} x2={x + travellerWidth - 1} y2={lineY} fill="none" stroke="#fff" />
        <line x1={x + 1} y1={lineY + 2} x2={x + travellerWidth - 1} y2={lineY + 2} fill="none" stroke="#fff" />
      </Layer>
    );
  }

  renderSlide(startX, endX) {
    const { y, height, stroke } = this.props;

    return (
      <rect
        className="recharts-brush-slide"
        onMouseEnter={this.handleEnterSlideOrTraveller}
        onMouseLeave={this.handleLeaveSlideOrTraveller}
        onMouseDown={this.handleSlideDragStart}
        onTouchStart={this.handleSlideDragStart}
        style={{ cursor: 'move' }}
        stroke="none"
        fill={stroke}
        fillOpacity={0.2}
        x={Math.min(startX, endX)}
        y={y}
        width={Math.abs(endX - startX)}
        height={height}
      />
    );
  }

  renderText() {
    const { y, height, travellerWidth, stroke } = this.props;
    const { startX, endX } = this.state;
    const offset = 5;
    const attrs = {
      pointerEvents: 'none',
      fill: stroke,
    };

    const { startIndex, endIndex } = this.getIndex({ startX, endX });

    return (
      <Layer className="recharts-brush-texts">
        <Text
          textAnchor="end"
          verticalAnchor="middle"
          x={Math.min(this.scaleValues[startIndex], this.scaleValues[endIndex]) - offset}
          y={y + height / 2}
          {...attrs}
        >
          {this.getTextOfTick(startIndex)}
        </Text>
        <Text
          textAnchor="start"
          verticalAnchor="middle"
          x={Math.max(this.scaleValues[startIndex], this.scaleValues[endIndex]) + travellerWidth + offset}
          y={y + height / 2}
          {...attrs}
        >
          {this.getTextOfTick(endIndex)}
        </Text>
      </Layer>
    );
  }

  render() {
    const { data, className, children, x, y, width, height, alwaysShowText } = this.props;
    const { startX, endX, isTextActive, isSlideMoving, isTravellerMoving } = this.state;

    if (
      !data ||
      !data.length ||
      !isNumber(x) ||
      !isNumber(y) ||
      !isNumber(width) ||
      !isNumber(height) ||
      width <= 0 ||
      height <= 0
    ) {
      return null;
    }

    const layerClass = classNames('recharts-brush', className);
    const isPanoramic = React.Children.count(children) === 1;
    const style = generatePrefixStyle('userSelect', 'none');

    const { startIndex, endIndex } = this.getIndex({ startX, endX });
    const newStartX = this.scale(startIndex);
    const newEndX = this.scale(endIndex);

    return (
      <Layer
        className={layerClass}
        onMouseMove={this.handleDrag}
        onMouseLeave={this.handleLeaveWrapper}
        onMouseUp={this.handleDragEnd}
        onTouchEnd={this.handleDragEnd}
        onTouchMove={this.handleTouchMove}
        style={style}
      >
        {this.renderBackground()}
        {isPanoramic && this.renderPanorama()}
        {this.renderSlide(newStartX, newEndX)}
        {this.renderTraveller(newStartX, 'startX')}
        {this.renderTraveller(newEndX, 'endX')}
        {(isTextActive || isSlideMoving || isTravellerMoving || alwaysShowText) && this.renderText()}
      </Layer>
    );
  }
}

export default Brush;
