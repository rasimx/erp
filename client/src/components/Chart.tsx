// import { type PortalProps } from '@mui/base/Portal';
import {
  axisClasses,
  BarPlot,
  ChartsTooltip,
  ChartsYAxis,
  ResponsiveChartContainer,
} from '@mui/x-charts';
import React, { type FC } from 'react';

// import { ShadowWrapperContext } from '../../components/shadowDom.js';

export interface StatsByDate {
  count: number;
  date: string;
}

interface Props {
  items: StatsByDate[];
  label: string;
  paddingRight?: number;
  color?: string;
}

const Chart: FC<Props> = ({ items, label, paddingRight, color }) => {
  let maxValue = Math.max(...items.map(item => item.count)).toString().length;
  if (maxValue === 1) maxValue = 2;

  // const shadowWrapperValue = useContext(ShadowWrapperContext);

  return (
    <>
      <ResponsiveChartContainer
        xAxis={[
          {
            id: 'date',
            data: items.map(item => item.date),
            scaleType: 'band',
          },
        ]}
        yAxis={[
          {
            id: 'quantities',
          },
        ]}
        series={[
          {
            type: 'bar',
            yAxisKey: 'quantities',
            data: items.map(item => item.count),
            // color: '#a69152',
            color,
          },
        ]}
        margin={{
          top: 0,
          left: label ? 15 : 5,
          right: paddingRight ?? 11 * maxValue,
          bottom: 0,
        }}
        sx={{
          [`.${axisClasses.left} .${axisClasses.label}`]: {
            transform: 'translate(22px, 10px)',
          },
          [`.${axisClasses.left} .${axisClasses.line}`]: {
            display: 'none',
          },
          [`.${axisClasses.left} .${axisClasses.tickContainer}`]: {
            display: 'none',
          },
          [`.${axisClasses.right} .${axisClasses.tickContainer}:first-of-type .${axisClasses.tickLabel}`]:
            {
              // display: 'none',
              transform: 'translate(0, -6px)',
            },
          [`.${axisClasses.right} .${axisClasses.tickContainer}:last-of-type .${axisClasses.tickLabel}`]:
            {
              // display: 'none',
              transform: 'translate(0, 5px)',
            },
          [`.${axisClasses.right} .${axisClasses.tickContainer}:first-of-type .${axisClasses.tick}`]:
            {
              // display: 'none',
            },
          [`.${axisClasses.right} .${axisClasses.tickContainer}:last-of-type .${axisClasses.tick}`]:
            {
              display: 'none',
            },
          [`.${axisClasses.right} .${axisClasses.label}`]: {
            display: 'none',
          },
          [`.${axisClasses.right} .${axisClasses.line}`]: {
            stroke: 'hsla(220, 4%, 48%, 0.7)',
          },
          [`.${axisClasses.right} .${axisClasses.tick}`]: {
            stroke: 'hsla(220, 4%, 48%, 0.7)',
          },
          [`.${axisClasses.right} .${axisClasses.tickLabel}`]: {
            fill: 'hsla(220, 4%, 48%, 1)',
          },
          [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: {
            // display: 'none',
          },
          [`.${axisClasses.bottom} .${axisClasses.line}`]: {
            stroke: 'hsla(220, 4%, 48%, 0.3)',
          },
        }}
        // disableAxisListener
      >
        <BarPlot />
        {/* <ChartsXAxis axisId="date" disableTicks tickFontSize={0} /> */}
        <ChartsYAxis
          axisId="quantities"
          position="left"
          disableLine
          disableTicks
          label={label}
          labelFontSize={12}
        />
        <ChartsYAxis
          axisId="quantities"
          position="right"
          tickFontSize={10}
          tickMinStep={1}
        />
        <ChartsTooltip
        // slotProps={{
        //   popper: {
        //     container: shadowWrapperValue?.shadowWrapper,
        //   },
        // }}
        />
      </ResponsiveChartContainer>
    </>
  );
};

export default Chart;
