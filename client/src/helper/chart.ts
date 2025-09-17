import dayjs from 'dayjs'
import { get } from 'svelte/store'
import { calculateDateByOffset, getCurrencySymbol } from './utils'
import { legend, targetCurrencyCode } from '../stores'

export const genDonutOptions = (theme = 'light') => {
  let trafficChannelsChartColors = { strokeColor: '#ffffff' }

  if (theme === 'dark') {
    trafficChannelsChartColors = {
      strokeColor: '#1f2937',
    }
  } else {
    trafficChannelsChartColors = {
      strokeColor: '#ffffff',
    }
  }

  return {
    series: [],
    labels: [],
    chart: {
      type: 'donut',
      height: 400,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 430,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
    stroke: {
      colors: [trafficChannelsChartColors.strokeColor],
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.9,
        },
      },
    },
    tooltip: {
      shared: true,
      followCursor: false,
      fillSeriesColor: false,
      inverseOrder: true,
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
      },
      x: {
        show: true,
        formatter: function (_, { seriesIndex, w }) {
          const label = w.config.labels[seriesIndex]
          return label
        },
      },
      y: {
        formatter: function (value) {
          return value + '%'
        },
      },
    },
    grid: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
  }
}

export const genAreaOptions = (theme = 'light') => {
  let mainChartColors

  if (theme === 'dark') {
    mainChartColors = {
      borderColor: '#374151',
      labelColor: '#9CA3AF',
      opacityFrom: 0,
      opacityTo: 0.15,
    }
  } else {
    mainChartColors = {
      borderColor: '#F3F4F6',
      labelColor: '#6B7280',
      opacityFrom: 0.45,
      opacityTo: 0,
    }
  }

  return {
    chart: {
      height: 400,
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      foreColor: mainChartColors.labelColor,
      toolbar: {
        show: false,
      },
      events: {
        legendClick: (chartContext, seriesIndex) => {
          legend.set({ chartContext, seriesIndex })
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        enabled: true,
        opacityFrom: mainChartColors.opacityFrom,
        opacityTo: mainChartColors.opacityTo,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
      },
    },
    grid: {
      show: true,
      borderColor: mainChartColors.borderColor,
      strokeDashArray: 1,
      padding: {
        left: 35,
        bottom: 15,
      },
    },
    series: [],
    markers: {
      size: 0,
      strokeColors: '#ffffff',
      hover: {
        size: 5,
        sizeOffset: 3,
      },
    },
    xaxis: {
      categories: [],
      labels: {
        style: {
          colors: [mainChartColors.labelColor],
          fontSize: '14px',
          fontWeight: 500,
        },
        rotate: -45,
        rotateAlways: false,
        formatter: (datetime) => {
          return dayjs(datetime).format('MM-DD')
        },
      },
      axisBorder: {
        color: mainChartColors.borderColor,
      },
      axisTicks: {
        color: mainChartColors.borderColor,
      },
      crosshairs: {
        show: true,
        position: 'back',
        stroke: {
          color: mainChartColors.borderColor,
          width: 1,
          dashArray: 10,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: [mainChartColors.labelColor],
          fontSize: '14px',
          fontWeight: 500,
        },
        formatter: function (value) {
          return getCurrencySymbol(get(targetCurrencyCode)) + value
        },
      },
    },
    legend: {
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: 'Inter, sans-serif',
      labels: {
        colors: [mainChartColors.labelColor],
      },
      itemMargin: {
        horizontal: 10,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          xaxis: {
            labels: {
              show: true,
              rotate: -21,
              rotateAlways: true,
            },
          },
        },
      },
    ],
  }
}

const RICHEST_VALUE = 6.6 * 10 ** 12

export const genTreemapOptions = (theme = 'light') => {
  let mainChartColors

  if (theme === 'dark') {
    mainChartColors = {
      borderColor: '#374151',
      labelColor: '#9CA3AF',
    }
  } else {
    mainChartColors = {
      borderColor: '#F3F4F6',
      labelColor: '#6B7280',
    }
  }

  return {
    chart: {
      height: 400,
      type: 'treemap',
      fontFamily: 'Inter, sans-serif',
      foreColor: mainChartColors.labelColor,
      toolbar: {
        show: false,
      },
    },
    series: [
      {
        data: [],
      },
    ],
    plotOptions: {
      treemap: {
        enableShades: true,
        shadeIntensity: 0.5,
        reverseNegativeShade: true,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 10000,
              color: '#fff4a3',
            },
            {
              from: 10000,
              to: 100000,
              color: '#ffe06b',
            },
            {
              from: 100000,
              to: 200000,
              color: '#ffca07',
            },
            {
              from: 200000,
              to: 300000,
              color: '#ffb300',
            },
            {
              from: 300000,
              to: 500000,
              color: '#ff9f00',
            },
            {
              from: 500000,
              to: 1000000,
              color: '#ff8c00',
            },
            {
              from: 1000000,
              to: 5000000,
              color: '#ff7a00',
            },
            {
              from: 5000000,
              to: 100000000,
              color: '#ff6600',
            },
            {
              from: 100000000,
              to: RICHEST_VALUE,
              color: '#ff4d00',
            },
            {
              from: RICHEST_VALUE,
              to: 100 * RICHEST_VALUE,
              color: '#ff3300',
            },
          ],
        },
      },
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.8,
        },
      },
      active: {
        filter: {
          type: 'darken',
          value: 0.68,
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        colors: ['#fff'],
      },
      formatter: function (text, op) {
        return [text, op.value]
      },
      offsetY: -4,
    },
    legend: {
      show: false,
    },
  }
}

export const genBindingOptions = (offsetDays: number) => {
  return {
    chart: {
      height: '400px',
      maxWidth: '100%',
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      dropShadow: { enabled: false },
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => value.toFixed(2),
      },
      x: {
        show: true,
      },
    },
    xaxis: {
      type: 'category',
      categories: [],
      labels: {
        rotate: -45,
        rotateAlways: false,
        formatter: (index) => {
          const datetime = calculateDateByOffset(index, offsetDays)
          return dayjs(datetime).format('MM-DD')
        },
      },
      tickPlacement: 'on',
    },
    markers: {
      size: 0,
      strokeColors: '#ffffff',
      hover: { size: 5, sizeOffset: 3 },
    },
    series: [
      {
        name: '💰',
        data: [],
        color: '#f8d826',
      },
    ],
    yaxis: {
      labels: {
        // 确保 Y 轴刻度为整数
        formatter: (value) => {
          return getCurrencySymbol(get(targetCurrencyCode)) + Math.round(value)
        },
      },
    },
  }
}
