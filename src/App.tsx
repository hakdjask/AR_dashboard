import { useEffect, useMemo, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';
import {
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  LayoutGrid,
  Menu,
  Package2,
  PanelLeftClose,
  PanelLeftOpen,
  GripVertical,
  Search,
  Settings,
  SlidersHorizontal,
  ShoppingBag,
  Truck,
  X
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

type PeriodKey = 'today' | 'yesterday' | 'last7' | 'last30' | 'last90' | 'last365';
type TabKey = 'courier' | 'sales' | 'inventory';
type MetricKey = 'netSales' | 'cogs' | 'expenses' | 'netProfit';
type StoreChartMetricKey = 'grossRevenue' | 'orderReturns' | 'unitsSold';
type ComparisonData = {
  current: string;
  previous: string;
  change: string;
  currentPeriodLabel?: string;
  previousPeriodLabel?: string;
};

type PeriodCard = {
  key: PeriodKey;
  title: string;
  dateLabel: string;
  metrics: {
    key: MetricKey;
    label: string;
    value: string;
    delta: string;
  }[];
  footer: {
    label: string;
    value: string;
  }[];
};

const tabs: { key: TabKey; label: string }[] = [
  { key: 'courier', label: 'Courier' },
  { key: 'sales', label: 'Sales' },
  { key: 'inventory', label: 'Inventory' }
];

const dateMenu = [
  'Today',
  'Yesterday',
  'Last 7 Days',
  'Last 30 Days',
  'Last 90 Days',
  'Last 365 Days',
  'Custom'
];

const salesOverviewBreakdownValues: Record<
  PeriodKey,
  {
    grossSales: string;
    totalTaxes: string;
    discounts: string;
    returns: string;
    netSales: string;
    cogs: string;
    grossProfit: string;
    grossProfitMargin: string;
    expenses: string;
    netProfit: string;
  }
> = {
  today: {
    grossSales: 'PKR 300,000',
    totalTaxes: 'PKR 28,544',
    discounts: 'PKR 32,000',
    returns: 'PKR 16,000',
    netSales: 'PKR 223,456',
    cogs: 'PKR 76,544',
    grossProfit: 'PKR 146,912',
    grossProfitMargin: '65.7%',
    expenses: 'PKR 23,456',
    netProfit: 'PKR 123,456'
  },
  yesterday: {
    grossSales: 'PKR 286,000',
    totalTaxes: 'PKR 27,020',
    discounts: 'PKR 29,000',
    returns: 'PKR 17,000',
    netSales: 'PKR 212,980',
    cogs: 'PKR 83,200',
    grossProfit: 'PKR 129,780',
    grossProfitMargin: '60.9%',
    expenses: 'PKR 22,128',
    netProfit: 'PKR 107,652'
  },
  last7: {
    grossSales: 'PKR 1,965,000',
    totalTaxes: 'PKR 178,540',
    discounts: 'PKR 162,000',
    returns: 'PKR 84,000',
    netSales: 'PKR 1,540,460',
    cogs: 'PKR 528,140',
    grossProfit: 'PKR 1,012,320',
    grossProfitMargin: '65.7%',
    expenses: 'PKR 164,880',
    netProfit: 'PKR 847,440'
  },
  last30: {
    grossSales: 'PKR 8,420,000',
    totalTaxes: 'PKR 734,280',
    discounts: 'PKR 810,000',
    returns: 'PKR 365,000',
    netSales: 'PKR 6,510,720',
    cogs: 'PKR 2,214,040',
    grossProfit: 'PKR 4,296,680',
    grossProfitMargin: '66.0%',
    expenses: 'PKR 698,540',
    netProfit: 'PKR 3,598,140'
  },
  last90: {
    grossSales: 'PKR 25,260,000',
    totalTaxes: 'PKR 2,202,840',
    discounts: 'PKR 2,430,000',
    returns: 'PKR 1,095,000',
    netSales: 'PKR 19,532,160',
    cogs: 'PKR 6,642,120',
    grossProfit: 'PKR 12,890,040',
    grossProfitMargin: '66.0%',
    expenses: 'PKR 2,095,620',
    netProfit: 'PKR 10,794,420'
  },
  last365: {
    grossSales: 'PKR 102,724,000',
    totalTaxes: 'PKR 8,958,216',
    discounts: 'PKR 9,882,000',
    returns: 'PKR 4,453,000',
    netSales: 'PKR 79,430,784',
    cogs: 'PKR 27,011,288',
    grossProfit: 'PKR 52,419,496',
    grossProfitMargin: '66.0%',
    expenses: 'PKR 8,522,188',
    netProfit: 'PKR 43,897,308'
  }
};

const periods: PeriodCard[] = [
  {
    key: 'today',
    title: 'Today',
    dateLabel: 'May 12, 2024',
    metrics: [
      { key: 'netSales', label: 'Net Sales', value: 'PKR 223,456', delta: '100%' },
      { key: 'cogs', label: 'COGS', value: 'PKR 76,544', delta: '8%' },
      { key: 'expenses', label: 'Expenses', value: 'PKR 23,456', delta: '100%' },
      { key: 'netProfit', label: 'Net Profit', value: 'PKR 123,456', delta: '100%' }
    ],
    footer: [
      { label: 'Orders', value: '200' },
      { label: 'Units Sold', value: '412' },
      { label: 'Refunds', value: '16' }
    ]
  },
  {
    key: 'yesterday',
    title: 'Yesterday',
    dateLabel: 'May 11, 2024',
    metrics: [
      { key: 'netSales', label: 'Net Sales', value: 'PKR 212,980', delta: '92%' },
      { key: 'cogs', label: 'COGS', value: 'PKR 83,200', delta: '6%' },
      { key: 'expenses', label: 'Expenses', value: 'PKR 22,128', delta: '4%' },
      { key: 'netProfit', label: 'Net Profit', value: 'PKR 107,652', delta: '9%' }
    ],
    footer: [
      { label: 'Orders', value: '184' },
      { label: 'Units Sold', value: '396' },
      { label: 'Refunds', value: '17' }
    ]
  },
  {
    key: 'last7',
    title: 'Last 7 Days',
    dateLabel: 'May 05, 2024 - May 12, 2024',
    metrics: [
      { key: 'netSales', label: 'Net Sales', value: 'PKR 1,540,460', delta: '18%' },
      { key: 'cogs', label: 'COGS', value: 'PKR 528,140', delta: '7%' },
      { key: 'expenses', label: 'Expenses', value: 'PKR 164,880', delta: '5%' },
      { key: 'netProfit', label: 'Net Profit', value: 'PKR 847,440', delta: '16%' }
    ],
    footer: [
      { label: 'Orders', value: '1,382' },
      { label: 'Units Sold', value: '2,946' },
      { label: 'Refunds', value: '84' }
    ]
  },
  {
    key: 'last30',
    title: 'Last 30 Days',
    dateLabel: 'May 12, 2024',
    metrics: [
      { key: 'netSales', label: 'Net Sales', value: 'PKR 6,510,720', delta: '24%' },
      { key: 'cogs', label: 'COGS', value: 'PKR 2,214,040', delta: '11%' },
      { key: 'expenses', label: 'Expenses', value: 'PKR 698,540', delta: '8%' },
      { key: 'netProfit', label: 'Net Profit', value: 'PKR 3,598,140', delta: '21%' }
    ],
    footer: [
      { label: 'Orders', value: '5,944' },
      { label: 'Units Sold', value: '12,388' },
      { label: 'Refunds', value: '365' }
    ]
  }
];

const datePresets = {
  today: { title: 'Today', dateLabel: 'May 12, 2024' },
  yesterday: { title: 'Yesterday', dateLabel: 'May 11, 2024' },
  last7: { title: 'Last 7 Days', dateLabel: 'May 05, 2024 - May 12, 2024' },
  last30: { title: 'Last 30 Days', dateLabel: 'Apr 13, 2024 - May 12, 2024' },
  last90: { title: 'Last 90 Days', dateLabel: 'Feb 13, 2024 - May 12, 2024' },
  last365: { title: 'Last 365 Days', dateLabel: 'May 13, 2023 - May 12, 2024' }
} as const;

const metricTrendStyles: Record<MetricKey, { delta: string; direction: 'up' | 'down' }> = {
  netSales: { delta: '100%', direction: 'up' },
  cogs: { delta: '8%', direction: 'down' },
  expenses: { delta: '6%', direction: 'up' },
  netProfit: { delta: '14%', direction: 'up' }
};

type MetricPopoverRow = {
  label: string;
  value: string;
  medium?: boolean;
  dividerBefore?: boolean;
  prefix?: string;
};

const getMetricPopoverContent = (periodKey: PeriodKey, metricKey: MetricKey): MetricPopoverRow[] => {
  const values = salesOverviewBreakdownValues[periodKey];

  if (metricKey === 'netSales') {
    return [
      { label: 'Gross Sales', value: values.grossSales },
      { label: 'Total Taxes', value: values.totalTaxes, prefix: '-' },
      { label: 'Discounts', value: values.discounts, prefix: '-' },
      { label: 'Returns', value: values.returns, prefix: '-' },
      { label: 'Net Sales', value: values.netSales, medium: true, dividerBefore: true }
    ];
  }

  if (metricKey === 'cogs') {
    return [
      { label: 'Revenue', value: values.netSales },
      { label: 'COGS', value: values.cogs, prefix: '-' },
      { label: 'Gross Profit', value: values.grossProfit, medium: true, dividerBefore: true },
      { label: 'Gross Profit Margin', value: values.grossProfitMargin, medium: true }
    ];
  }

  if (metricKey === 'expenses') {
    return [];
  }

  return [
    { label: 'Gross Sales', value: values.grossSales },
    { label: 'Total Taxes', value: values.totalTaxes, prefix: '-' },
    { label: 'Discounts', value: values.discounts, prefix: '-' },
    { label: 'Returns', value: values.returns, prefix: '-' },
    { label: 'Net Sales', value: values.netSales, medium: true, dividerBefore: true },
    { label: 'COGS', value: values.cogs, prefix: '-', dividerBefore: true },
    { label: 'Gross Profit', value: values.grossProfit, medium: true, dividerBefore: true },
    { label: 'Gross Profit Margin', value: values.grossProfitMargin, medium: true },
    { label: 'Expenses', value: values.expenses, prefix: '-', dividerBefore: true },
    { label: 'Net Profit', value: values.netProfit, medium: true, dividerBefore: true }
  ];
};

const metricTooltips: Record<MetricKey, string | TooltipContent> = {
  netSales: {
    title: 'Net Sales',
    blocks: [
      { type: 'text', text: 'Revenue after discounts, returns, and taxes for the selected period.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Net Sales = Gross Sales - Taxes - Discounts - Returns' }
    ]
  },
  cogs: 'Direct costs tied to products sold during the selected period.',
  expenses: 'Operating expenses allocated to the selected date range.',
  netProfit: {
    title: 'Net Profit',
    blocks: [
      { type: 'text', text: 'Profit remaining after direct costs and operating expenses.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Net Profit = Net Sales - COGS - Expenses' }
    ]
  }
};

const footerTooltips: Record<string, string> = {
  Orders: 'Total completed orders in the selected date range.',
  'Units Sold': 'Total quantity of items sold across completed orders.',
  Refunds: 'Orders or items refunded during the selected date range.'
};

const glanceDateOptions = ['This Week', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 365 Days', 'Custom'];
const storeOptions = [
  'Store One Name',
  'Store Two Name',
  'Store Three Name',
  'Store Four Name',
  'Store Five Name'
];

type TooltipContentBlock =
  | { type: 'text'; text: string }
  | { type: 'formula'; text: string }
  | { type: 'spacer' };

type TooltipContent = {
  title?: string;
  blocks: TooltipContentBlock[];
};

const glanceKpiTooltips: Record<string, string | TooltipContent> = {
  'New Customers': 'New customers acquired during the selected period across the selected stores.',
  'Average Order Value': {
    title: 'Average Order Value (AOV)',
    blocks: [
      { type: 'text', text: 'The average amount spent per order on your e-commerce store.' },
      { type: 'spacer' },
      { type: 'formula', text: 'AOV = Total Revenue / Total Number of Orders' }
    ]
  },
  'Customer Lifetime Value': {
    title: 'Customer Lifetime Value (CLV)',
    blocks: [
      {
        type: 'text',
        text: 'Estimated revenue a customer may generate over their relationship with your business.'
      },
      { type: 'spacer' },
      { type: 'formula', text: 'CLV = Average Order Value x Purchase Frequency x Customer Lifespan' },
      { type: 'spacer' },
      {
        type: 'text',
        text: 'AOV is the average amount a customer spends per order.'
      },
      { type: 'spacer' },
      {
        type: 'text',
        text: 'Purchase Frequency is how often a customer buys from your store, usually measured over the last 6 months.'
      },
      { type: 'spacer' },
      {
        type: 'text',
        text: 'Customer Lifespan is the average time a customer stays active. For a 6-month view, estimate it using customers who purchased in the last 6 months.'
      }
    ]
  },
  'Customer Retention': {
    title: 'Customer Retention',
    blocks: [
      { type: 'text', text: 'Share of existing customers who returned and purchased again in the selected period.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Retention Rate = Returning Customers / Total Customers x 100' }
    ]
  }
};

const glanceMetrics = [
  {
    label: 'New Customers',
    value: '156',
    sublabel: 'Since Yesterday',
    trend: '7.2%',
    direction: 'up' as const,
    showStoreSelect: false,
    comparison: { current: '156', previous: '146', change: '10', currentPeriodLabel: 'Current Period', previousPeriodLabel: 'Previous Period' }
  },
  {
    label: 'Average Order Value',
    value: 'PKR 10,500',
    sublabel: 'Since Yesterday',
    trend: '7.2%',
    direction: 'up' as const,
    showStoreSelect: false,
    comparison: {
      current: 'PKR 10,500',
      previous: 'PKR 9,795',
      change: 'PKR 705',
      currentPeriodLabel: 'Current Period',
      previousPeriodLabel: 'Previous Period'
    }
  },
  {
    label: 'Customer Lifetime Value',
    value: 'PKR 19,000',
    sublabel: 'Since Yesterday',
    trend: '7.2%',
    direction: 'up' as const,
    showStoreSelect: false,
    comparison: {
      current: 'PKR 19,000',
      previous: 'PKR 17,725',
      change: 'PKR 1,275',
      currentPeriodLabel: 'Current Period',
      previousPeriodLabel: 'Previous Period'
    }
  },
  {
    label: 'Customer Retention',
    value: '35%',
    sublabel: 'Since Yesterday',
    trend: '7.2%',
    direction: 'up' as const,
    showStoreSelect: true,
    comparison: { current: '35%', previous: '32.6%', change: '2.4%', currentPeriodLabel: 'Current Period', previousPeriodLabel: 'Previous Period' }
  }
];

type GlanceMetricCard = {
  label: string;
  value: string;
  sublabel: string;
  trend: string;
  direction: 'up' | 'down';
  showStoreSelect: boolean;
  comparison: ComparisonData;
  secondaryText?: string;
  secondaryTooltip?: string;
};

const sectionSixKpiTooltips: Record<string, string> = {
  'Booked Orders': 'Total number of orders successfully booked in the selected period.',
  'Total Shipped': 'Total number of booked orders that were dispatched to courier in the selected period.',
  'Total Delivered': 'Total number of shipped orders successfully delivered to customers in the selected period.',
  'Total Delivery Failed': 'Total number of shipment attempts that failed delivery in the selected period.',
  'Net Sales': 'Revenue after taxes, discounts, and returns in the selected period.',
  COGS: 'Direct costs attributable to products sold in the selected period.',
  Expenses: 'Operating expenses allocated to the selected period.',
  'Net Profit': 'Profit remaining after deducting COGS and Expenses from Net Sales.',
  'New Customers': 'New customers acquired in the selected period.',
  'Average Order Value': 'Average amount spent per order in the selected period.',
  'Customer Lifetime Value': 'Estimated revenue expected from a customer over their relationship with your store.',
  'Customer Retention': 'Percentage of existing customers who purchased again in the selected period.'
};

const sectionSixMetricSectionsBase: { title: 'Orders' | 'Sales' | 'Customers'; metrics: GlanceMetricCard[] }[] = [
  {
    title: 'Orders',
    metrics: [
      {
        label: 'Booked Orders',
        value: '1,248',
        sublabel: 'Since Yesterday',
        trend: '5.4%',
        direction: 'up',
        showStoreSelect: false,
        comparison: {
          current: '1,248',
          previous: '1,184',
          change: '64',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      },
      {
        label: 'Total Shipped',
        value: '1,076',
        sublabel: 'Since Yesterday',
        trend: '4.8%',
        direction: 'up',
        showStoreSelect: false,
        comparison: {
          current: '1,076',
          previous: '1,027',
          change: '49',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      },
      {
        label: 'Total Delivered',
        value: '1,021',
        sublabel: 'Since Yesterday',
        trend: '5.1%',
        direction: 'up',
        showStoreSelect: false,
        comparison: {
          current: '1,021',
          previous: '971',
          change: '50',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      },
      {
        label: 'Total Delivery Failed',
        value: '55',
        sublabel: 'Since Yesterday',
        trend: '2.3%',
        direction: 'down',
        showStoreSelect: false,
        comparison: {
          current: '55',
          previous: '58',
          change: '3',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      }
    ]
  },
  {
    title: 'Sales',
    metrics: [
      {
        label: 'Net Sales',
        value: 'PKR 223,456',
        sublabel: 'Since Yesterday',
        trend: '8.7%',
        direction: 'up',
        showStoreSelect: false,
        comparison: {
          current: 'PKR 223,456',
          previous: 'PKR 205,600',
          change: 'PKR 17,856',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      },
      {
        label: 'COGS',
        value: 'PKR 76,544',
        sublabel: 'Since Yesterday',
        trend: '5.8%',
        direction: 'down',
        showStoreSelect: false,
        comparison: {
          current: 'PKR 76,544',
          previous: 'PKR 81,240',
          change: 'PKR 4,696',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      },
      {
        label: 'Expenses',
        value: 'PKR 23,456',
        sublabel: 'Since Yesterday',
        trend: '3.6%',
        direction: 'up',
        showStoreSelect: false,
        comparison: {
          current: 'PKR 23,456',
          previous: 'PKR 22,640',
          change: 'PKR 816',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      },
      {
        label: 'Net Profit',
        value: 'PKR 123,456',
        sublabel: 'Since Yesterday',
        trend: '9.4%',
        direction: 'up',
        showStoreSelect: false,
        comparison: {
          current: 'PKR 123,456',
          previous: 'PKR 112,880',
          change: 'PKR 10,576',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      }
    ]
  },
  {
    title: 'Customers',
    metrics: [
      {
        label: 'New Customers',
        value: '426',
        sublabel: 'Since Yesterday',
        trend: '6.8%',
        direction: 'up',
        showStoreSelect: false,
        comparison: {
          current: '426',
          previous: '399',
          change: '27',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      },
      {
        label: 'Average Order Value',
        value: 'PKR 10,500',
        sublabel: 'Since Yesterday',
        trend: '2.9%',
        direction: 'up',
        showStoreSelect: false,
        comparison: {
          current: 'PKR 10,500',
          previous: 'PKR 10,204',
          change: 'PKR 296',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      },
      {
        label: 'Customer Lifetime Value',
        value: 'PKR 21,800',
        sublabel: 'Since Yesterday',
        trend: '2.7%',
        direction: 'up',
        showStoreSelect: false,
        comparison: {
          current: 'PKR 21,800',
          previous: 'PKR 21,226',
          change: 'PKR 574',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      },
      {
        label: 'Customer Retention',
        value: '38.6%',
        sublabel: 'Since Yesterday',
        trend: '1.2%',
        direction: 'up',
        showStoreSelect: true,
        comparison: {
          current: '38.6%',
          previous: '38.1%',
          change: '0.5%',
          currentPeriodLabel: 'Current Period',
          previousPeriodLabel: 'Previous Period'
        }
      }
    ]
  }
];

const getSectionSixValueMultiplier = (value: string, periodKey: PeriodKey) => {
  const isRate = value.includes('%');
  if (isRate) {
    const rateMultiplier: Record<PeriodKey, number> = {
      today: 1,
      yesterday: 0.98,
      last7: 1.04,
      last30: 1.08,
      last90: 1.12,
      last365: 1.2
    };
    return rateMultiplier[periodKey];
  }

  const volumeMultiplier: Record<PeriodKey, number> = {
    today: 1,
    yesterday: 0.93,
    last7: 6.9,
    last30: 28.2,
    last90: 84.6,
    last365: 343.1
  };
  return volumeMultiplier[periodKey];
};

const scaleMetricValueByPeriod = (value: string, periodKey: PeriodKey) => {
  const numeric = Number(value.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(numeric)) return value;

  const scaled = numeric * getSectionSixValueMultiplier(value, periodKey);

  if (value.includes('PKR')) {
    return `PKR ${Math.round(scaled).toLocaleString('en-US')}`;
  }
  if (value.includes('%')) {
    return `${scaled.toFixed(1)}%`;
  }
  return Math.round(scaled).toLocaleString('en-US');
};

const scaleComparisonByPeriod = (comparison: ComparisonData, periodKey: PeriodKey): ComparisonData => ({
  ...comparison,
  current: scaleMetricValueByPeriod(comparison.current, periodKey),
  previous: scaleMetricValueByPeriod(comparison.previous, periodKey),
  change: scaleMetricValueByPeriod(comparison.change, periodKey)
});

const salesKpiTooltips: Record<string, string | TooltipContent> = {
  'Total Orders': 'Total orders booked across the selected stores and period.',
  'Booked Orders': 'Total orders booked across the selected stores and period.',
  'Total Gross Sales': 'Total gross sales across all selected stores in the active period.',
  'Highest Store Gross Sales': 'Store with the strongest gross sales contribution in the selected period.',
  'Average Gross Sales per Store': {
    title: 'Average Gross Sales per Store',
    blocks: [
      { type: 'text', text: 'Average gross sales contribution across active stores in the selected view.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Average Gross Sales per Store = Total Gross Sales / Active Stores' }
    ]
  },
  'Peak Gross Sales Day': 'Day with the highest gross sales in the selected date range.',
  'Total Units Sold': 'Total units sold across all selected stores in the active period.',
  'Top Store by Units Sold': 'Store contributing the highest units sold in the selected period.',
  'Average Units Sold per Store': {
    title: 'Average Units Sold per Store',
    blocks: [
      { type: 'text', text: 'Average units sold contribution across selected stores.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Average Units Sold per Store = Total Units Sold / Active Stores' }
    ]
  },
  'Peak Units Sold Day': 'Day with the highest units sold in the selected date range.',
  'Total Order Returns': 'Total returned orders recorded across selected stores in the active period.',
  'Highest Store Returns': 'Store recording the highest order returns in the selected period.',
  'Average Returns per Store': {
    title: 'Average Returns per Store',
    blocks: [
      { type: 'text', text: 'Average order returns across selected stores.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Average Returns per Store = Total Order Returns / Active Stores' }
    ]
  },
  'Peak Returns Day': 'Day with the highest returns count in the selected date range.'
};

const salesStoreOptions = ['Daraz-02', 'Shopify-01', 'WOO-01', 'Shopify-02', 'Shopify-03'];
const salesMetricOptions = ['Gross Sales', 'Order Returns', 'Units Sold'];
const salesDateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 365 Days', 'Custom'];
const inventoryDateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 365 Days', 'Custom'];
const inventoryStatusOptions = ['On-hand', 'Committed', 'Available', 'Inbound', 'Unfulfillable'];
const inventoryGroupByOptions = ['Days', 'Weeks', 'Months', 'Years'];
const inventoryLocationOptions = ['Main Warehouse', 'Retail Backroom', 'Transit Hub', 'Returns Bay', 'Overflow Rack'];
const inventoryMovementLocationOptions = [...inventoryLocationOptions];
const inventoryMovementMaxDataPoints = 365;
const inventoryMovementBaseIndexes = Array.from({ length: inventoryMovementMaxDataPoints }, (_, index) => index);
const inventoryHealthDisplayLimit = 20;

type InventoryStatusKey = 'onHand' | 'committed' | 'available' | 'inbound' | 'unfulfillable';
type InventoryMovementStoreData = {
  store: string;
  location: string;
  series: Record<InventoryStatusKey, { current: number[]; previous: number[] }>;
};

type InventoryHealthProduct = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  image: string;
  store: string;
  location: string;
  category: string;
  brand: string;
  tags: string[];
  onHandQuantity: number;
  committedQuantity: number;
  availableQuantity: number;
  quantityIn: number;
  quantityOut: number;
  inventoryAging: number;
  deadStocks: number;
  salesVelocity: number;
  stockToSalesRatio: number;
  inventoryTurnoverRatio: number;
};

type InventoryHealthSortKey =
  | 'name'
  | 'quantityIn'
  | 'quantityOut'
  | 'deadStocks'
  | 'salesVelocity'
  | 'stockToSalesRatio'
  | 'inventoryTurnoverRatio';

type InventoryHealthSearchField = 'name' | 'sku' | 'barcode';
type InventoryHealthFilterKey = 'tags' | 'category' | 'brand';

type InventoryHealthColumnConfig = {
  key: InventoryHealthSortKey;
  label: string;
  subtitle?: string;
  tooltipKey: string;
  visible: boolean;
};

const inventoryStatusLabelMap: Record<InventoryStatusKey, string> = {
  onHand: 'On-hand',
  committed: 'Committed',
  available: 'Available',
  inbound: 'Inbound',
  unfulfillable: 'Unfulfillable'
};

const inventoryStatusFromLabel: Record<string, InventoryStatusKey> = {
  'On-hand': 'onHand',
  Committed: 'committed',
  Available: 'available',
  Inbound: 'inbound',
  Unfulfillable: 'unfulfillable',
  Unfulfilled: 'unfulfillable'
};

const inventoryStoreLocations: Record<string, string> = {
  'Daraz-02': 'Main Warehouse',
  'Shopify-01': 'Retail Backroom',
  'WOO-01': 'Transit Hub',
  'Shopify-02': 'Returns Bay',
  'Shopify-03': 'Overflow Rack'
};

const inventoryHealthCategoryOptions = ['Apparel', 'Footwear', 'Accessories', 'Electronics', 'Home'];
const inventoryHealthBrandOptions = ['Northstar', 'Apex', 'Orbit', 'Nimbus', 'Vertex'];
const deadStockAgingDayOptions = ['30', '60', '90', '180', '360'];
const inventoryHealthTagOptions = [
  'Fast Moving',
  'Slow Moving',
  'Seasonal',
  'Premium',
  'Clearance',
  'Fragile',
  'Bundle',
  'New Arrival'
];

const inventoryHealthSearchFieldLabelMap: Record<InventoryHealthSearchField, string> = {
  name: 'Name',
  sku: 'SKU',
  barcode: 'Barcode'
};
const inventoryHealthSearchFieldFromLabel: Record<string, InventoryHealthSearchField> = {
  Name: 'name',
  SKU: 'sku',
  Barcode: 'barcode'
};
const inventoryHealthSearchFieldOptions = Object.values(inventoryHealthSearchFieldLabelMap);

const inventoryHealthFilterLabelMap: Record<InventoryHealthFilterKey, string> = {
  tags: 'Tags',
  category: 'Category',
  brand: 'Brand'
};
const inventoryHealthFilterFromLabel: Record<string, InventoryHealthFilterKey> = {
  Tags: 'tags',
  Category: 'category',
  Brand: 'brand'
};
const inventoryHealthFilterTypeOptions = Object.values(inventoryHealthFilterLabelMap);

const inventoryHealthHeaderTooltips: Record<string, string | TooltipContent> = {
  product: 'Product details including image, product title, and SKU identifier.',
  quantityIn: {
    title: 'Quantity In',
    blocks: [
      { type: 'text', text: 'Total inbound units received for the product in the selected period.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Quantity In = Sum of all inbound receipts and transfers' }
    ]
  },
  quantityOut: {
    title: 'Quantity Out',
    blocks: [
      { type: 'text', text: 'Total outbound units shipped, sold, or fulfilled in the selected period.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Quantity Out = Sum of all outbound fulfillments and dispatches' }
    ]
  },
  inventoryAging: 'Units aging between 1 and 90 days in inventory.',
  deadStocks: {
    title: 'Dead Stocks (Aging >90)',
    blocks: [
      { type: 'text', text: 'Units that have remained unsold in inventory for more than 90 days.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Dead Stocks = Quantity where Aging Days > 90' }
    ]
  },
  salesVelocity: {
    title: 'Sales Velocity',
    blocks: [
      { type: 'text', text: 'Average units sold per day in the selected period.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Sales Velocity = Units Sold / Number of Days' }
    ]
  },
  stockToSalesRatio: {
    title: 'Stock-to-Sales Ratio',
    blocks: [
      { type: 'text', text: 'Relationship between available stock and sold quantity in the selected period.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Stock-to-Sales Ratio = Available Quantity / Quantity Out' }
    ]
  },
  inventoryTurnoverRatio: {
    title: 'Inventory Turnover Ratio',
    blocks: [
      { type: 'text', text: 'How efficiently inventory is sold relative to average stock held.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Inventory Turnover Ratio = Quantity Out / Average Inventory' }
    ]
  }
};

const inventoryHealthColumnBlueprint: Omit<InventoryHealthColumnConfig, 'visible'>[] = [
  { key: 'name', label: 'Products', tooltipKey: 'product' },
  { key: 'quantityIn', label: 'Quantity In', tooltipKey: 'quantityIn' },
  { key: 'quantityOut', label: 'Quantity Out', tooltipKey: 'quantityOut' },
  { key: 'deadStocks', label: 'Dead Stocks', tooltipKey: 'deadStocks' },
  { key: 'salesVelocity', label: 'Sales Velocity', tooltipKey: 'salesVelocity' },
  { key: 'stockToSalesRatio', label: 'Stock-to-Sales Ratio', tooltipKey: 'stockToSalesRatio' },
  { key: 'inventoryTurnoverRatio', label: 'Inventory Turnover Ratio', tooltipKey: 'inventoryTurnoverRatio' }
];

const deterministicNoise = (seed: number) => {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return raw - Math.floor(raw);
};

const generateInventoryHealthImage = (name: string, seed: number) => {
  const colors = ['#DBFCE7', '#E0F2FE', '#FEF3C7', '#FCE7F3', '#EDE9FE', '#D1FAE5'];
  const bg = colors[seed % colors.length];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' rx='10' fill='${bg}'/><text x='20' y='25' text-anchor='middle' font-family='Poppins, Arial' font-size='13' font-weight='700' fill='#1f2937'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const generateMovementSeries = (base: number, maxCap: number, storeFactor: number, statusFactor: number) =>
  inventoryMovementBaseIndexes.reduce<number[]>((accumulator, index) => {
    const previous = accumulator[index - 1] ?? base;
    const lowFreqWave = Math.sin((index + storeFactor * 4) * 0.17) * base * 0.24;
    const midFreqWave = Math.cos((index + statusFactor * 9) * 0.39) * base * 0.18;
    const highFreqWave = Math.sin((index + storeFactor + statusFactor) * 0.81) * base * 0.12;
    const drift = (deterministicNoise((index + 3) * (storeFactor + 5) * (statusFactor + 7)) - 0.5) * base * 0.48;
    const spikeSeed = deterministicNoise((index + 17) * (storeFactor + 11) * (statusFactor + 13));
    const spike =
      spikeSeed > 0.86
        ? (deterministicNoise((index + 29) * (storeFactor + 2) * (statusFactor + 19)) - 0.5) * base * 1.1
        : 0;
    const step = lowFreqWave + midFreqWave + highFreqWave + drift + spike;
    const smoothed = previous * 0.42 + (base + step) * 0.58;
    accumulator.push(Math.min(maxCap, Math.max(0, Math.round(smoothed))));
    return accumulator;
  }, []);

const inventoryMovementData: InventoryMovementStoreData[] = salesStoreOptions.map((store, storeIndex) => {
  const statusConfig: Record<InventoryStatusKey, { base: number; max: number }> = {
    onHand: { base: 120, max: 780 },
    committed: { base: 82, max: 640 },
    available: { base: 98, max: 710 },
    inbound: { base: 66, max: 560 },
    unfulfillable: { base: 24, max: 320 }
  };

  const series = (Object.keys(statusConfig) as InventoryStatusKey[]).reduce(
    (accumulator, statusKey, statusIndex) => {
      const { base, max } = statusConfig[statusKey];
      const current = generateMovementSeries(base, max, storeIndex, statusIndex);
      const previous = generateMovementSeries(
        base * (0.9 + deterministicNoise((storeIndex + 1) * (statusIndex + 3) * 17) * 0.3),
        max,
        storeIndex + 5,
        statusIndex + 4
      ).map((value, index) => {
        const swing = (deterministicNoise((index + 37) * (storeIndex + 3) * (statusIndex + 17)) - 0.5) * base * 0.34;
        return Math.min(max, Math.max(0, Math.round(value + swing)));
      });
      accumulator[statusKey] = { current, previous };
      return accumulator;
    },
    {} as Record<InventoryStatusKey, { current: number[]; previous: number[] }>
  );

  return {
    store,
    location: inventoryStoreLocations[store],
    series
  };
});

const inventoryHealthProducts: InventoryHealthProduct[] = Array.from({ length: 100 }, (_, index) => {
  const productIndex = index + 1;
  const store = salesStoreOptions[index % salesStoreOptions.length];
  const location = inventoryLocationOptions[index % inventoryLocationOptions.length];
  const category = inventoryHealthCategoryOptions[index % inventoryHealthCategoryOptions.length];
  const brand = inventoryHealthBrandOptions[(index * 2 + 1) % inventoryHealthBrandOptions.length];
  const tags = [
    inventoryHealthTagOptions[index % inventoryHealthTagOptions.length],
    inventoryHealthTagOptions[(index + 3) % inventoryHealthTagOptions.length]
  ];
  const seasonal = Math.sin((index + 1) * 0.63) * 0.22 + 1;
  const onHandQuantity = Math.max(35, Math.round((120 + (index % 11) * 17) * seasonal));
  const committedQuantity = Math.max(8, Math.round(onHandQuantity * (0.12 + (index % 5) * 0.06)));
  const availableQuantity = Math.max(0, onHandQuantity - committedQuantity);
  const quantityIn = Math.max(45, Math.round(onHandQuantity * (1.05 + (index % 5) * 0.08)));
  const quantityOut = Math.max(18, Math.round(quantityIn * (0.54 + ((index + 2) % 6) * 0.06)));
  const inventoryAging = Math.max(10, Math.round(onHandQuantity * (0.2 + ((index + 3) % 6) * 0.08)));
  const deadStocks = Math.max(0, Math.round(onHandQuantity * (0.03 + ((index + 5) % 4) * 0.05)));
  const salesVelocity = Number((2.1 + (index % 7) * 0.55 + Math.sin(index * 0.31)).toFixed(1));
  const stockToSalesRatio = Number((availableQuantity / Math.max(1, quantityOut)).toFixed(2));
  const averageInventory = Math.max(1, Math.round((onHandQuantity + availableQuantity) / 2));
  const inventoryTurnoverRatio = Number((quantityOut / averageInventory).toFixed(2));
  const productName = `Inventory Product ${productIndex.toString().padStart(3, '0')}`;

  return {
    id: `ih-${productIndex.toString().padStart(3, '0')}`,
    name: productName,
    sku: `SKU-${(43000 + productIndex).toString()}`,
    barcode: `${(890000000000 + productIndex * 137).toString()}`,
    image: generateInventoryHealthImage(productName, index),
    store,
    location,
    category,
    brand,
    tags,
    onHandQuantity,
    committedQuantity,
    availableQuantity,
    quantityIn,
    quantityOut,
    inventoryAging,
    deadStocks,
    salesVelocity,
    stockToSalesRatio,
    inventoryTurnoverRatio
  };
});

const inventoryHealthFilterOptionsByKey: Record<InventoryHealthFilterKey, string[]> = {
  tags: [...new Set(inventoryHealthProducts.flatMap((product) => product.tags))].sort((a, b) => a.localeCompare(b)),
  category: [...new Set(inventoryHealthProducts.map((product) => product.category))].sort((a, b) => a.localeCompare(b)),
  brand: [...new Set(inventoryHealthProducts.map((product) => product.brand))].sort((a, b) => a.localeCompare(b))
};

const inventoryMovementKpiTooltips: Record<string, string | TooltipContent> = {
  'On-hand': 'Total stock physically available at storage locations in the selected period.',
  Committed: 'Stock reserved for open orders and therefore unavailable for new allocations.',
  Available: {
    title: 'Available',
    blocks: [
      { type: 'text', text: 'Sellable stock after subtracting committed quantities from on-hand inventory.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Available = On-hand - Committed' }
    ]
  },
  Inbound: 'Inventory expected to arrive from purchase orders or transfers.',
  Unfulfilled: 'Demand that could not be served due to inventory constraints in the selected period.'
};

const inventoryDateScale: Record<string, number> = {
  'Last 7 Days': 0.86,
  'Last 30 Days': 1,
  'Last 90 Days': 1.72,
  'Last 365 Days': 4.65,
  Custom: 1.1
};
const locationMetricOptions = ['Orders Volume', 'Gross Sales'];
const locationDateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

type InventoryStoreSnapshot = {
  store: string;
  region: string;
  totalInventoryValue: { current: number; previous: number };
  totalProducts: { current: number; previous: number };
  stockoutProducts: { current: number; previous: number };
  reorderProducts: { current: number; previous: number };
  inboundQuantity: { current: number; previous: number };
  outboundQuantity: { current: number; previous: number };
};

const inventoryStoreSnapshots: InventoryStoreSnapshot[] = [
  {
    store: 'Daraz-02',
    region: 'Sindh',
    totalInventoryValue: { current: 3820000, previous: 3490000 },
    totalProducts: { current: 1150, previous: 1070 },
    stockoutProducts: { current: 26, previous: 31 },
    reorderProducts: { current: 74, previous: 65 },
    inboundQuantity: { current: 2940, previous: 2680 },
    outboundQuantity: { current: 2570, previous: 2410 }
  },
  {
    store: 'Shopify-01',
    region: 'Punjab',
    totalInventoryValue: { current: 4250000, previous: 3920000 },
    totalProducts: { current: 1290, previous: 1215 },
    stockoutProducts: { current: 21, previous: 25 },
    reorderProducts: { current: 66, previous: 61 },
    inboundQuantity: { current: 3310, previous: 3020 },
    outboundQuantity: { current: 2890, previous: 2700 }
  },
  {
    store: 'WOO-01',
    region: 'Khyber Pakhtunkhwa',
    totalInventoryValue: { current: 2910000, previous: 2780000 },
    totalProducts: { current: 980, previous: 940 },
    stockoutProducts: { current: 32, previous: 36 },
    reorderProducts: { current: 71, previous: 67 },
    inboundQuantity: { current: 2480, previous: 2320 },
    outboundQuantity: { current: 2190, previous: 2080 }
  },
  {
    store: 'Shopify-02',
    region: 'Balochistan',
    totalInventoryValue: { current: 3380000, previous: 3090000 },
    totalProducts: { current: 1085, previous: 1032 },
    stockoutProducts: { current: 24, previous: 29 },
    reorderProducts: { current: 58, previous: 54 },
    inboundQuantity: { current: 2670, previous: 2440 },
    outboundQuantity: { current: 2410, previous: 2260 }
  },
  {
    store: 'Shopify-03',
    region: 'Gilgit Baltistan',
    totalInventoryValue: { current: 3590000, previous: 3310000 },
    totalProducts: { current: 1210, previous: 1158 },
    stockoutProducts: { current: 19, previous: 23 },
    reorderProducts: { current: 61, previous: 55 },
    inboundQuantity: { current: 3180, previous: 2870 },
    outboundQuantity: { current: 2760, previous: 2620 }
  }
];

const inventoryDateMultipliers: Record<string, { current: number; previous: number }> = {
  'Last 7 Days': { current: 0.25, previous: 0.22 },
  'Last 30 Days': { current: 1, previous: 0.93 },
  'Last 90 Days': { current: 2.8, previous: 2.55 },
  'Last 365 Days': { current: 11.4, previous: 10.8 },
  Custom: { current: 1, previous: 0.95 }
};
const inventoryDateDayCount: Record<string, number> = {
  'Last 7 Days': 7,
  'Last 30 Days': 30,
  'Last 90 Days': 90,
  'Last 365 Days': 365,
  Custom: 30
};

const inventoryKpiTooltips: Record<string, string | TooltipContent> = {
  'Total Inventory Value':
    'Total monetary value of available inventory in the selected period and filters, with the contributing product count shown below.',
  'Average Fulfillment Rate': {
    title: 'Average Fulfillment Rate',
    blocks: [
      { type: 'text', text: 'Share of outbound fulfillment versus inbound quantity for the selected scope.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Fulfillment Rate (%) = (Quantity Out / Quantity In) x 100' }
    ]
  },
  'Quantity In': 'Total inbound inventory quantity received during the selected period and locations.',
  'Quantity Out': 'Total outbound inventory quantity fulfilled during the selected period and locations.'
};
const inventorySnapshotKpiTooltips: Record<string, string | TooltipContent> = {
  'On-hand': 'Total stock physically present in selected inventory locations.',
  Committed: 'Stock reserved for placed orders and unavailable for new allocation.',
  'Available for Sale': {
    title: 'Available for Sale',
    blocks: [
      { type: 'text', text: 'Sellable stock after deducting committed inventory.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Available for Sale = On-hand - Committed' }
    ]
  },
  'Inbound (Incoming Inventory)': 'Inventory expected to be received from purchase orders or transfers.',
  'Unfulfilled or Damaged': 'Units blocked from fulfillment due to stock constraints or damaged condition.',
  'Stockout Percentage':
    'Share and count of products that stocked out in the selected date range and inventory locations.',
  'Out of Stock Products': 'Total products currently out of stock in selected inventory locations.',
  'Products in Reorder Threshold':
    'Products currently at or below defined reorder threshold in selected inventory locations.'
};
const pakistanLocationHierarchy = [
  {
    province: 'Sindh',
    cities: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas']
  },
  {
    province: 'Punjab',
    cities: ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Bahawalpur']
  },
  {
    province: 'Balochistan',
    cities: ['Quetta', 'Gwadar', 'Khuzdar', 'Turbat', 'Hub']
  },
  {
    province: 'Khyber Pakhtunkhwa',
    cities: ['Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Kohat']
  },
  {
    province: 'Azad Jammu & Kashmir',
    cities: ['Muzaffarabad', 'Mirpur', 'Kotli', 'Bagh', 'Rawalakot']
  },
  {
    province: 'Gilgit Baltistan',
    cities: ['Gilgit', 'Skardu', 'Hunza', 'Khaplu', 'Ghizer']
  }
] as const;
const pakistanProvinceOptions = pakistanLocationHierarchy.map((item) => item.province);

const locationKpiTooltips: Record<string, string | TooltipContent> = {
  'Top Performing City': 'City generating the highest result in the selected metric and period.',
  'Most Improved City': 'City with the strongest positive change versus the previous period.',
  'Most Declined City': 'City with the steepest drop versus the previous period.',
  'Average Orders Per City': {
    title: 'Average Orders Per City',
    blocks: [
      { type: 'text', text: 'Average order volume contributed by each active city.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Average Orders per City = Total Orders / Active Cities' }
    ]
  },
  'Average Gross Sales per City': {
    title: 'Average Gross Sales per City',
    blocks: [
      { type: 'text', text: 'Average gross sales contributed by each active city in the selected period.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Average Gross Sales per City = Total Gross Sales / Active Cities' }
    ]
  }
};

const locationKpiCards = [
  {
    label: 'Top Performing City',
    value: 'Karachi',
    trend: '14.2%',
    direction: 'up' as const,
    comparison: { current: 'Karachi', previous: 'Lahore', change: '14.2%' }
  },
  {
    label: 'Most Improved City',
    value: 'Lahore',
    trend: '9.8%',
    direction: 'up' as const,
    comparison: { current: 'Lahore', previous: 'Islamabad', change: '9.8%' }
  },
  {
    label: 'Most Declined City',
    value: 'Peshawar',
    trend: '6.1%',
    direction: 'down' as const,
    comparison: { current: 'Peshawar', previous: 'Karachi', change: '6.1%' }
  },
  {
    label: 'Average Orders Per City',
    value: '1,000',
    trend: '4.3%',
    direction: 'up' as const,
    comparison: { current: '1,000', previous: '959', change: '41' }
  }
];

const locationPerformanceData = [
  { location: 'Karachi', ordersCurrent: 400, ordersPrevious: 350, revenueCurrent: 4200000, revenuePrevious: 3720000 },
  { location: 'Lahore', ordersCurrent: 350, ordersPrevious: 250, revenueCurrent: 3650000, revenuePrevious: 2840000 },
  { location: 'Islamabad', ordersCurrent: 300, ordersPrevious: 340, revenueCurrent: 3180000, revenuePrevious: 3520000 },
  { location: 'Peshawar', ordersCurrent: 250, ordersPrevious: 187, revenueCurrent: 2540000, revenuePrevious: 1960000 },
  { location: 'Quetta', ordersCurrent: 200, ordersPrevious: 240, revenueCurrent: 2280000, revenuePrevious: 2590000 },
  { location: 'Gilgit', ordersCurrent: 180, ordersPrevious: 120, revenueCurrent: 2010000, revenuePrevious: 1460000 },
  { location: 'Hub', ordersCurrent: 160, ordersPrevious: 180, revenueCurrent: 1760000, revenuePrevious: 1930000 },
  { location: 'Kashmir', ordersCurrent: 140, ordersPrevious: 150, revenueCurrent: 1620000, revenuePrevious: 1710000 },
  { location: 'Bahawalpur', ordersCurrent: 120, ordersPrevious: 140, revenueCurrent: 1380000, revenuePrevious: 1520000 },
  { location: 'Rawalpindi', ordersCurrent: 100, ordersPrevious: 55, revenueCurrent: 1140000, revenuePrevious: 760000 }
];

const locationMetricConfig: Record<
  string,
  {
    currentKey: 'ordersCurrent' | 'revenueCurrent';
    previousKey: 'ordersPrevious' | 'revenuePrevious';
    axisMax: number;
    stepSize: number;
  tickFormatter: (value: number) => string;
    tooltipFormatter: (value: number) => string;
  }
> = {
  'Orders Volume': {
    currentKey: 'ordersCurrent',
    previousKey: 'ordersPrevious',
    axisMax: 420,
    stepSize: 100,
    tickFormatter: (value) => value.toFixed(0),
    tooltipFormatter: (value) => value.toLocaleString('en-US')
  },
  'Gross Sales': {
    currentKey: 'revenueCurrent',
    previousKey: 'revenuePrevious',
    axisMax: 4500000,
    stepSize: 1000000,
    tickFormatter: (value) => `PKR ${(value / 1000000).toFixed(1)}M`,
    tooltipFormatter: (value) => `PKR ${value.toLocaleString('en-US')}`
  }
};

const productMetricOptions = ['Units Sold', 'Gross Sales'];
const productDateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

const productKpiTooltips: Record<string, string | TooltipContent> = {
  'Total Units Sold': 'Total units sold across the selected products and period.',
  'Total Gross Sales': 'Total gross sales across the selected products and period.',
  'Best Selling Product': 'Product with the highest units sold in the selected period.',
  'Top Gross Sales Product': 'Product generating the highest gross sales in the selected period.',
  'Most Improved Product': 'Product with the strongest positive change in units sold.',
  'Most Improved Gross Sales Product': 'Product with the strongest positive gross sales change in the selected period.',
  'Most Declined Product': 'Product with the sharpest decline in units sold.',
  'Most Declined Gross Sales Product': 'Product with the sharpest gross sales decline in the selected period.',
  'Avg. Units Sold Per Order': {
    title: 'Avg. Units Sold Per Order',
    blocks: [
      { type: 'text', text: 'Average units sold per order across the selected products.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Avg. Units Sold per Order = Total Units Sold / Total Orders' }
    ]
  },
  'Avg. Gross Sales Per Product': {
    title: 'Avg. Gross Sales Per Product',
    blocks: [
      { type: 'text', text: 'Average gross sales per product across the selected products.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Avg. Gross Sales Per Product = Total Gross Sales / Total Products' }
    ]
  }
};

const productPerformanceData = [
  { product: 'Core Tee', unitsCurrent: 70, unitsPrevious: 60, revenueCurrent: 980000, revenuePrevious: 845000 },
  { product: 'Fleece Hoodie', unitsCurrent: 68, unitsPrevious: 50, revenueCurrent: 1240000, revenuePrevious: 910000 },
  { product: 'Runner Pro', unitsCurrent: 60, unitsPrevious: 54, revenueCurrent: 1120000, revenuePrevious: 1015000 },
  { product: 'Travel Pack', unitsCurrent: 55, unitsPrevious: 16, revenueCurrent: 1360000, revenuePrevious: 420000 },
  { product: 'Canvas Tote', unitsCurrent: 50, unitsPrevious: 40, revenueCurrent: 760000, revenuePrevious: 640000 },
  { product: 'Earbuds X', unitsCurrent: 49, unitsPrevious: 61, revenueCurrent: 1480000, revenuePrevious: 1710000 },
  { product: 'Denim Jacket', unitsCurrent: 45, unitsPrevious: 37, revenueCurrent: 1180000, revenuePrevious: 980000 },
  { product: 'Leather Wallet', unitsCurrent: 32, unitsPrevious: 25, revenueCurrent: 540000, revenuePrevious: 410000 },
  { product: 'Smart Watch', unitsCurrent: 29, unitsPrevious: 35, revenueCurrent: 1320000, revenuePrevious: 1480000 },
  { product: 'Steel Bottle', unitsCurrent: 27, unitsPrevious: 17, revenueCurrent: 470000, revenuePrevious: 290000 }
];

const productMetricConfig: Record<
  string,
  {
    currentKey: 'unitsCurrent' | 'revenueCurrent';
    previousKey: 'unitsPrevious' | 'revenuePrevious';
    axisMax: number;
    stepSize: number;
    tickFormatter: (value: number) => string;
    tooltipFormatter: (value: number) => string;
  }
> = {
  'Units Sold': {
    currentKey: 'unitsCurrent',
    previousKey: 'unitsPrevious',
    axisMax: 75,
    stepSize: 10,
    tickFormatter: (value) => value.toFixed(0),
    tooltipFormatter: (value) => value.toLocaleString('en-US')
  },
  'Gross Sales': {
    currentKey: 'revenueCurrent',
    previousKey: 'revenuePrevious',
    axisMax: 1600000,
    stepSize: 200000,
    tickFormatter: (value) => `PKR ${(value / 1000000).toFixed(1)}M`,
    tooltipFormatter: (value) => `PKR ${value.toLocaleString('en-US')}`
  }
};

const salesChartLabels = [
  '1 Apr',
  '3 Apr',
  '5 Apr',
  '7 Apr',
  '9 Apr',
  '11 Apr',
  '13 Apr',
  '15 Apr',
  '17 Apr',
  '19 Apr',
  '21 Apr',
  '23 Apr',
  '25 Apr',
  '27 Apr',
  '29 Apr'
];

const storeSeries = [
  {
    name: 'Daraz-02',
    color: '#22B8C5',
    grossRevenue: [71000, 94000, 72000, 83000, 78000, 79000, 66000, 22000, 58000, 29000, 64000, 55000, 73000, 63000, 67000],
    orderReturns: [420, 860, 510, 740, 620, 790, 670, 230, 540, 310, 690, 570, 760, 640, 810],
    unitsSold: [140, 820, 210, 360, 435, 690, 720, 560, 670, 610, 745, 702, 888, 952, 434]
  },
  {
    name: 'Shopify-01',
    color: '#F97316',
    grossRevenue: [34000, 95000, 21000, 79000, 41000, 100000, 81000, 70000, 37000, 72000, 27000, 69000, 23000, 53000, 34000],
    orderReturns: [280, 910, 190, 760, 340, 980, 820, 690, 260, 720, 210, 660, 180, 470, 290],
    unitsSold: [520, 890, 430, 810, 560, 940, 860, 780, 510, 805, 440, 730, 460, 610, 525]
  },
  {
    name: 'WOO-01',
    color: '#9D7AE5',
    grossRevenue: [91000, 43000, 49000, 40000, 68000, 34000, 71000, 26000, 23000, 21000, 66000, 24000, 74000, 93000, 91000],
    orderReturns: [760, 330, 420, 390, 610, 280, 670, 240, 210, 190, 640, 220, 710, 880, 790],
    unitsSold: [860, 610, 640, 590, 760, 540, 790, 470, 430, 410, 772, 450, 804, 895, 870]
  },
  {
    name: 'Shopify-02',
    color: '#4FE3D5',
    grossRevenue: [80000, 22000, 57000, 52000, 78000, 81000, 74000, 40000, 79000, 79000, 54000, 21000, 82000, 81000, 98000],
    orderReturns: [690, 170, 520, 460, 710, 760, 690, 360, 730, 720, 490, 180, 790, 770, 930],
    unitsSold: [780, 360, 640, 615, 805, 820, 790, 520, 812, 818, 626, 355, 840, 826, 968]
  },
  {
    name: 'Shopify-03',
    color: '#D946EF',
    grossRevenue: [40000, 41000, 21000, 95000, 61000, 81000, 83000, 92000, 33000, 90000, 97000, 25000, 37000, 33000, 81000],
    orderReturns: [310, 340, 180, 900, 560, 760, 790, 870, 250, 850, 920, 210, 300, 260, 780],
    unitsSold: [540, 560, 390, 910, 700, 815, 836, 902, 500, 888, 940, 410, 520, 485, 820]
  }
];

const dayBreakdown = [
  {
    date: 'May 12, 2023',
    stores: [
      { name: 'Daraz-02', totalOrders: 98, grossRevenue: 1350000, orderReturns: 420, unitsSold: 640, color: '#22B8C5' },
      { name: 'Shopify-01', totalOrders: 47, grossRevenue: 2410445, orderReturns: 280, unitsSold: 520, color: '#F97316' },
      { name: 'WOO-01', totalOrders: 47, grossRevenue: 1324350, orderReturns: 760, unitsSold: 860, color: '#9D7AE5' },
      { name: 'Shopify-02', totalOrders: 71, grossRevenue: 1311785, orderReturns: 690, unitsSold: 780, color: '#4FE3D5' },
      { name: 'Shopify-03', totalOrders: 100, grossRevenue: 1311785, orderReturns: 310, unitsSold: 540, color: '#D946EF' }
    ]
  },
  {
    date: 'May 14, 2023',
    stores: [
      { name: 'Daraz-02', totalOrders: 84, grossRevenue: 1145200, orderReturns: 740, unitsSold: 760, color: '#22B8C5' },
      { name: 'Shopify-01', totalOrders: 42, grossRevenue: 2088410, orderReturns: 340, unitsSold: 560, color: '#F97316' },
      { name: 'WOO-01', totalOrders: 50, grossRevenue: 1402780, orderReturns: 610, unitsSold: 760, color: '#9D7AE5' },
      { name: 'Shopify-02', totalOrders: 68, grossRevenue: 1274300, orderReturns: 710, unitsSold: 805, color: '#4FE3D5' },
      { name: 'Shopify-03', totalOrders: 92, grossRevenue: 1254600, orderReturns: 560, unitsSold: 700, color: '#D946EF' }
    ]
  },
  {
    date: 'May 16, 2023',
    stores: [
      { name: 'Daraz-02', totalOrders: 76, grossRevenue: 1010000, orderReturns: 670, unitsSold: 720, color: '#22B8C5' },
      { name: 'Shopify-01', totalOrders: 51, grossRevenue: 2220110, orderReturns: 820, unitsSold: 860, color: '#F97316' },
      { name: 'WOO-01', totalOrders: 45, grossRevenue: 1280120, orderReturns: 670, unitsSold: 790, color: '#9D7AE5' },
      { name: 'Shopify-02', totalOrders: 74, grossRevenue: 1410000, orderReturns: 690, unitsSold: 790, color: '#4FE3D5' },
      { name: 'Shopify-03', totalOrders: 105, grossRevenue: 1522900, orderReturns: 790, unitsSold: 836, color: '#D946EF' }
    ]
  }
];

const storeChartMetricConfig: Record<
  string,
  {
    key: StoreChartMetricKey;
    label: string;
    formatValue: (value: number) => string;
    axisMax: number;
    stepSize: number;
    tickFormatter: (value: number) => string;
  }
> = {
  'Gross Sales': {
    key: 'grossRevenue',
    label: 'Gross Sales',
    formatValue: (value) => `PKR ${value.toLocaleString('en-US')}`,
    axisMax: 110000,
    stepSize: 20000,
    tickFormatter: (value) => `PKR ${(value / 1000).toFixed(1)}`
  },
  'Order Returns': {
    key: 'orderReturns',
    label: 'Order Returns',
    formatValue: (value) => value.toLocaleString('en-US'),
    axisMax: 1000,
    stepSize: 200,
    tickFormatter: (value) => value.toFixed(0)
  },
  'Units Sold': {
    key: 'unitsSold',
    label: 'Units Sold',
    formatValue: (value) => value.toLocaleString('en-US'),
    axisMax: 1000,
    stepSize: 200,
    tickFormatter: (value) => value.toFixed(0)
  }
};

const trendPopoverContent: Record<
  MetricKey,
  {
    currentLabel: string;
    currentValue: string;
    currentDate: string;
    previousLabel: string;
    previousValue: string;
    previousDate: string;
    changeValue: string;
    changePercent: string;
    direction: 'up' | 'down';
  }
> = {
  netSales: {
    currentLabel: 'Current Net Sales',
    currentValue: 'PKR 200,000',
    currentDate: '30/Sep/25',
    previousLabel: 'Previous Net Sales',
    previousValue: 'PKR 100,000',
    previousDate: '29/Sep/25',
    changeValue: 'PKR 100,000',
    changePercent: '100%',
    direction: 'up'
  },
  cogs: {
    currentLabel: 'Current COGS',
    currentValue: 'PKR 76,544',
    currentDate: '30/Sep/25',
    previousLabel: 'Previous COGS',
    previousValue: 'PKR 83,200',
    previousDate: '29/Sep/25',
    changeValue: 'PKR 6,656',
    changePercent: '8%',
    direction: 'down'
  },
  expenses: {
    currentLabel: 'Current Expenses',
    currentValue: 'PKR 23,456',
    currentDate: '30/Sep/25',
    previousLabel: 'Previous Expenses',
    previousValue: 'PKR 22,128',
    previousDate: '29/Sep/25',
    changeValue: 'PKR 1,328',
    changePercent: '6%',
    direction: 'up'
  },
  netProfit: {
    currentLabel: 'Current Net Profit',
    currentValue: 'PKR 123,456',
    currentDate: '30/Sep/25',
    previousLabel: 'Previous Net Profit',
    previousValue: 'PKR 108,295',
    previousDate: '29/Sep/25',
    changeValue: 'PKR 15,161',
    changePercent: '14%',
    direction: 'up'
  }
};

const formatCustomDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getOrdinalSuffix = (day: number) => {
  const modHundred = day % 100;
  if (modHundred >= 11 && modHundred <= 13) return 'th';
  if (day % 10 === 1) return 'st';
  if (day % 10 === 2) return 'nd';
  if (day % 10 === 3) return 'rd';
  return 'th';
};

const formatTooltipPeriodDate = (date: Date) => {
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
};

const getFilteredOptions = (options: string[], query: string) => {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) return options;
  return options.filter((item) => item.toLowerCase().includes(trimmedQuery));
};

const formatMultiSelectLabel = (selected: string[], placeholder: string, singular: string, plural: string) => {
  if (selected.length === 0) return placeholder;
  if (selected.length === 1) return selected[0];
  return `${selected.length} ${selected.length === 1 ? singular : plural}`;
};

const toggleMultiSelectValue = (current: string[], value: string) =>
  current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

const setMultiSelectGroup = (current: string[], values: string[]) => {
  const allSelected = values.every((value) => current.includes(value));
  if (allSelected) {
    return current.filter((item) => !values.includes(item));
  }

  return [...new Set([...current, ...values])];
};

const formatLocationFilterLabel = (selected: string[]) => {
  if (selected.length === 0) return 'All Locations';
  if (selected.length === pakistanProvinceOptions.length && pakistanProvinceOptions.every((item) => selected.includes(item))) {
    return 'All Provinces';
  }
  if (selected.length === 1) return selected[0];
  return `${selected.length} selected`;
};

const formatStoreMetricValue = (metric: string, value: number) =>
  metric === 'Gross Sales' ? `PKR ${value.toLocaleString('en-US')}` : value.toLocaleString('en-US');

const formatStoreMetricDelta = (metric: string, value: number) =>
  metric === 'Gross Sales' ? `PKR ${Math.abs(value).toLocaleString('en-US')}` : Math.abs(value).toLocaleString('en-US');

const getStoreMetricDirection = (metric: string, current: number, previous: number) => {
  if (metric === 'Order Returns') {
    return current <= previous ? ('down' as const) : ('up' as const);
  }

  return current >= previous ? ('up' as const) : ('down' as const);
};

const getPercentDelta = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return (Math.abs(current - previous) / previous) * 100;
};

const buildInventorySeries = (total: number, dayCount: number, phaseShift: number) => {
  if (dayCount <= 0) return [];

  const weights = Array.from({ length: dayCount }, (_, index) => {
    const progress = dayCount === 1 ? 1 : index / (dayCount - 1);
    const seasonality = 1 + 0.14 * Math.sin((index + phaseShift) * 0.42) + 0.08 * Math.cos((index + phaseShift) * 0.19);
    const trend = 0.9 + progress * 0.22;
    return Math.max(0.15, seasonality * trend);
  });

  const weightTotal = weights.reduce((sum, value) => sum + value, 0);
  const values = weights.map((weight) => Math.round((weight / weightTotal) * total));
  const allocated = values.reduce((sum, value) => sum + value, 0);
  values[values.length - 1] = Math.max(0, values[values.length - 1] + (total - allocated));
  return values;
};

function InfoTooltip({
  text,
  widthClass = 'tu-w-[190px]'
}: {
  text?: string | TooltipContent;
  widthClass?: string;
}) {
  if (!text) return null;

  return (
    <div
      className={`tu-pointer-events-none tu-absolute tu-bottom-[calc(100%+8px)] tu-left-0 tu-z-30 ${widthClass} tu-rounded-md tu-bg-[#111111] tu-px-2.5 tu-py-2 tu-text-[11px] tu-leading-4 tu-text-white tu-opacity-0 tu-shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-opacity group-hover/tooltip:tu-opacity-100`}
    >
      {typeof text === 'string' ? (
        text
      ) : (
        <div className="tu-space-y-0">
          {text.title ? <p className="tu-mb-2 tu-text-[13px] tu-font-semibold tu-leading-5">{text.title}</p> : null}
          {text.blocks.map((block, index) => {
            if (block.type === 'spacer') {
              return <div key={`spacer-${index}`} className="tu-h-2" />;
            }

            if (block.type === 'formula') {
              return (
                <p
                  key={`formula-${index}`}
                  className="tu-rounded-[8px] tu-bg-white/10 tu-px-3 tu-py-2 tu-text-[11px] tu-font-medium tu-leading-5 tu-text-[#f2f4f1]"
                >
                  {block.text}
                </p>
              );
            }

            return (
              <p key={`text-${index}`} className="tu-leading-5">
                {block.text}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ComparisonPopover({
  comparison,
  trend,
  direction
}: {
  comparison: ComparisonData;
  trend: string;
  direction: 'up' | 'down';
}) {
  const TrendIcon = direction === 'up' ? ArrowUpRight : ArrowDownRight;
  const trendColor = direction === 'up' ? 'tu-text-[#10c562]' : 'tu-text-[#de524c]';

  return (
    <div className="tu-absolute tu-right-0 tu-bottom-[calc(100%+8px)] tu-z-20 tu-w-[235px] tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-p-0 tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
      <div className="tu-border-b tu-border-[#eceee8] tu-px-4 tu-py-2.5">
        <h3 className="tu-text-[11px] tu-font-semibold tu-text-[#333538]">Current vs Previous Period</h3>
      </div>
      <div className="tu-px-4 tu-py-3">
        <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
          <div>
            <p className="tu-text-[11px] tu-text-[#44464b]">Current</p>
            <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">{comparison.current}</p>
          </div>
          <p className="tu-text-[11px] tu-text-[#44464b]">{comparison.currentPeriodLabel ?? 'Current Period'}</p>
        </div>
        <div className="tu-my-2.5 tu-h-px tu-bg-[#eceee8]" />
        <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
          <div>
            <p className="tu-text-[11px] tu-text-[#44464b]">Previous</p>
            <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">{comparison.previous}</p>
          </div>
          <p className="tu-text-[11px] tu-text-[#44464b]">{comparison.previousPeriodLabel ?? 'Previous Period'}</p>
        </div>
        <div className="tu-my-2.5 tu-h-px tu-bg-[#eceee8]" />
        <div className="tu-flex tu-items-center tu-justify-between tu-gap-3">
          <div>
            <p className="tu-text-[11px] tu-font-semibold tu-text-[#333538]">Change</p>
            <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">{comparison.change}</p>
          </div>
          <div className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[11px] tu-font-semibold ${trendColor}`}>
            <TrendIcon className="tu-h-3.5 tu-w-3.5" />
            <span>{trend}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchableDropdownMenu({
  open,
  options,
  selected,
  onSelect,
  searchValue,
  onSearchChange,
  multiSelect = false,
  searchable = true,
  widthClass = 'tu-w-[190px]',
  showChevronForCustom = false
}: {
  open: boolean;
  options: string[];
  selected: string | string[];
  onSelect: (value: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  multiSelect?: boolean;
  searchable?: boolean;
  widthClass?: string;
  showChevronForCustom?: boolean;
}) {
  if (!open) return null;

  const filteredOptions = searchable ? getFilteredOptions(options, searchValue ?? '') : options;
  const selectedValues = Array.isArray(selected) ? selected : [selected];

  return (
    <div
      className={`tu-absolute tu-right-0 tu-top-[calc(100%+10px)] tu-z-30 ${widthClass} tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-p-2.5 tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]`}
    >
      {searchable ? (
        <div className="tu-relative">
          <Search className="tu-pointer-events-none tu-absolute tu-left-3 tu-top-1/2 tu-h-3.5 tu-w-3.5 -tu-translate-y-1/2 tu-text-[#9a9ca2]" />
          <input
            value={searchValue ?? ''}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search"
            className="tu-h-9 tu-w-full tu-rounded-[10px] tu-border tu-border-[#e1e6de] tu-bg-[#fafbf8] tu-pl-9 tu-pr-3 tu-text-[12px] tu-text-[#2f3133] outline-none placeholder:tu-text-[#9a9ca2] focus:tu-border-[#c6d3c1]"
          />
        </div>
      ) : null}

      <div className={`${searchable ? 'tu-mt-2' : ''} tu-max-h-[220px] tu-space-y-1 tu-overflow-y-auto`}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((item) => {
            const isSelected = selectedValues.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelect(item)}
                className={`tu-flex tu-w-full tu-items-center tu-justify-between tu-rounded-[10px] tu-px-3 tu-py-2.5 tu-text-left tu-text-[13px] tu-transition hover:tu-bg-[#f5f6f3] ${
                  isSelected ? 'tu-bg-[#f5f6f3] tu-text-[#2a2c2f]' : 'tu-text-[#2f3133]'
                }`}
              >
                <div className="tu-flex tu-items-center tu-gap-2.5">
                  {multiSelect ? (
                    <span
                      className={`tu-flex tu-h-4 tu-w-4 tu-items-center tu-justify-center tu-rounded-[4px] tu-border ${
                        isSelected ? 'tu-border-[#10c562] tu-bg-[#10c562]' : 'tu-border-[#cfd7cd] tu-bg-white'
                      }`}
                    >
                      {isSelected ? <span className="tu-h-1.5 tu-w-1.5 tu-rounded-full tu-bg-white" /> : null}
                    </span>
                  ) : null}
                  <span>{item}</span>
                </div>
                {showChevronForCustom && item === 'Custom' ? (
                  <ChevronRight className="tu-h-3.5 tu-w-3.5 tu-text-[#9d9ea2]" />
                ) : null}
              </button>
            );
          })
        ) : (
          <div className="tu-rounded-[10px] tu-bg-[#fafbf8] tu-px-3 tu-py-2.5 tu-text-[12px] tu-text-[#8f9197]">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}

function HierarchicalLocationDropdown({
  open,
  selected,
  onChange,
  searchValue,
  onSearchChange,
  activeProvince,
  onProvinceChange,
  widthClass = 'tu-w-[240px]'
}: {
  open: boolean;
  selected: string[];
  onChange: (value: string[]) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeProvince: string | null;
  onProvinceChange: (value: string | null) => void;
  widthClass?: string;
}) {
  if (!open) return null;

  const provinceRecord = pakistanLocationHierarchy.find((item) => item.province === activeProvince);
  const currentOptions = provinceRecord ? provinceRecord.cities : pakistanProvinceOptions;
  const filteredOptions = getFilteredOptions(currentOptions as unknown as string[], searchValue);
  const selectAllItems = [...currentOptions];
  const allCurrentSelected = selectAllItems.every((item) => selected.includes(item));
  const searchPlaceholder = provinceRecord ? `Search ${provinceRecord.province} cities` : 'Search provinces';

  return (
    <div
      className={`tu-absolute tu-right-0 tu-top-[calc(100%+8px)] tu-z-30 ${widthClass} tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-p-2 tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]`}
    >
      <div className="tu-sticky tu-top-0 tu-z-10 tu-rounded-[10px] tu-bg-white">
        <div className="tu-flex tu-items-center tu-justify-between tu-gap-2 tu-px-1 tu-pb-2">
          {provinceRecord ? (
            <button
              type="button"
              onClick={() => {
                onProvinceChange(null);
                onSearchChange('');
              }}
              className="tu-inline-flex tu-items-center tu-gap-1 tu-text-[11px] tu-font-medium tu-text-[#5f656c] hover:tu-text-[#2a2c2f]"
            >
              <ChevronLeft className="tu-h-3.5 tu-w-3.5" />
              <span>Provinces</span>
            </button>
          ) : (
            <span className="tu-text-[11px] tu-font-semibold tu-uppercase tu-tracking-[0.12em] tu-text-[#8f9197]">
              Provinces
            </span>
          )}
          <span className="tu-text-[11px] tu-font-medium tu-text-[#8f9197]">
            {provinceRecord ? provinceRecord.province : `${pakistanProvinceOptions.length} total`}
          </span>
        </div>

        <div className="tu-relative">
          <Search className="tu-pointer-events-none tu-absolute tu-left-3 tu-top-1/2 tu-h-3.5 tu-w-3.5 -tu-translate-y-1/2 tu-text-[#9a9ca2]" />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="tu-h-8 tu-w-full tu-rounded-[10px] tu-border tu-border-[#e1e6de] tu-bg-[#fafbf8] tu-pl-9 tu-pr-3 tu-text-[12px] tu-text-[#2f3133] outline-none placeholder:tu-text-[#9a9ca2] focus:tu-border-[#c6d3c1]"
          />
        </div>

        <button
          type="button"
          onClick={() => onChange(setMultiSelectGroup(selected, selectAllItems as unknown as string[]))}
          className="tu-mt-2 tu-flex tu-w-full tu-items-center tu-gap-2.5 tu-rounded-[10px] tu-bg-[#f5f6f3] tu-px-3 tu-py-2 tu-text-left tu-text-[12px] tu-font-medium tu-text-[#2f3133]"
        >
          <span
            className={`tu-flex tu-h-4 tu-w-4 tu-items-center tu-justify-center tu-rounded-[4px] tu-border ${
              allCurrentSelected ? 'tu-border-[#10c562] tu-bg-[#10c562]' : 'tu-border-[#cfd7cd] tu-bg-white'
            }`}
          >
            {allCurrentSelected ? <span className="tu-h-1.5 tu-w-1.5 tu-rounded-full tu-bg-white" /> : null}
          </span>
          <span>{provinceRecord ? `Select All Cities` : 'Select All Provinces'}</span>
        </button>
      </div>

      <div className="tu-mt-2 tu-max-h-[180px] tu-space-y-1 tu-overflow-y-auto">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((item) => {
            const isSelected = selected.includes(item);
            const provinceItem = pakistanLocationHierarchy.find((entry) => entry.province === item);

            return (
              <div
                key={item}
                className={`tu-flex tu-items-center tu-justify-between tu-rounded-[10px] tu-px-3 tu-py-2 tu-transition hover:tu-bg-[#f5f6f3] ${
                  isSelected ? 'tu-bg-[#f5f6f3]' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => onChange(toggleMultiSelectValue(selected, item))}
                  className="tu-flex tu-min-w-0 tu-flex-1 tu-items-center tu-gap-2.5 tu-text-left tu-text-[12px] tu-text-[#2f3133]"
                >
                  <span
                    className={`tu-flex tu-h-4 tu-w-4 tu-items-center tu-justify-center tu-rounded-[4px] tu-border ${
                      isSelected ? 'tu-border-[#10c562] tu-bg-[#10c562]' : 'tu-border-[#cfd7cd] tu-bg-white'
                    }`}
                  >
                    {isSelected ? <span className="tu-h-1.5 tu-w-1.5 tu-rounded-full tu-bg-white" /> : null}
                  </span>
                  <span className="tu-truncate">{item}</span>
                </button>

                {provinceItem ? (
                  <button
                    type="button"
                    onClick={() => {
                      onProvinceChange(provinceItem.province);
                      onSearchChange('');
                    }}
                    className="tu-ml-2 tu-inline-flex tu-h-6 tu-w-6 tu-items-center tu-justify-center tu-rounded-[8px] tu-text-[#8f9197] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                    aria-label={`Show cities in ${provinceItem.province}`}
                  >
                    <ChevronRight className="tu-h-3.5 tu-w-3.5" />
                  </button>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="tu-rounded-[10px] tu-bg-[#fafbf8] tu-px-3 tu-py-2.5 tu-text-[12px] tu-text-[#8f9197]">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('sales');
  const [openDateMenu, setOpenDateMenu] = useState<PeriodKey | null>(null);
  const [dateMenuSearch, setDateMenuSearch] = useState('');
  const [customDateCard, setCustomDateCard] = useState<PeriodKey | null>(null);
  const [hoveredMetric, setHoveredMetric] = useState<{ period: PeriodKey; metric: MetricKey } | null>(null);
  const [hoveredTrend, setHoveredTrend] = useState<{ period: PeriodKey; metric: MetricKey } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [openGlanceDateMenu, setOpenGlanceDateMenu] = useState(false);
  const [openStoreMenu, setOpenStoreMenu] = useState(false);
  const [hoveredGlanceKpi, setHoveredGlanceKpi] = useState<string | null>(null);
  const [hoveredSectionSixValue, setHoveredSectionSixValue] = useState<string | null>(null);
  const [openSectionSixCustomerStoreMenu, setOpenSectionSixCustomerStoreMenu] = useState(false);
  const [selectedSectionSixCustomerStores, setSelectedSectionSixCustomerStores] = useState<string[]>([]);
  const [sectionSixCustomerStoreSearch, setSectionSixCustomerStoreSearch] = useState('');
  const [selectedGlanceDate, setSelectedGlanceDate] = useState('This Week');
  const [selectedStore, setSelectedStore] = useState<string[]>([]);
  const [glanceMenuSearch, setGlanceMenuSearch] = useState({ date: '', store: '' });
  const [salesMenus, setSalesMenus] = useState<{
    store: boolean;
    metric: boolean;
    date: boolean;
    region: boolean;
    groupBy: boolean;
  }>({
    store: false,
    metric: false,
    date: false,
    region: false,
    groupBy: false
  });
  const [inventoryMenus, setInventoryMenus] = useState<{ date: boolean; region: boolean }>({
    date: false,
    region: false
  });
  const [selectedInventoryDate, setSelectedInventoryDate] = useState('Last 30 Days');
  const [selectedInventoryRegion, setSelectedInventoryRegion] = useState<string[]>([...inventoryLocationOptions]);
  const [inventoryMenuSearch, setInventoryMenuSearch] = useState({ date: '', region: '' });
  const [inventorySnapshotMenus, setInventorySnapshotMenus] = useState<{ location: boolean; stockoutDate: boolean }>({
    location: false,
    stockoutDate: false
  });
  const [selectedInventorySnapshotLocation, setSelectedInventorySnapshotLocation] = useState<string[]>([
    ...inventoryLocationOptions
  ]);
  const [selectedInventorySnapshotStockoutDate, setSelectedInventorySnapshotStockoutDate] = useState('Last 30 Days');
  const [inventorySnapshotMenuSearch, setInventorySnapshotMenuSearch] = useState({ location: '' });
  const [inventoryMovementMenus, setInventoryMovementMenus] = useState<{
    date: boolean;
    region: boolean;
    status: boolean;
    groupBy: boolean;
  }>({
    date: false,
    region: false,
    status: false,
    groupBy: false
  });
  const [selectedInventoryMovementDate, setSelectedInventoryMovementDate] = useState('Last 30 Days');
  const [selectedInventoryMovementRegion, setSelectedInventoryMovementRegion] = useState<string[]>([...inventoryLocationOptions]);
  const [selectedInventoryStatus, setSelectedInventoryStatus] = useState('On-hand');
  const [selectedInventoryGroupBy, setSelectedInventoryGroupBy] = useState('Days');
  const [inventoryMovementMenuSearch, setInventoryMovementMenuSearch] = useState({
    date: '',
    region: '',
    status: '',
    groupBy: ''
  });
  const [inventoryHealthMenus, setInventoryHealthMenus] = useState<{
    location: boolean;
    date: boolean;
    searchBy: boolean;
    filterType: boolean;
  }>({
    location: false,
    date: false,
    searchBy: false,
    filterType: false
  });
  const [selectedInventoryHealthLocation, setSelectedInventoryHealthLocation] = useState<string[]>([...inventoryLocationOptions]);
  const [selectedInventoryHealthDate, setSelectedInventoryHealthDate] = useState('Last 30 Days');
  const [selectedInventoryHealthSearchField, setSelectedInventoryHealthSearchField] = useState<InventoryHealthSearchField>('name');
  const [inventoryHealthMenuSearch, setInventoryHealthMenuSearch] = useState({
    location: '',
    date: '',
    searchBy: '',
    filterType: '',
    tags: '',
    category: '',
    brand: ''
  });
  const [activeInventoryHealthFilters, setActiveInventoryHealthFilters] = useState<InventoryHealthFilterKey[]>([]);
  const [selectedInventoryHealthFilters, setSelectedInventoryHealthFilters] = useState<
    Record<InventoryHealthFilterKey, string[]>
  >({
    tags: [],
    category: [],
    brand: []
  });
  const [openInventoryHealthFilterPill, setOpenInventoryHealthFilterPill] = useState<InventoryHealthFilterKey | null>(null);
  const [inventoryHealthSearchTerm, setInventoryHealthSearchTerm] = useState('');
  const [inventoryHealthSort, setInventoryHealthSort] = useState<{ key: InventoryHealthSortKey; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  });
  const [selectedDeadStockAgingDays, setSelectedDeadStockAgingDays] = useState('90');
  const [deadStockAgingMenuOpen, setDeadStockAgingMenuOpen] = useState(false);
  const [inventoryHealthHeaderTooltip, setInventoryHealthHeaderTooltip] = useState<{
    key: string;
    x: number;
    y: number;
  } | null>(null);
  const [inventoryHealthColumns, setInventoryHealthColumns] = useState<InventoryHealthColumnConfig[]>(
    inventoryHealthColumnBlueprint.map((column) => ({ ...column, visible: true }))
  );
  const [draggedInventoryHealthColumnKey, setDraggedInventoryHealthColumnKey] = useState<InventoryHealthSortKey | null>(null);
  const [selectedSalesStore, setSelectedSalesStore] = useState<string[]>(salesStoreOptions);
  const [selectedSalesMetric, setSelectedSalesMetric] = useState('Gross Sales');
  const [selectedSalesDate, setSelectedSalesDate] = useState('Last 30 Days');
  const [selectedSalesGroupBy, setSelectedSalesGroupBy] = useState('Days');
  const [selectedSalesRegion, setSelectedSalesRegion] = useState<string[]>([...pakistanProvinceOptions]);
  const [salesMenuSearch, setSalesMenuSearch] = useState({ store: '', metric: '', date: '', region: '', groupBy: '' });
  const [salesRegionProvince, setSalesRegionProvince] = useState<string | null>(null);
  const [locationMenus, setLocationMenus] = useState<{ metric: boolean; date: boolean; region: boolean }>({
    metric: false,
    date: false,
    region: false
  });
  const [selectedLocationMetric, setSelectedLocationMetric] = useState('Orders Volume');
  const [selectedLocationDate, setSelectedLocationDate] = useState('Last 30 Days');
  const [selectedLocationRegion, setSelectedLocationRegion] = useState<string[]>([...pakistanProvinceOptions]);
  const [locationMenuSearch, setLocationMenuSearch] = useState({ metric: '', date: '', region: '' });
  const [locationRegionProvince, setLocationRegionProvince] = useState<string | null>(null);
  const [productMenus, setProductMenus] = useState<{ metric: boolean; date: boolean; region: boolean }>({
    metric: false,
    date: false,
    region: false
  });
  const [selectedProductMetric, setSelectedProductMetric] = useState('Units Sold');
  const [selectedProductDate, setSelectedProductDate] = useState('Last 30 Days');
  const [selectedProductRegion, setSelectedProductRegion] = useState<string[]>([...pakistanProvinceOptions]);
  const [productMenuSearch, setProductMenuSearch] = useState({ metric: '', date: '', region: '' });
  const [productRegionProvince, setProductRegionProvince] = useState<string | null>(null);
  const [hoveredSalesPoint, setHoveredSalesPoint] = useState<{ x: number; y: number; dataIndex: number } | null>(null);
  const [hoveredInventoryKpi, setHoveredInventoryKpi] = useState<string | null>(null);
  const [hoveredInventoryMovementKpi, setHoveredInventoryMovementKpi] = useState<string | null>(null);
  const [hoveredInventoryMovementPoint, setHoveredInventoryMovementPoint] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);
  const [hoveredInventoryValuePoint, setHoveredInventoryValuePoint] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);
  const [hoveredSalesKpi, setHoveredSalesKpi] = useState<string | null>(null);
  const [hoveredLocationKpi, setHoveredLocationKpi] = useState<string | null>(null);
  const [hoveredProductKpi, setHoveredProductKpi] = useState<string | null>(null);
  const [cardDates, setCardDates] = useState<
    Record<PeriodKey, { title: string; dateLabel: string; from: string; to: string }>
  >({
    today: { title: 'Today', dateLabel: 'May 12, 2024', from: '2024-05-12', to: '2024-05-12' },
    yesterday: { title: 'Yesterday', dateLabel: 'May 11, 2024', from: '2024-05-11', to: '2024-05-11' },
    last7: { title: 'Last 7 Days', dateLabel: 'May 05, 2024 - May 12, 2024', from: '2024-05-05', to: '2024-05-12' },
    last30: { title: 'Last 30 Days', dateLabel: 'Apr 13, 2024 - May 12, 2024', from: '2024-04-13', to: '2024-05-12' },
    last90: { title: 'Last 90 Days', dateLabel: 'Feb 13, 2024 - May 12, 2024', from: '2024-02-13', to: '2024-05-12' },
    last365: { title: 'Last 365 Days', dateLabel: 'May 13, 2023 - May 12, 2024', from: '2023-05-13', to: '2024-05-12' }
  });

  const sidebarItems = [
    { label: 'Overview', icon: LayoutGrid, active: true },
    { label: 'Orders', icon: ShoppingBag },
    { label: 'Courier', icon: Truck },
    { label: 'Catalog', icon: Package2 },
    { label: 'Settings', icon: Settings }
  ];

  const applyDatePreset = (periodKey: PeriodKey, presetKey: keyof typeof datePresets) => {
    const preset = datePresets[presetKey];
    setCardDates((current) => ({
      ...current,
      [periodKey]: {
        ...current[periodKey],
        title: preset.title,
        dateLabel: preset.dateLabel
      }
    }));
    setOpenDateMenu(null);
    setCustomDateCard(null);
    setDateMenuSearch('');
  };

  const applyCustomDateRange = (periodKey: PeriodKey) => {
    setCardDates((current) => ({
      ...current,
      [periodKey]: {
        ...current[periodKey],
        title: 'Custom',
        dateLabel: `${formatCustomDate(current[periodKey].from)} - ${formatCustomDate(current[periodKey].to)}`
      }
    }));
    setOpenDateMenu(null);
    setCustomDateCard(null);
    setDateMenuSearch('');
  };

  const activeSalesStoreSeries = useMemo(
    () => storeSeries.filter((series) => selectedSalesStore.includes(series.name)),
    [selectedSalesStore]
  );
  const selectedStoreMetricConfig = storeChartMetricConfig[selectedSalesMetric];
  const selectedGlancePeriodKey: PeriodKey =
    selectedGlanceDate === 'Last 365 Days'
      ? 'last365'
      : selectedGlanceDate === 'Last 90 Days'
        ? 'last90'
        : selectedGlanceDate === 'Last 30 Days'
      ? 'last30'
      : selectedGlanceDate === 'This Week' || selectedGlanceDate === 'Last 7 Days'
        ? 'last7'
        : selectedGlanceDate === 'Yesterday'
          ? 'yesterday'
          : 'today';
  const sectionSixMetricSections = useMemo(
    () =>
      sectionSixMetricSectionsBase.map((metricSection) => ({
        ...metricSection,
        metrics: metricSection.metrics.map((metric) => ({
          ...metric,
          value: scaleMetricValueByPeriod(metric.value, selectedGlancePeriodKey),
          comparison: scaleComparisonByPeriod(metric.comparison, selectedGlancePeriodKey)
        }))
      })),
    [selectedGlancePeriodKey]
  );
  const salesOrderRibbonMetrics = useMemo(() => {
    const ordersSection = sectionSixMetricSections.find((section) => section.title === 'Orders');
    if (!ordersSection) return [];

    const orderMetricLabelMap: Record<string, string> = {
      'Booked Orders': 'Total Orders',
      'Total Shipped': 'Total Shipped',
      'Total Delivered': 'Total Delivered',
      'Total Delivery Failed': 'Total Delivery Failed'
    };

    return ordersSection.metrics.map((metric) => ({
      label: orderMetricLabelMap[metric.label] ?? metric.label,
      value: metric.value
    }));
  }, [sectionSixMetricSections]);
  const dynamicSalesMetricCards = useMemo(() => {
    const currentSnapshot = dayBreakdown[dayBreakdown.length - 1]?.stores.filter((store) => selectedSalesStore.includes(store.name)) ?? [];
    const previousSnapshot = dayBreakdown[dayBreakdown.length - 2]?.stores.filter((store) => selectedSalesStore.includes(store.name)) ?? [];

    const totalOrdersCurrent = currentSnapshot.reduce((sum, store) => sum + store.totalOrders, 0);
    const totalOrdersPrevious = previousSnapshot.reduce((sum, store) => sum + store.totalOrders, 0);
    const totalOrdersDirection = totalOrdersCurrent >= totalOrdersPrevious ? ('up' as const) : ('down' as const);
    const totalOrdersTrend = `${getPercentDelta(totalOrdersCurrent, totalOrdersPrevious).toFixed(1)}%`;

    const metricKey = selectedStoreMetricConfig.key;
    const metricLabelMap = {
      grossRevenue: {
        total: 'Total Gross Sales',
        top: 'Highest Store Gross Sales',
        average: 'Average Gross Sales per Store',
        peak: 'Peak Gross Sales Day'
      },
      orderReturns: {
        total: 'Total Order Returns',
        top: 'Highest Store Returns',
        average: 'Average Returns per Store',
        peak: 'Peak Returns Day'
      },
      unitsSold: {
        total: 'Total Units Sold',
        top: 'Top Store by Units Sold',
        average: 'Average Units Sold per Store',
        peak: 'Peak Units Sold Day'
      }
    } as const;

    const metricLabels = metricLabelMap[metricKey];
    const currentMetricTotal = currentSnapshot.reduce((sum, store) => sum + store[metricKey], 0);
    const previousMetricTotal = previousSnapshot.reduce((sum, store) => sum + store[metricKey], 0);
    const metricDirection = getStoreMetricDirection(selectedSalesMetric, currentMetricTotal, previousMetricTotal);
    const metricTrend = `${getPercentDelta(currentMetricTotal, previousMetricTotal).toFixed(1)}%`;

    const currentAverage = currentSnapshot.length > 0 ? currentMetricTotal / currentSnapshot.length : 0;
    const previousAverage = previousSnapshot.length > 0 ? previousMetricTotal / previousSnapshot.length : 0;
    const averageDirection = getStoreMetricDirection(selectedSalesMetric, currentAverage, previousAverage);
    const averageTrend = `${getPercentDelta(currentAverage, previousAverage).toFixed(1)}%`;

    const sortedCurrentStores = [...currentSnapshot].sort((a, b) => b[metricKey] - a[metricKey]);
    const sortedPreviousStores = [...previousSnapshot].sort((a, b) => b[metricKey] - a[metricKey]);
    const topStoreCurrent = sortedCurrentStores[0];
    const topStorePrevious = sortedPreviousStores[0];
    const topStoreDirection = getStoreMetricDirection(
      selectedSalesMetric,
      topStoreCurrent?.[metricKey] ?? 0,
      topStorePrevious?.[metricKey] ?? 0
    );
    const topStoreTrend = `${getPercentDelta(topStoreCurrent?.[metricKey] ?? 0, topStorePrevious?.[metricKey] ?? 0).toFixed(1)}%`;

    const aggregateSeries = salesChartLabels.map((_, index) =>
      activeSalesStoreSeries.reduce((sum, store) => sum + store[metricKey][index], 0)
    );
    const rankedPeakDays = aggregateSeries
      .map((value, index) => ({ value, label: salesChartLabels[index] }))
      .sort((a, b) => b.value - a.value);
    const topPeakDay = rankedPeakDays[0] ?? { value: 0, label: '-' };
    const previousPeakDay = rankedPeakDays[1] ?? topPeakDay;

    return [
      {
        label: 'Booked Orders',
        value: totalOrdersCurrent.toLocaleString('en-US'),
        trend: totalOrdersTrend,
        direction: totalOrdersDirection,
        comparison: {
          current: totalOrdersCurrent.toLocaleString('en-US'),
          previous: totalOrdersPrevious.toLocaleString('en-US'),
          change: Math.abs(totalOrdersCurrent - totalOrdersPrevious).toLocaleString('en-US')
        }
      },
      {
        label: metricLabels.total,
        value: formatStoreMetricValue(selectedSalesMetric, currentMetricTotal),
        trend: metricTrend,
        direction: metricDirection,
        comparison: {
          current: formatStoreMetricValue(selectedSalesMetric, currentMetricTotal),
          previous: formatStoreMetricValue(selectedSalesMetric, previousMetricTotal),
          change: formatStoreMetricDelta(selectedSalesMetric, currentMetricTotal - previousMetricTotal)
        }
      },
      {
        label: metricLabels.top,
        value: topStoreCurrent?.name ?? 'No store selected',
        trend: topStoreTrend,
        direction: topStoreDirection,
        comparison: {
          current: topStoreCurrent?.name ?? 'No store selected',
          previous: topStorePrevious?.name ?? 'No previous store',
          change: topStoreTrend
        },
        extraStores: sortedCurrentStores.slice(1, 3).map((store) => store.name)
      },
      {
        label: metricLabels.average,
        value: formatStoreMetricValue(selectedSalesMetric, Math.round(currentAverage)),
        trend: averageTrend,
        direction: averageDirection,
        comparison: {
          current: formatStoreMetricValue(selectedSalesMetric, Math.round(currentAverage)),
          previous: formatStoreMetricValue(selectedSalesMetric, Math.round(previousAverage)),
          change: formatStoreMetricDelta(selectedSalesMetric, Math.round(currentAverage - previousAverage))
        }
      },
      {
        label: metricLabels.peak,
        value: topPeakDay.label,
        trend: `${getPercentDelta(topPeakDay.value, previousPeakDay.value).toFixed(1)}%`,
        direction: getStoreMetricDirection(selectedSalesMetric, topPeakDay.value, previousPeakDay.value),
        comparison: {
          current: topPeakDay.label,
          previous: previousPeakDay.label,
          change: `${getPercentDelta(topPeakDay.value, previousPeakDay.value).toFixed(1)}%`
        },
        hideTrend: true
      }
    ];
  }, [activeSalesStoreSeries, selectedSalesMetric, selectedSalesStore, selectedStoreMetricConfig]);

  const salesStoreSummaryLabel =
    selectedSalesStore.length === salesStoreOptions.length
      ? 'All Stores'
      : formatMultiSelectLabel(selectedSalesStore, 'Select Stores', 'store', 'stores');

  const inventoryLocationSummaryLabel =
    selectedInventoryRegion.length === inventoryLocationOptions.length
      ? 'Inventory Locations'
      : formatMultiSelectLabel(selectedInventoryRegion, 'Inventory Locations', 'location', 'locations');

  const activeInventorySnapshots = useMemo(
    () =>
      inventoryStoreSnapshots.filter(
        (snapshot) => selectedInventoryRegion.includes(inventoryStoreLocations[snapshot.store])
      ),
    [selectedInventoryRegion]
  );

  const dynamicInventoryMetricCards = useMemo(() => {
    const multiplier = inventoryDateMultipliers[selectedInventoryDate] ?? inventoryDateMultipliers['Last 30 Days'];

    const aggregate = (
      metricKey: keyof Pick<
        InventoryStoreSnapshot,
        'totalInventoryValue' | 'totalProducts' | 'inboundQuantity' | 'outboundQuantity'
      >
    ) => {
      const current = activeInventorySnapshots.reduce((sum, snapshot) => sum + snapshot[metricKey].current * multiplier.current, 0);
      const previous = activeInventorySnapshots.reduce((sum, snapshot) => sum + snapshot[metricKey].previous * multiplier.previous, 0);
      return { current: Math.round(current), previous: Math.round(previous) };
    };

    const inventoryValue = aggregate('totalInventoryValue');
    const totalProducts = aggregate('totalProducts');
    const quantityIn = aggregate('inboundQuantity');
    const quantityOut = aggregate('outboundQuantity');
    const fulfillmentRateCurrent = quantityIn.current === 0 ? 0 : (quantityOut.current / quantityIn.current) * 100;
    const fulfillmentRatePrevious = quantityIn.previous === 0 ? 0 : (quantityOut.previous / quantityIn.previous) * 100;

    return [
      {
        label: 'Total Inventory Value',
        value: `PKR ${inventoryValue.current.toLocaleString('en-US')}`,
        trend: `${getPercentDelta(inventoryValue.current, inventoryValue.previous).toFixed(1)}%`,
        sublabel: 'vs previous period',
        secondaryLabel: 'Total Products',
        secondaryValue: totalProducts.current.toLocaleString('en-US'),
        direction: inventoryValue.current >= inventoryValue.previous ? ('up' as const) : ('down' as const),
        comparison: {
          current: `PKR ${inventoryValue.current.toLocaleString('en-US')}`,
          previous: `PKR ${inventoryValue.previous.toLocaleString('en-US')}`,
          change: `PKR ${Math.abs(inventoryValue.current - inventoryValue.previous).toLocaleString('en-US')}`
        }
      },
      {
        label: 'Average Fulfillment Rate',
        value: `${fulfillmentRateCurrent.toFixed(1)}%`,
        trend: `${getPercentDelta(fulfillmentRateCurrent, fulfillmentRatePrevious).toFixed(1)}%`,
        sublabel: 'vs previous period',
        secondaryLabel: '',
        secondaryValue: '',
        direction: fulfillmentRateCurrent >= fulfillmentRatePrevious ? ('up' as const) : ('down' as const),
        comparison: {
          current: `${fulfillmentRateCurrent.toFixed(1)}%`,
          previous: `${fulfillmentRatePrevious.toFixed(1)}%`,
          change: `${Math.abs(fulfillmentRateCurrent - fulfillmentRatePrevious).toFixed(1)} pp`
        }
      },
      {
        label: 'Quantity In',
        value: quantityIn.current.toLocaleString('en-US'),
        trend: `${getPercentDelta(quantityIn.current, quantityIn.previous).toFixed(1)}%`,
        sublabel: 'vs previous period',
        secondaryLabel: '',
        secondaryValue: '',
        direction: quantityIn.current >= quantityIn.previous ? ('up' as const) : ('down' as const),
        comparison: {
          current: quantityIn.current.toLocaleString('en-US'),
          previous: quantityIn.previous.toLocaleString('en-US'),
          change: Math.abs(quantityIn.current - quantityIn.previous).toLocaleString('en-US')
        }
      },
      {
        label: 'Quantity Out',
        value: quantityOut.current.toLocaleString('en-US'),
        trend: `${getPercentDelta(quantityOut.current, quantityOut.previous).toFixed(1)}%`,
        sublabel: 'vs previous period',
        secondaryLabel: '',
        secondaryValue: '',
        direction: quantityOut.current >= quantityOut.previous ? ('up' as const) : ('down' as const),
        comparison: {
          current: quantityOut.current.toLocaleString('en-US'),
          previous: quantityOut.previous.toLocaleString('en-US'),
          change: Math.abs(quantityOut.current - quantityOut.previous).toLocaleString('en-US')
        }
      },
    ];
  }, [activeInventorySnapshots, selectedInventoryDate]);

  const inventorySnapshotLocationSummaryLabel =
    selectedInventorySnapshotLocation.length === inventoryLocationOptions.length
      ? 'Inventory Locations'
      : formatMultiSelectLabel(selectedInventorySnapshotLocation, 'Inventory Locations', 'location', 'locations');

  const activeInventorySnapshotStores = useMemo(
    () =>
      inventoryStoreSnapshots.filter((snapshot) =>
        selectedInventorySnapshotLocation.includes(inventoryStoreLocations[snapshot.store])
      ),
    [selectedInventorySnapshotLocation]
  );

  const activeInventorySnapshotHealthProducts = useMemo(
    () => inventoryHealthProducts.filter((product) => selectedInventorySnapshotLocation.includes(product.location)),
    [selectedInventorySnapshotLocation]
  );

  const inventorySnapshotCards = useMemo(() => {
    const sumHealthMetric = (
      metricKey: keyof Pick<
        InventoryHealthProduct,
        'onHandQuantity' | 'committedQuantity' | 'availableQuantity' | 'deadStocks' | 'inventoryAging'
      >
    ) => activeInventorySnapshotHealthProducts.reduce((sum, product) => sum + product[metricKey], 0);

    const onHand = Math.round(sumHealthMetric('onHandQuantity'));
    const committed = Math.round(sumHealthMetric('committedQuantity'));
    const availableForSale = Math.round(sumHealthMetric('availableQuantity'));
    const deadStocks = Math.round(sumHealthMetric('deadStocks'));
    const agingRiskUnits = Math.round(sumHealthMetric('inventoryAging') * 0.1);

    const stockoutMultiplier =
      inventoryDateMultipliers[selectedInventorySnapshotStockoutDate] ?? inventoryDateMultipliers['Last 30 Days'];
    const stockoutProducts = Math.round(
      activeInventorySnapshotStores.reduce(
        (sum, snapshot) => sum + snapshot.stockoutProducts.current * stockoutMultiplier.current,
        0
      )
    );
    const stockoutTotalProducts = Math.round(
      activeInventorySnapshotStores.reduce(
        (sum, snapshot) => sum + snapshot.totalProducts.current * stockoutMultiplier.current,
        0
      )
    );
    const stockoutPercent = stockoutTotalProducts === 0 ? 0 : (stockoutProducts / stockoutTotalProducts) * 100;

    const baseMultiplier = inventoryDateMultipliers['Last 30 Days'].current;
    const inbound = Math.round(
      activeInventorySnapshotStores.reduce((sum, snapshot) => sum + snapshot.inboundQuantity.current * baseMultiplier, 0)
    );
    const unfulfilled = Math.round(deadStocks + agingRiskUnits);
    const outOfStockProducts = Math.round(
      activeInventorySnapshotStores.reduce((sum, snapshot) => sum + snapshot.stockoutProducts.current * baseMultiplier, 0)
    );
    const reorderThresholdProducts = Math.round(
      activeInventorySnapshotStores.reduce((sum, snapshot) => sum + snapshot.reorderProducts.current * baseMultiplier, 0)
    );

    return [
      { label: 'On-hand', value: onHand.toLocaleString('en-US') },
      { label: 'Committed', value: committed.toLocaleString('en-US') },
      { label: 'Available for Sale', value: availableForSale.toLocaleString('en-US') },
      { label: 'Inbound (Incoming Inventory)', value: inbound.toLocaleString('en-US') },
      { label: 'Unfulfilled or Damaged', value: unfulfilled.toLocaleString('en-US') },
      {
        label: 'Stockout Percentage',
        value: `${stockoutPercent.toFixed(1)}%`,
        meta: `${stockoutProducts.toLocaleString('en-US')} products`,
        hasDateFilter: true
      },
      { label: 'Out of Stock Products', value: outOfStockProducts.toLocaleString('en-US') },
      { label: 'Products in Reorder Threshold', value: reorderThresholdProducts.toLocaleString('en-US') }
    ];
  }, [activeInventorySnapshotHealthProducts, activeInventorySnapshotStores, selectedInventorySnapshotStockoutDate]);

  const inventoryValueTrend = useMemo(() => {
    const multiplier = inventoryDateMultipliers[selectedInventoryDate] ?? inventoryDateMultipliers['Last 30 Days'];
    const totalDays = inventoryDateDayCount[selectedInventoryDate] ?? inventoryDateDayCount['Last 30 Days'];
    const currentTotal = Math.round(
      activeInventorySnapshots.reduce((sum, snapshot) => sum + snapshot.totalInventoryValue.current * multiplier.current, 0)
    );
    const previousTotal = Math.round(
      activeInventorySnapshots.reduce((sum, snapshot) => sum + snapshot.totalInventoryValue.previous * multiplier.previous, 0)
    );

    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const currentDates = Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - (totalDays - 1 - index));
      return date;
    });
    const previousDates = currentDates.map((date) => {
      const previousDate = new Date(date);
      previousDate.setDate(date.getDate() - totalDays);
      return previousDate;
    });

    return {
      labels: currentDates.map((date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })),
      currentDates,
      previousDates,
      current: buildInventorySeries(currentTotal, totalDays, 2),
      previous: buildInventorySeries(previousTotal, totalDays, 11)
    };
  }, [activeInventorySnapshots, selectedInventoryDate]);

  const inventoryValueChartData = useMemo(
    () => ({
      labels: inventoryValueTrend.labels,
      datasets: [
        {
          label: 'Current Period',
          data: inventoryValueTrend.current,
          borderColor: '#10c562',
          backgroundColor: '#10c562',
          pointBackgroundColor: '#10c562',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 2.6,
          pointHoverRadius: 4.2,
          borderWidth: 2.2,
          tension: 0.36
        },
        {
          label: 'Previous Period',
          data: inventoryValueTrend.previous,
          borderColor: 'rgba(156,163,175,0.72)',
          backgroundColor: 'rgba(156,163,175,0.72)',
          pointBackgroundColor: 'rgba(156,163,175,0.72)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 2.6,
          pointHoverRadius: 4.2,
          borderWidth: 2.2,
          tension: 0.36,
          borderDash: [7, 6]
        }
      ]
    }),
    [inventoryValueTrend]
  );

  const inventoryValueChartOptions = useMemo(() => {
    const allValues = [...inventoryValueTrend.current, ...inventoryValueTrend.previous];
    const currentMax = allValues.length > 0 ? Math.max(...allValues) : 1000;
    const paddedMax = currentMax * 1.12;
    const roundingBase = paddedMax >= 100000 ? 10000 : paddedMax >= 10000 ? 1000 : 100;
    const dynamicAxisMax = Math.ceil(paddedMax / roundingBase) * roundingBase;
    const dynamicStepSize = Math.max(1, Math.ceil(dynamicAxisMax / 5 / roundingBase) * roundingBase);
    const labelInterval =
      inventoryValueTrend.labels.length > 120
        ? 30
        : inventoryValueTrend.labels.length > 60
          ? 10
          : inventoryValueTrend.labels.length > 30
            ? 5
            : inventoryValueTrend.labels.length > 14
              ? 2
              : 1;

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top' as const,
          align: 'center' as const,
          labels: {
            usePointStyle: true,
            pointStyle: 'circle' as const,
            boxWidth: 8,
            boxHeight: 8,
            color: '#3A3D42',
            font: {
              family: 'Poppins',
              size: 12
            },
            padding: 18
          }
        },
        tooltip: {
          enabled: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#5F6368',
            font: {
              family: 'Poppins',
              size: 11
            },
            maxRotation: 0,
            minRotation: 0,
            callback: (value: string | number, index: number) =>
              index % labelInterval === 0 ? inventoryValueTrend.labels[index] ?? value : ''
          },
          border: {
            display: false
          }
        },
        y: {
          min: 0,
          max: dynamicAxisMax,
          ticks: {
            stepSize: dynamicStepSize,
            color: '#7D828A',
            font: {
              family: 'Poppins',
              size: 10
            },
            callback: (value: string | number) => `PKR ${Number(value).toLocaleString('en-US')}`
          },
          grid: {
            color: '#EEF0EB'
          },
          border: {
            display: false
          }
        }
      },
      onHover: (_event: unknown, elements: { index: number; element: { x: number; y: number } }[]) => {
        if (elements.length > 0) {
          const active = elements[0];
          setHoveredInventoryValuePoint({
            x: active.element.x,
            y: active.element.y,
            index: active.index
          });
        } else {
          setHoveredInventoryValuePoint(null);
        }
      }
    };
  }, [inventoryValueTrend]);

  const inventoryValueTooltipData = hoveredInventoryValuePoint
    ? {
        label: inventoryValueTrend.labels[hoveredInventoryValuePoint.index] ?? '-',
        currentDate: inventoryValueTrend.currentDates[hoveredInventoryValuePoint.index] ?? new Date(),
        previousDate: inventoryValueTrend.previousDates[hoveredInventoryValuePoint.index] ?? new Date(),
        current: inventoryValueTrend.current[hoveredInventoryValuePoint.index] ?? 0,
        previous: inventoryValueTrend.previous[hoveredInventoryValuePoint.index] ?? 0,
        change:
          (inventoryValueTrend.current[hoveredInventoryValuePoint.index] ?? 0) -
          (inventoryValueTrend.previous[hoveredInventoryValuePoint.index] ?? 0),
        changePercent: `${getPercentDelta(
          inventoryValueTrend.current[hoveredInventoryValuePoint.index] ?? 0,
          inventoryValueTrend.previous[hoveredInventoryValuePoint.index] ?? 0
        ).toFixed(1)}%`
      }
    : null;

  const inventoryValueComparisonDateLabel = useMemo(() => {
    const formatRangeDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (inventoryValueTrend.currentDates.length === 0 || inventoryValueTrend.previousDates.length === 0) return 'No date range';

    const currentStart = inventoryValueTrend.currentDates[0];
    const currentEnd = inventoryValueTrend.currentDates[inventoryValueTrend.currentDates.length - 1];
    const previousStart = inventoryValueTrend.previousDates[0];
    const previousEnd = inventoryValueTrend.previousDates[inventoryValueTrend.previousDates.length - 1];

    return `${formatRangeDate(currentStart)} - ${formatRangeDate(currentEnd)} vs ${formatRangeDate(previousStart)} - ${formatRangeDate(previousEnd)}`;
  }, [inventoryValueTrend]);

  const inventoryMovementLocationSummaryLabel =
    selectedInventoryMovementRegion.length === inventoryLocationOptions.length
      ? 'Inventory Locations'
      : formatMultiSelectLabel(selectedInventoryMovementRegion, 'Inventory Locations', 'location', 'locations');

  const activeInventoryMovementStores = useMemo(
    () =>
      inventoryMovementData.filter(
        (store) => selectedInventoryMovementRegion.includes(store.location)
      ),
    [selectedInventoryMovementRegion]
  );

  const activeInventoryStatusKey = inventoryStatusFromLabel[selectedInventoryStatus] ?? 'onHand';

  const inventoryMovementDateAdjusted = useMemo(() => {
    const totalDays = inventoryDateDayCount[selectedInventoryMovementDate] ?? inventoryDateDayCount['Last 30 Days'];
    const baseScale = inventoryDateScale[selectedInventoryMovementDate] ?? 1;
    const currentMultiplier = baseScale;
    const previousMultiplier = Math.max(0.6, baseScale * 0.87);
    const startIndex = Math.max(0, inventoryMovementMaxDataPoints - totalDays);

    const aggregateCurrent = inventoryMovementBaseIndexes.map((index) =>
      activeInventoryMovementStores.reduce(
        (sum, store) => sum + store.series[activeInventoryStatusKey].current[index] * currentMultiplier,
        0
      )
    );
    const aggregatePrevious = inventoryMovementBaseIndexes.map((index) =>
      activeInventoryMovementStores.reduce(
        (sum, store) => sum + store.series[activeInventoryStatusKey].previous[index] * previousMultiplier,
        0
      )
    );

    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const currentDates = Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - (totalDays - 1 - index));
      return date;
    });
    const previousDates = currentDates.map((date) => {
      const previousDate = new Date(date);
      previousDate.setDate(date.getDate() - totalDays);
      return previousDate;
    });

    return {
      labels: currentDates.map((date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })),
      currentDates,
      previousDates,
      current: aggregateCurrent.slice(startIndex).map((value) => Math.round(value)),
      previous: aggregatePrevious.slice(startIndex).map((value) => Math.round(value))
    };
  }, [activeInventoryMovementStores, activeInventoryStatusKey, selectedInventoryMovementDate]);

  const inventoryMovementGrouped = useMemo(() => {
    const sourceLabels = inventoryMovementDateAdjusted.labels;
    const sourceCurrentDates = inventoryMovementDateAdjusted.currentDates;
    const sourcePreviousDates = inventoryMovementDateAdjusted.previousDates;
    const sourceCurrent = inventoryMovementDateAdjusted.current;
    const sourcePrevious = inventoryMovementDateAdjusted.previous;

    const groupSizeMap: Record<string, number> = {
      Days: 1,
      Weeks: 3,
      Months: 5,
      Years: Math.ceil(sourceLabels.length / 2)
    };

    const groupSize = groupSizeMap[selectedInventoryGroupBy] ?? 1;
    const labels: string[] = [];
    const currentDates: Date[] = [];
    const previousDates: Date[] = [];
    const current: number[] = [];
    const previous: number[] = [];

    for (let index = 0; index < sourceLabels.length; index += groupSize) {
      const labelSlice = sourceLabels.slice(index, index + groupSize);
      const currentDateSlice = sourceCurrentDates.slice(index, index + groupSize);
      const previousDateSlice = sourcePreviousDates.slice(index, index + groupSize);
      const currentSlice = sourceCurrent.slice(index, index + groupSize);
      const previousSlice = sourcePrevious.slice(index, index + groupSize);
      const bucket = Math.floor(index / groupSize) + 1;

      if (selectedInventoryGroupBy === 'Days') labels.push(labelSlice[0]);
      if (selectedInventoryGroupBy === 'Weeks') labels.push(`Week ${bucket}`);
      if (selectedInventoryGroupBy === 'Months') labels.push(`Month ${bucket}`);
      if (selectedInventoryGroupBy === 'Years') labels.push(`Year ${bucket}`);

      currentDates.push(currentDateSlice[currentDateSlice.length - 1] ?? sourceCurrentDates[sourceCurrentDates.length - 1]);
      previousDates.push(previousDateSlice[previousDateSlice.length - 1] ?? sourcePreviousDates[sourcePreviousDates.length - 1]);
      current.push(currentSlice.reduce((sum, value) => sum + value, 0));
      previous.push(previousSlice.reduce((sum, value) => sum + value, 0));
    }

    return { labels, currentDates, previousDates, current, previous };
  }, [inventoryMovementDateAdjusted, selectedInventoryGroupBy]);

  const inventoryMovementChartData = useMemo(
    () => ({
      labels: inventoryMovementGrouped.labels,
      datasets: [
        {
          label: 'Current Period',
          data: inventoryMovementGrouped.current,
          borderColor: '#10c562',
          backgroundColor: '#10c562',
          pointBackgroundColor: '#10c562',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 2.8,
          pointHoverRadius: 4.5,
          borderWidth: 2.1,
          tension: 0.38
        },
        {
          label: 'Previous Period',
          data: inventoryMovementGrouped.previous,
          borderColor: 'rgba(156,163,175,0.55)',
          backgroundColor: 'rgba(156,163,175,0.55)',
          pointBackgroundColor: 'rgba(156,163,175,0.55)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 2.8,
          pointHoverRadius: 4.5,
          borderWidth: 2.1,
          tension: 0.38,
          borderDash: [7, 6]
        }
      ]
    }),
    [inventoryMovementGrouped]
  );

  const inventoryMovementChartOptions = useMemo(() => {
    const allValues = [...inventoryMovementGrouped.current, ...inventoryMovementGrouped.previous];
    const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100;
    const roundedMax = Math.ceil(maxValue / 50) * 50;

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top' as const,
          align: 'center' as const,
          labels: {
            usePointStyle: true,
            pointStyle: 'circle' as const,
            boxWidth: 8,
            boxHeight: 8,
            color: '#3A3D42',
            font: {
              family: 'Poppins',
              size: 12
            },
            padding: 18
          }
        },
        tooltip: {
          enabled: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#5F6368',
            font: {
              family: 'Poppins',
              size: 11
            },
            maxRotation: 0,
            minRotation: 0,
            callback: (value: string | number, index: number) =>
              selectedInventoryGroupBy === 'Days' && index % 2 === 1 ? '' : inventoryMovementGrouped.labels[index] ?? value
          },
          border: {
            display: false
          }
        },
        y: {
          min: 0,
          max: roundedMax,
          ticks: {
            stepSize: Math.max(10, Math.ceil(roundedMax / 5 / 10) * 10),
            color: '#7D828A',
            font: {
              family: 'Poppins',
              size: 10
            },
            callback: (value: string | number) => Number(value).toLocaleString('en-US')
          },
          grid: {
            color: '#EEF0EB'
          },
          border: {
            display: false
          }
        }
      },
      onHover: (_event: unknown, elements: { index: number; element: { x: number; y: number } }[]) => {
        if (elements.length > 0) {
          const active = elements[0];
          setHoveredInventoryMovementPoint({
            x: active.element.x,
            y: active.element.y,
            index: active.index
          });
        } else {
          setHoveredInventoryMovementPoint(null);
        }
      }
    };
  }, [inventoryMovementGrouped, selectedInventoryGroupBy]);

  const inventoryMovementKpis = useMemo(() => {
    const buildKpi = (statusKey: InventoryStatusKey) => {
      const aggregateCurrent = activeInventoryMovementStores.reduce(
        (sum, store) => sum + store.series[statusKey].current.reduce((a, b) => a + b, 0),
        0
      );
      const aggregatePrevious = activeInventoryMovementStores.reduce(
        (sum, store) => sum + store.series[statusKey].previous.reduce((a, b) => a + b, 0),
        0
      );

      const label = statusKey === 'unfulfillable' ? 'Unfulfilled' : inventoryStatusLabelMap[statusKey];
      return {
        label,
        value: aggregateCurrent.toLocaleString('en-US'),
        trend: `${getPercentDelta(aggregateCurrent, aggregatePrevious).toFixed(1)}%`,
        direction: aggregateCurrent >= aggregatePrevious ? ('up' as const) : ('down' as const),
        comparison: {
          current: aggregateCurrent.toLocaleString('en-US'),
          previous: aggregatePrevious.toLocaleString('en-US'),
          change: Math.abs(aggregateCurrent - aggregatePrevious).toLocaleString('en-US')
        }
      };
    };

    return [
      buildKpi('onHand'),
      buildKpi('committed'),
      buildKpi('available'),
      buildKpi('inbound'),
      buildKpi('unfulfillable')
    ];
  }, [activeInventoryMovementStores]);

  const inventoryMovementTooltipData = hoveredInventoryMovementPoint
    ? {
        label: inventoryMovementGrouped.labels[hoveredInventoryMovementPoint.index] ?? '-',
        currentDate: inventoryMovementGrouped.currentDates[hoveredInventoryMovementPoint.index] ?? new Date(),
        previousDate: inventoryMovementGrouped.previousDates[hoveredInventoryMovementPoint.index] ?? new Date(),
        current: inventoryMovementGrouped.current[hoveredInventoryMovementPoint.index] ?? 0,
        previous: inventoryMovementGrouped.previous[hoveredInventoryMovementPoint.index] ?? 0,
        change:
          (inventoryMovementGrouped.current[hoveredInventoryMovementPoint.index] ?? 0) -
          (inventoryMovementGrouped.previous[hoveredInventoryMovementPoint.index] ?? 0),
        changePercent: `${getPercentDelta(
          inventoryMovementGrouped.current[hoveredInventoryMovementPoint.index] ?? 0,
          inventoryMovementGrouped.previous[hoveredInventoryMovementPoint.index] ?? 0
        ).toFixed(1)}%`
      }
    : null;

  const inventoryHealthLocationSummaryLabel =
    selectedInventoryHealthLocation.length === inventoryLocationOptions.length
      ? 'Inventory Locations'
      : formatMultiSelectLabel(selectedInventoryHealthLocation, 'Inventory Locations', 'location', 'locations');

  const inventoryHealthSearchFieldLabel = inventoryHealthSearchFieldLabelMap[selectedInventoryHealthSearchField];

  const inventoryHealthFilteredProducts = useMemo(() => {
    const query = inventoryHealthSearchTerm.trim().toLowerCase();
    return inventoryHealthProducts.filter((product) => {
      const searchableValue =
        selectedInventoryHealthSearchField === 'name'
          ? product.name
          : selectedInventoryHealthSearchField === 'sku'
            ? product.sku
            : product.barcode;
      const matchesLocation = selectedInventoryHealthLocation.includes(product.location);
      const matchesSearch = !query || searchableValue.toLowerCase().includes(query);
      const matchesTags =
        !activeInventoryHealthFilters.includes('tags') ||
        selectedInventoryHealthFilters.tags.length === 0 ||
        selectedInventoryHealthFilters.tags.some((tag) => product.tags.includes(tag));
      const matchesCategory =
        !activeInventoryHealthFilters.includes('category') ||
        selectedInventoryHealthFilters.category.length === 0 ||
        selectedInventoryHealthFilters.category.includes(product.category);
      const matchesBrand =
        !activeInventoryHealthFilters.includes('brand') ||
        selectedInventoryHealthFilters.brand.length === 0 ||
        selectedInventoryHealthFilters.brand.includes(product.brand);
      return matchesLocation && matchesSearch && matchesTags && matchesCategory && matchesBrand;
    });
  }, [
    activeInventoryHealthFilters,
    inventoryHealthSearchTerm,
    selectedInventoryHealthFilters,
    selectedInventoryHealthLocation,
    selectedInventoryHealthSearchField
  ]);

  const inventoryHealthSortedProducts = useMemo(() => {
    const sorted = [...inventoryHealthFilteredProducts];
    const directionMultiplier = inventoryHealthSort.direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      if (inventoryHealthSort.key === 'name') return a.name.localeCompare(b.name) * directionMultiplier;
      const aValue = a[inventoryHealthSort.key];
      const bValue = b[inventoryHealthSort.key];
      return (Number(aValue) - Number(bValue)) * directionMultiplier;
    });

    return sorted;
  }, [inventoryHealthFilteredProducts, inventoryHealthSort]);

  const inventoryHealthVisibleProducts = useMemo(
    () => inventoryHealthSortedProducts.slice(0, inventoryHealthDisplayLimit),
    [inventoryHealthSortedProducts]
  );

  const handleInventoryHealthSort = (key: InventoryHealthSortKey) => {
    setInventoryHealthSort((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getInventoryHealthExportCellValue = (product: InventoryHealthProduct, columnKey: InventoryHealthSortKey) => {
    if (columnKey === 'name') return `${product.name} (${product.sku})`;
    if (columnKey === 'quantityIn') return product.quantityIn.toLocaleString('en-US');
    if (columnKey === 'quantityOut') return product.quantityOut.toLocaleString('en-US');
    if (columnKey === 'deadStocks') return product.deadStocks.toLocaleString('en-US');
    if (columnKey === 'salesVelocity') return `${product.salesVelocity.toFixed(1)} units/day`;
    if (columnKey === 'stockToSalesRatio') return `${product.stockToSalesRatio.toFixed(2)}x`;
    if (columnKey === 'inventoryTurnoverRatio') return `${product.inventoryTurnoverRatio.toFixed(2)}x`;
    return '';
  };

  const escapeCsvCell = (value: string) => {
    if (!/[",\n]/.test(value)) return value;
    return `"${value.replace(/"/g, '""')}"`;
  };

  const handleInventoryHealthExport = () => {
    if (inventoryHealthVisibleProducts.length === 0) return;

    const headerRow = inventoryHealthVisibleColumns.map((column) => column.label);
    const dataRows = inventoryHealthVisibleProducts.map((product) =>
      inventoryHealthVisibleColumns.map((column) => getInventoryHealthExportCellValue(product, column.key))
    );
    const csv = [headerRow, ...dataRows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date();
    const fileStamp = `${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}-${String(timestamp.getHours()).padStart(2, '0')}${String(timestamp.getMinutes()).padStart(2, '0')}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-health-table-${fileStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderInventoryHealthSortIcon = (key: InventoryHealthSortKey) => {
    if (inventoryHealthSort.key !== key) return <ArrowUpDown className="tu-h-3.5 tu-w-3.5 tu-text-[#9ba1a8]" />;
    if (inventoryHealthSort.direction === 'asc') return <ChevronUp className="tu-h-3.5 tu-w-3.5 tu-text-[#5f656c]" />;
    return <ChevronDown className="tu-h-3.5 tu-w-3.5 tu-text-[#5f656c]" />;
  };

  const inventoryHealthVisibleColumns = useMemo(
    () => inventoryHealthColumns.filter((column) => column.visible),
    [inventoryHealthColumns]
  );

  const toggleInventoryHealthColumn = (key: InventoryHealthSortKey) => {
    setInventoryHealthColumns((current) => {
      const currentlyVisible = current.filter((column) => column.visible).length;
      return current.map((column) => {
        if (column.key !== key) return column;
        if (column.visible && currentlyVisible === 1) return column;
        return { ...column, visible: !column.visible };
      });
    });
  };

  const reorderInventoryHealthColumns = (targetKey: InventoryHealthSortKey) => {
    if (!draggedInventoryHealthColumnKey || draggedInventoryHealthColumnKey === targetKey) return;
    setInventoryHealthColumns((current) => {
      const sourceIndex = current.findIndex((column) => column.key === draggedInventoryHealthColumnKey);
      const targetIndex = current.findIndex((column) => column.key === targetKey);
      if (sourceIndex === -1 || targetIndex === -1) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedInventoryHealthColumnKey(null);
  };

  const renderFloatingTooltipBody = (content: string | TooltipContent) => {
    if (typeof content === 'string') return <p className="tu-leading-5">{content}</p>;
    return (
      <div className="tu-space-y-0">
        {content.title ? <p className="tu-mb-2 tu-text-[13px] tu-font-semibold tu-leading-5">{content.title}</p> : null}
        {content.blocks.map((block, index) => {
          if (block.type === 'spacer') return <div key={`spacer-${index}`} className="tu-h-2" />;
          if (block.type === 'formula') {
            return (
              <p
                key={`formula-${index}`}
                className="tu-rounded-[8px] tu-bg-white/10 tu-px-3 tu-py-2 tu-text-[11px] tu-font-medium tu-leading-5 tu-text-[#f2f4f1]"
              >
                {block.text}
              </p>
            );
          }
          return (
            <p key={`text-${index}`} className="tu-leading-5">
              {block.text}
            </p>
          );
        })}
      </div>
    );
  };

  const groupedSalesChartData = useMemo(() => {
    const sourceLabels = salesChartLabels;
    const groupSizeMap: Record<string, number> = {
      Days: 1,
      Weeks: 3,
      Months: 5,
      Years: Math.ceil(sourceLabels.length / 2)
    };
    const groupSize = groupSizeMap[selectedSalesGroupBy] ?? 1;

    const labels: string[] = [];
    for (let index = 0; index < sourceLabels.length; index += groupSize) {
      const bucket = Math.floor(index / groupSize) + 1;
      if (selectedSalesGroupBy === 'Days') labels.push(sourceLabels[index]);
      if (selectedSalesGroupBy === 'Weeks') labels.push(`Week ${bucket}`);
      if (selectedSalesGroupBy === 'Months') labels.push(`Month ${bucket}`);
      if (selectedSalesGroupBy === 'Years') labels.push(`Year ${bucket}`);
    }

    const datasets = activeSalesStoreSeries.map((series) => {
      const sourceSeries = series[selectedStoreMetricConfig.key];
      const groupedValues: number[] = [];
      for (let index = 0; index < sourceSeries.length; index += groupSize) {
        groupedValues.push(sourceSeries.slice(index, index + groupSize).reduce((sum, value) => sum + value, 0));
      }

      return {
        label: series.name,
        data: groupedValues,
        borderColor: series.color,
        backgroundColor: series.color,
        pointBackgroundColor: series.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2.5,
        cubicInterpolationMode: 'monotone' as const,
        tension: selectedSalesGroupBy === 'Days' ? 0.38 : 0.24
      };
    });

    return { labels, datasets };
  }, [activeSalesStoreSeries, selectedStoreMetricConfig, selectedSalesGroupBy]);

  const salesChartData = useMemo(
    () => ({
      labels: groupedSalesChartData.labels,
      datasets: groupedSalesChartData.datasets
    }),
    [groupedSalesChartData]
  );

  const salesChartOptions = useMemo(() => {
    const allSeriesValues = groupedSalesChartData.datasets.flatMap((dataset) => dataset.data);
    const currentMax = allSeriesValues.length > 0 ? Math.max(...allSeriesValues) : selectedStoreMetricConfig.axisMax;
    const paddedMax = Math.max(selectedStoreMetricConfig.axisMax, currentMax * 1.12);
    const roundingBase = paddedMax >= 1000 ? Math.pow(10, Math.floor(Math.log10(paddedMax)) - 1) : 10;
    const dynamicAxisMax = Math.ceil(paddedMax / roundingBase) * roundingBase;
    const dynamicStepSize = Math.max(1, Math.ceil(dynamicAxisMax / 6 / roundingBase) * roundingBase);

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top' as const,
          align: 'center' as const,
          labels: {
            usePointStyle: true,
            pointStyle: 'circle' as const,
            boxWidth: 8,
            boxHeight: 8,
            color: '#3A3D42',
            font: {
              family: 'Poppins',
              size: 12
            },
            padding: 18
          }
        },
        tooltip: {
          enabled: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#5F6368',
            font: {
              family: 'Poppins',
              size: 11
            },
            callback: (value: string | number, index: number) =>
              selectedSalesGroupBy === 'Days' && index % 2 === 1 ? '' : groupedSalesChartData.labels[index] ?? value
          },
          border: {
            display: false
          }
        },
        y: {
          min: 0,
          max: dynamicAxisMax,
          ticks: {
            stepSize: dynamicStepSize,
            color: '#7D828A',
            font: {
              family: 'Poppins',
              size: 10
            },
            callback: (value: string | number) => selectedStoreMetricConfig.tickFormatter(Number(value))
          },
          grid: {
            color: '#EEF0EB'
          },
          border: {
            display: false
          }
        }
      },
      onHover: (_event: unknown, elements: { index: number; element: { x: number; y: number } }[]) => {
        if (elements.length > 0) {
          const active = elements[0];
          setHoveredSalesPoint({
            x: active.element.x,
            y: active.element.y,
            dataIndex: active.index
          });
        } else {
          setHoveredSalesPoint(null);
        }
      }
    };
  }, [groupedSalesChartData.datasets, groupedSalesChartData.labels, selectedSalesGroupBy, selectedStoreMetricConfig]);

  const salesTooltipData = hoveredSalesPoint
    ? {
        date: groupedSalesChartData.labels[hoveredSalesPoint.dataIndex] ?? '-',
        stores: dayBreakdown[hoveredSalesPoint.dataIndex % dayBreakdown.length].stores.filter((store) =>
          selectedSalesStore.includes(store.name)
        ),
        metric: selectedStoreMetricConfig
      }
    : null;

  const selectedLocationMetricConfig = locationMetricConfig[selectedLocationMetric];
  const dynamicLocationKpiCards = useMemo(() => {
    if (selectedLocationMetric === 'Gross Sales') {
      return locationKpiCards.map((metric, index) =>
        index === 3
          ? {
              ...metric,
              label: 'Average Gross Sales per City',
              value: 'PKR 2,137,000',
              comparison: { current: 'PKR 2,137,000', previous: 'PKR 1,984,000', change: 'PKR 153,000' }
            }
          : metric
      );
    }

    return locationKpiCards;
  }, [selectedLocationMetric]);

  const locationChartData = useMemo(
    () => ({
      labels: locationPerformanceData.map((item) => item.location),
      datasets: [
        {
          label: 'June',
          data: locationPerformanceData.map((item) => item[selectedLocationMetricConfig.currentKey]),
          backgroundColor: '#10c562',
          borderRadius: 6,
          maxBarThickness: 34
        },
        {
          label: 'May',
          data: locationPerformanceData.map((item) => item[selectedLocationMetricConfig.previousKey]),
          backgroundColor: '#c9c9c9',
          borderRadius: 6,
          maxBarThickness: 34
        }
      ]
    }),
    [selectedLocationMetricConfig]
  );

  const locationChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          align: 'center' as const,
          labels: {
            usePointStyle: true,
            pointStyle: 'circle' as const,
            boxWidth: 8,
            boxHeight: 8,
            color: '#3A3D42',
            font: {
              family: 'Poppins',
              size: 12
            },
            padding: 18
          }
        },
        tooltip: {
          callbacks: {
            label: (context: { dataset: { label?: string }; parsed: { y: number | null } }) =>
              `${context.dataset.label ?? ''}: ${selectedLocationMetricConfig.tooltipFormatter(context.parsed.y ?? 0)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#3f4348',
            font: { family: 'Poppins', size: 11 }
          },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          max: selectedLocationMetricConfig.axisMax,
          ticks: {
            stepSize: selectedLocationMetricConfig.stepSize,
            color: '#7D828A',
            font: { family: 'Poppins', size: 11 },
            callback: (value: string | number) => selectedLocationMetricConfig.tickFormatter(Number(value))
          },
          grid: { color: '#EEF0EB' },
          border: { display: false }
        }
      }
    }),
    [selectedLocationMetricConfig]
  );

  const selectedProductMetricConfig = productMetricConfig[selectedProductMetric];
  const dynamicProductMetricCards = useMemo(() => {
    if (selectedProductMetric === 'Gross Sales') {
      return [
        {
          label: 'Total Gross Sales',
          value: 'PKR 11,500,000',
          trend: '12.4%',
          direction: 'up' as const,
          comparison: { current: 'PKR 11,500,000', previous: 'PKR 10,230,000', change: 'PKR 1,270,000' }
        },
        {
          label: 'Top Gross Sales Product',
          value: 'Earbuds X',
          extraItems: ['Travel Pack', 'Smart Watch']
        },
        {
          label: 'Most Improved Gross Sales Product',
          value: 'Travel Pack',
          extraItems: ['Steel Bottle', 'Fleece Hoodie']
        },
        {
          label: 'Most Declined Gross Sales Product',
          value: 'Smart Watch',
          extraItems: ['Earbuds X', 'Canvas Tote']
        },
        {
          label: 'Avg. Gross Sales Per Product',
          value: 'PKR 26,500',
          trend: '8.6%',
          direction: 'up' as const,
          comparison: { current: 'PKR 26,500', previous: 'PKR 24,400', change: 'PKR 2,100' }
        }
      ];
    }

    return [
      {
        label: 'Total Units Sold',
        value: '44,000',
        trend: '10.0%',
        direction: 'up' as const,
        comparison: { current: '44,000', previous: '40,000', change: '4,000' }
      },
      {
        label: 'Best Selling Product',
        value: 'Core Tee',
        extraItems: ['Fleece Hoodie', 'Runner Pro']
      },
      {
        label: 'Most Improved Product',
        value: 'Travel Pack',
        extraItems: ['Fleece Hoodie', 'Steel Bottle']
      },
      {
        label: 'Most Declined Product',
        value: 'Earbuds X',
        extraItems: ['Smart Watch', 'Runner Pro']
      },
      {
        label: 'Avg. Units Sold Per Order',
        value: '1,000',
        trend: '10.0%',
        direction: 'down' as const,
        comparison: { current: '1,000', previous: '1,110', change: '110' }
      }
    ];
  }, [selectedProductMetric]);

  const productChartData = useMemo(
    () => ({
      labels: productPerformanceData.map((item) => item.product),
      datasets: [
        {
          label: 'April',
          data: productPerformanceData.map((item) => item[selectedProductMetricConfig.currentKey]),
          backgroundColor: '#10c562',
          borderRadius: 6,
          maxBarThickness: 34
        },
        {
          label: 'May',
          data: productPerformanceData.map((item) => item[selectedProductMetricConfig.previousKey]),
          backgroundColor: '#c9c9c9',
          borderRadius: 6,
          maxBarThickness: 34
        }
      ]
    }),
    [selectedProductMetricConfig]
  );

  const productChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          align: 'center' as const,
          labels: {
            usePointStyle: true,
            pointStyle: 'circle' as const,
            boxWidth: 8,
            boxHeight: 8,
            color: '#3A3D42',
            font: {
              family: 'Poppins',
              size: 12
            },
            padding: 18
          }
        },
        tooltip: {
          callbacks: {
            label: (context: { dataset: { label?: string }; parsed: { y: number | null } }) =>
              `${context.dataset.label ?? ''}: ${selectedProductMetricConfig.tooltipFormatter(context.parsed.y ?? 0)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#3f4348',
            font: { family: 'Poppins', size: 11 }
          },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          max: selectedProductMetricConfig.axisMax,
          ticks: {
            stepSize: selectedProductMetricConfig.stepSize,
            color: '#7D828A',
            font: { family: 'Poppins', size: 11 },
            callback: (value: string | number) => selectedProductMetricConfig.tickFormatter(Number(value))
          },
          grid: { color: '#EEF0EB' },
          border: { display: false }
        }
      }
    }),
    [selectedProductMetricConfig]
  );

  return (
    <div className="tu-min-h-screen tu-overflow-x-hidden tu-bg-[#f4f5f2]">
      <header className="tu-sticky tu-top-0 tu-z-40 tu-border-b tu-border-[#e8ebe3] tu-bg-white/90 tu-backdrop-blur">
        <div className="tu-flex tu-h-[68px] tu-items-center tu-justify-between tu-px-4 sm:tu-px-6 lg:tu-px-8">
          <div className="tu-flex tu-items-center tu-gap-3">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="tu-inline-flex tu-h-10 tu-w-10 tu-items-center tu-justify-center tu-rounded-xl tu-border tu-border-[#e7eadf] tu-bg-white tu-text-[#4b4e53] hover:tu-bg-[#f5f6f3]"
            >
              <Menu className="tu-h-4 tu-w-4" />
            </button>
            <div>
              <p className="tu-text-[11px] tu-font-medium tu-uppercase tu-tracking-[0.22em] tu-text-[#9a9ca2]">
                Product Suite
              </p>
              <h1 className="tu-text-[16px] tu-font-semibold tu-text-[#2d3034]">Dashboard</h1>
            </div>
          </div>

          <div className="tu-flex tu-items-center tu-gap-3">
            <div className="tu-hidden md:tu-flex md:tu-items-center md:tu-gap-2 md:tu-rounded-xl md:tu-border md:tu-border-[#e7eadf] md:tu-bg-[#fafbf8] md:tu-px-3 md:tu-py-2">
              <Search className="tu-h-4 tu-w-4 tu-text-[#9a9ca2]" />
              <span className="tu-text-[13px] tu-text-[#8d9097]">Search dashboard</span>
            </div>
            <button
              type="button"
              className="tu-inline-flex tu-h-10 tu-w-10 tu-items-center tu-justify-center tu-rounded-xl tu-border tu-border-[#e7eadf] tu-bg-white tu-text-[#4b4e53] hover:tu-bg-[#f5f6f3]"
            >
              <Bell className="tu-h-4 tu-w-4" />
            </button>
            <div className="tu-flex tu-items-center tu-gap-3 tu-rounded-xl tu-border tu-border-[#e7eadf] tu-bg-white tu-px-2.5 tu-py-2">
              <div className="tu-flex tu-h-8 tu-w-8 tu-items-center tu-justify-center tu-rounded-full tu-bg-[#dff5e7] tu-text-[12px] tu-font-semibold tu-text-[#10c562]">
                HM
              </div>
              <div className="tu-hidden sm:tu-block">
                <p className="tu-text-[13px] tu-font-medium tu-text-[#2d3034]">Hamza</p>
                <p className="tu-text-[11px] tu-text-[#9a9ca2]">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="tu-flex">
        <aside
          className={`tu-hidden tu-border-r tu-border-[#e8ebe3] tu-bg-[#fbfcf9] tu-transition-all lg:tu-block ${
            sidebarCollapsed ? 'lg:tu-w-[88px]' : 'lg:tu-w-[248px]'
          }`}
        >
          <div className="tu-flex tu-h-[calc(100vh-68px)] tu-flex-col tu-p-4">
            <div className="tu-flex tu-items-center tu-justify-between tu-px-2">
              {!sidebarCollapsed ? (
                <div>
                  <p className="tu-text-[11px] tu-font-medium tu-uppercase tu-tracking-[0.22em] tu-text-[#9a9ca2]">
                    Workspace
                  </p>
                  <p className="tu-mt-1 tu-text-[15px] tu-font-semibold tu-text-[#2d3034]">Operations</p>
                </div>
              ) : (
                <div className="tu-h-10" />
              )}
              <button
                type="button"
                onClick={() => setSidebarCollapsed((current) => !current)}
                className="tu-inline-flex tu-h-9 tu-w-9 tu-items-center tu-justify-center tu-rounded-xl tu-border tu-border-[#e7eadf] tu-bg-white tu-text-[#4b4e53] hover:tu-bg-[#f5f6f3]"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="tu-h-4 tu-w-4" />
                ) : (
                  <PanelLeftClose className="tu-h-4 tu-w-4" />
                )}
              </button>
            </div>

            <nav className="tu-mt-6 tu-space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`tu-flex tu-w-full tu-items-center tu-gap-3 tu-rounded-2xl tu-px-3 tu-py-3 tu-text-left tu-transition ${
                      item.active
                        ? 'tu-bg-[#e8f7ee] tu-text-[#10c562]'
                        : 'tu-text-[#5f6368] hover:tu-bg-white hover:tu-text-[#2d3034]'
                    } ${sidebarCollapsed ? 'tu-justify-center' : ''}`}
                  >
                    <Icon className="tu-h-4 tu-w-4 tu-shrink-0" />
                    {!sidebarCollapsed ? (
                      <span className="tu-text-[14px] tu-font-medium">{item.label}</span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="tu-min-w-0 tu-flex-1 tu-px-4 tu-py-5 sm:tu-px-6 lg:tu-px-8">
          <section className="tu-space-y-5">
            <div className="tu-rounded-[14px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-2.5 tu-shadow-[0_6px_24px_rgba(31,41,55,0.08)] sm:tu-p-3">
              <div className="tu-flex tu-items-center tu-gap-1.5">
                {tabs.map((tab) => {
                  const active = tab.key === activeTab;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`tu-rounded-[10px] tu-px-4 tu-py-2 tu-text-[14px] tu-font-medium tu-transition-colors ${
                        active
                          ? 'tu-bg-[#e8f7ee] tu-text-[#10c562]'
                          : 'tu-text-[#5f6368] hover:tu-bg-[#f5f6f3] hover:tu-text-[#2d3034]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="tu-flex tu-flex-col">
              {activeTab === 'inventory' ? (
                <>
                <section className="tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-5">
                  <div className="tu-flex tu-flex-col tu-gap-4 xl:tu-flex-row xl:tu-items-center xl:tu-justify-between">
                    <h2 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">Inventory Insights</h2>

                    <div className="tu-flex tu-flex-wrap tu-gap-2.5 sm:tu-gap-3">
                        {[
                          { key: 'date', value: selectedInventoryDate, options: inventoryDateOptions },
                          {
                            key: 'region',
                            value: inventoryLocationSummaryLabel,
                            options: inventoryLocationOptions
                          }
                        ].map((menu) => (
                          <div key={menu.key} className="tu-relative">
                          <button
                            type="button"
                            onClick={() => {
                              setInventoryMenus((current) => ({
                                date: false,
                                region: false,
                                [menu.key]: !current[menu.key as keyof typeof current]
                              }));
                              setInventoryMenuSearch((current) => ({ ...current, [menu.key]: '' }));
                            }}
                            className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                          >
                            <span>{menu.value}</span>
                            <ChevronDown className="tu-h-3 tu-w-3" />
                          </button>

                          <SearchableDropdownMenu
                            open={inventoryMenus[menu.key as keyof typeof inventoryMenus]}
                            options={menu.options}
                            selected={menu.key === 'region' ? selectedInventoryRegion : selectedInventoryDate}
                            multiSelect={menu.key === 'region'}
                            searchable={menu.key !== 'date'}
                            searchValue={inventoryMenuSearch[menu.key as keyof typeof inventoryMenuSearch]}
                            onSearchChange={
                              menu.key !== 'date'
                                ? (value) => setInventoryMenuSearch((current) => ({ ...current, [menu.key]: value }))
                                : undefined
                            }
                            widthClass={menu.key === 'region' ? 'tu-w-[230px]' : 'tu-w-[190px]'}
                            showChevronForCustom={menu.key === 'date'}
                            onSelect={(item) => {
                              if (menu.key === 'region') {
                                setSelectedInventoryRegion((current) => toggleMultiSelectValue(current, item));
                                return;
                              }
                              if (menu.key === 'date') setSelectedInventoryDate(item);
                              setInventoryMenus({ date: false, region: false });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="tu-mt-6 tu-grid tu-gap-3 md:tu-grid-cols-2 xl:tu-grid-cols-4">
                        {dynamicInventoryMetricCards.map((metric, index) => {
                          const isPrimaryInventoryValueCard = index === 0;
                          const TrendIcon = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
                          const trendPillClass =
                            metric.direction === 'up'
                              ? 'tu-border-[#cdeedc] tu-bg-[#ecfbf3] tu-text-[#10c562]'
                              : 'tu-border-[#f4d5d4] tu-bg-[#fff1f1] tu-text-[#de524c]';

                          return (
                            <article
                              key={metric.label}
                              role="button"
                              tabIndex={0}
                              className={`tu-group tu-relative tu-cursor-pointer tu-rounded-[12px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] tu-shadow-[0_12px_30px_rgba(31,41,55,0.06)] tu-transition-all hover:-tu-translate-y-0.5 hover:tu-border-[#d8e8db] hover:tu-bg-[linear-gradient(180deg,#ffffff_0%,#f3fbf6_100%)] hover:tu-shadow-[0_16px_34px_rgba(16,197,98,0.12)] ${
                                isPrimaryInventoryValueCard
                                  ? 'tu-p-3 xl:tu-col-span-1'
                                  : 'tu-p-2.5 xl:tu-col-span-1'
                              }`}
                            >
                              <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
                                <div className="tu-min-w-0">
                                  {isPrimaryInventoryValueCard ? (
                                    <div className="tu-min-w-0">
                                      <div className="tu-group/tooltip tu-relative tu-inline-block">
                                        <span className="tu-text-[13px] tu-text-[#9a9ca2]">{metric.label}</span>
                                        <InfoTooltip text={inventoryKpiTooltips[metric.label]} widthClass="tu-w-[240px]" />
                                      </div>
                                      <div className="tu-group/tooltip tu-absolute tu-right-3 tu-top-3 tu-inline-flex">
                                        <span className="tu-inline-flex tu-h-4 tu-w-4 tu-items-center tu-justify-center tu-rounded-full tu-border tu-border-[#d8ddd5] tu-text-[10px] tu-font-medium tu-text-[#7f858d]">
                                          ?
                                        </span>
                                        <div className="tu-pointer-events-none tu-absolute tu-bottom-[calc(100%+8px)] tu-right-0 tu-z-30 tu-w-[240px] tu-rounded-md tu-bg-[#111111] tu-px-2.5 tu-py-2 tu-text-[11px] tu-leading-4 tu-text-white tu-opacity-0 tu-shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-opacity group-hover/tooltip:tu-opacity-100">
                                          <p className="tu-leading-5">Products involved in inventory value calculation</p>
                                          <div className="tu-mt-2">
                                            <span className="tu-inline-flex tu-items-center tu-gap-1.5 tu-rounded-full tu-bg-white/10 tu-px-2.5 tu-py-1 tu-text-[11px] tu-font-medium tu-text-[#f2f4f1]">
                                              <span>{metric.secondaryValue ?? '0'}</span>
                                              <span>Products</span>
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <p className="tu-mt-1 tu-text-[26px] tu-font-semibold tu-text-[#333538]">{metric.value}</p>

                                      <div className="tu-mt-3 tu-flex tu-items-center tu-gap-2">
                                        <div className="tu-relative">
                                          <button
                                            type="button"
                                            onMouseEnter={() => setHoveredInventoryKpi(metric.label)}
                                            onMouseLeave={() => setHoveredInventoryKpi(null)}
                                            className={`tu-inline-flex tu-items-center tu-gap-1 tu-rounded-full tu-border tu-px-2 tu-py-1 tu-text-[12px] tu-font-semibold ${trendPillClass}`}
                                          >
                                            {metric.trend}
                                            <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                                          </button>
                                          {hoveredInventoryKpi === metric.label ? (
                                            <ComparisonPopover comparison={metric.comparison} trend={metric.trend} direction={metric.direction} />
                                          ) : null}
                                        </div>
                                        <span className="tu-text-[12px] tu-text-[#9a9ca2]">{metric.sublabel}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="tu-flex tu-items-center tu-justify-between tu-gap-2">
                                        <div className="tu-group/tooltip tu-relative tu-inline-block">
                                          <span className="tu-text-[13px] tu-text-[#9a9ca2]">{metric.label}</span>
                                          <InfoTooltip
                                            text={inventoryKpiTooltips[metric.label]}
                                            widthClass={
                                              metric.label.includes('Quantity') || metric.label.includes('Fulfillment')
                                                ? 'tu-w-[280px]'
                                                : 'tu-w-[240px]'
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className="tu-mt-1">
                                        <p className="tu-font-semibold tu-text-[#333538] tu-text-[26px]">
                                          {metric.value}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              {!isPrimaryInventoryValueCard ? (
                                <div className="tu-mt-3 tu-flex tu-items-center tu-gap-2">
                                  <div className="tu-relative">
                                    <button
                                      type="button"
                                      onMouseEnter={() => setHoveredInventoryKpi(metric.label)}
                                      onMouseLeave={() => setHoveredInventoryKpi(null)}
                                      className={`tu-inline-flex tu-items-center tu-gap-1 tu-rounded-full tu-border tu-px-2 tu-py-1 tu-text-[12px] tu-font-semibold ${trendPillClass}`}
                                    >
                                      {metric.trend}
                                      <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                                    </button>
                                    {hoveredInventoryKpi === metric.label ? (
                                      <ComparisonPopover comparison={metric.comparison} trend={metric.trend} direction={metric.direction} />
                                    ) : null}
                                  </div>
                                  <span className="tu-text-[12px] tu-text-[#9a9ca2]">{metric.sublabel}</span>
                                </div>
                              ) : null}
                            </article>
                          );
                        })}
                  </div>

                  <article className="tu-mt-5 tu-rounded-[12px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-3 tu-shadow-[0_8px_24px_rgba(31,41,55,0.06)] sm:tu-p-4">
                    <div className="tu-flex tu-flex-col tu-gap-1.5 sm:tu-flex-row sm:tu-items-center sm:tu-justify-between">
                      <h3 className="tu-text-[16px] tu-font-semibold tu-text-[#333538]">Total Inventory Value</h3>
                      <p className="tu-text-[12px] tu-text-[#7d828a]">{inventoryValueComparisonDateLabel}</p>
                    </div>
                    <div
                      className="tu-relative tu-mt-3.5 tu-h-[300px]"
                      onMouseLeave={() => setHoveredInventoryValuePoint(null)}
                    >
                      <Line data={inventoryValueChartData} options={inventoryValueChartOptions} />

                      {hoveredInventoryValuePoint && inventoryValueTooltipData ? (
                        <div
                          className="tu-pointer-events-none tu-absolute tu-z-30 tu-w-[268px] tu-rounded-[14px] tu-border tu-border-[#d9efe2] tu-bg-[rgba(255,255,255,0.98)] tu-p-4 tu-shadow-[0_20px_36px_rgba(16,36,27,0.18)]"
                          style={{
                            left: Math.min(Math.max(hoveredInventoryValuePoint.x - 134, 10), 760),
                            top: Math.max(hoveredInventoryValuePoint.y - 150, 10)
                          }}
                        >
                          <div className="tu-flex tu-items-center tu-justify-between tu-gap-3">
                            <h4 className="tu-text-[12px] tu-font-semibold tu-leading-none tu-text-[#22302a]">
                              {inventoryValueTooltipData.label}
                            </h4>
                            <span className="tu-rounded-full tu-bg-[#edf9f1] tu-px-2 tu-py-0.5 tu-text-[9px] tu-font-medium tu-text-[#17995a]">
                              Total Value
                            </span>
                          </div>

                          <div className="tu-mt-3 tu-space-y-3">
                            <div>
                              <div className="tu-flex tu-items-center tu-justify-between tu-gap-3">
                                <span className="tu-inline-flex tu-items-center tu-gap-1.5 tu-text-[10px] tu-font-medium tu-text-[#4f5d56]">
                                  <span className="tu-inline-flex tu-h-2.5 tu-w-2.5 tu-rounded-full tu-bg-[#10c562]" />
                                  Current Period
                                </span>
                                <span className="tu-text-[10px] tu-text-[#6a7270]">
                                  {formatTooltipPeriodDate(inventoryValueTooltipData.currentDate)}
                                </span>
                              </div>
                              <p className="tu-mt-1.5 tu-text-[14px] tu-font-medium tu-leading-none tu-text-[#22302a]">
                                PKR {inventoryValueTooltipData.current.toLocaleString('en-US')}
                              </p>
                            </div>

                            <div className="tu-h-px tu-bg-[#e5eee8]" />

                            <div>
                              <div className="tu-flex tu-items-center tu-justify-between tu-gap-3">
                                <span className="tu-inline-flex tu-items-center tu-gap-1.5 tu-text-[10px] tu-font-medium tu-text-[#4f5d56]">
                                  <span className="tu-inline-flex tu-h-2.5 tu-w-2.5 tu-rounded-full tu-bg-[#9ca3af]" />
                                  Previous Period
                                </span>
                                <span className="tu-text-[10px] tu-text-[#6a7270]">
                                  {formatTooltipPeriodDate(inventoryValueTooltipData.previousDate)}
                                </span>
                              </div>
                              <p className="tu-mt-1.5 tu-text-[14px] tu-font-medium tu-leading-none tu-text-[#2e3338]">
                                PKR {inventoryValueTooltipData.previous.toLocaleString('en-US')}
                              </p>
                            </div>
                          </div>

                          <div className="tu-mt-3.5 tu-flex tu-items-center tu-justify-between tu-rounded-[10px] tu-bg-[#f5faf7] tu-px-2.5 tu-py-2.5">
                            <span className="tu-text-[10px] tu-font-medium tu-text-[#54635a]">Change</span>
                            <span
                              className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[11px] tu-font-semibold ${
                                inventoryValueTooltipData.change >= 0 ? 'tu-text-[#10a85d]' : 'tu-text-[#d14b47]'
                              }`}
                            >
                              {inventoryValueTooltipData.change >= 0 ? (
                                <ArrowUpRight className="tu-h-3.5 tu-w-3.5" />
                              ) : (
                                <ArrowDownRight className="tu-h-3.5 tu-w-3.5" />
                              )}
                              {inventoryValueTooltipData.changePercent}
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                </section>
                {true ? (
                <section className="tu-mt-5 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-5">
                  <div className="tu-flex tu-flex-col tu-gap-4 xl:tu-flex-row xl:tu-items-center xl:tu-justify-between">
                    <h2 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">Inventory Snapshot</h2>

                    <div className="tu-flex tu-flex-wrap tu-gap-2.5 sm:tu-gap-3">
                      <div className="tu-relative">
                        <button
                          type="button"
                          onClick={() => {
                            setInventorySnapshotMenus((current) => ({
                              location: !current.location,
                              stockoutDate: false
                            }));
                            setInventorySnapshotMenuSearch({ location: '' });
                          }}
                          className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                        >
                          <span>{inventorySnapshotLocationSummaryLabel}</span>
                          <ChevronDown className="tu-h-3 tu-w-3" />
                        </button>

                        <SearchableDropdownMenu
                          open={inventorySnapshotMenus.location}
                          options={inventoryLocationOptions}
                          selected={selectedInventorySnapshotLocation}
                          multiSelect
                          searchable
                          searchValue={inventorySnapshotMenuSearch.location}
                          onSearchChange={(value) => setInventorySnapshotMenuSearch({ location: value })}
                          widthClass="tu-w-[230px]"
                          onSelect={(item) => setSelectedInventorySnapshotLocation((current) => toggleMultiSelectValue(current, item))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="tu-mt-6 tu-grid tu-gap-3 md:tu-grid-cols-2 xl:tu-grid-cols-4">
                    {inventorySnapshotCards.map((card) => {
                      const isStockoutCard = Boolean(card.hasDateFilter);
                      return (
                      <article
                        key={card.label}
                        className={`tu-group/card tu-relative tu-rounded-[12px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] tu-shadow-[0_12px_30px_rgba(31,41,55,0.06)] tu-transition-all hover:-tu-translate-y-0.5 hover:tu-border-[#d8e8db] hover:tu-bg-[linear-gradient(180deg,#ffffff_0%,#f3fbf6_100%)] hover:tu-shadow-[0_16px_34px_rgba(16,197,98,0.12)] ${
                          isStockoutCard ? 'tu-p-2.5' : 'tu-p-3'
                        }`}
                      >
                        {!isStockoutCard ? (
                          <a
                            href="/reports"
                            className="tu-absolute tu-right-3 tu-top-3 tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium tu-text-[#10c562] tu-underline tu-decoration-dotted tu-underline-offset-2 tu-opacity-0 transition-opacity group-hover/card:tu-opacity-100"
                          >
                            <span>See reports</span>
                            <ChevronRight className="tu-h-4 tu-w-4" />
                          </a>
                        ) : null}

                        <div className="tu-flex tu-items-start tu-justify-between tu-gap-2">
                          <div className="tu-group/tooltip tu-relative tu-inline-block">
                            <span className="tu-text-[13px] tu-text-[#9a9ca2]">{card.label}</span>
                            <InfoTooltip
                              text={inventorySnapshotKpiTooltips[card.label]}
                              widthClass={card.label.includes('Stockout') ? 'tu-w-[280px]' : 'tu-w-[240px]'}
                            />
                          </div>

                          {card.hasDateFilter ? (
                            <div className="tu-relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setInventorySnapshotMenus((current) => ({
                                    location: false,
                                    stockoutDate: !current.stockoutDate
                                  }))
                                }
                                className="tu-inline-flex tu-items-center tu-gap-1 tu-rounded-[8px] tu-px-1.5 tu-py-1 tu-text-[11px] tu-font-medium tu-text-[#5f656c] transition-colors hover:tu-bg-[#f3f5f1] hover:tu-text-[#2a2c2f]"
                              >
                                <span>{selectedInventorySnapshotStockoutDate}</span>
                                <ChevronDown className="tu-h-3 tu-w-3" />
                              </button>
                              <SearchableDropdownMenu
                                open={inventorySnapshotMenus.stockoutDate}
                                options={inventoryDateOptions}
                                selected={selectedInventorySnapshotStockoutDate}
                                searchable={false}
                                widthClass="tu-w-[170px]"
                                onSelect={(item) => {
                                  setSelectedInventorySnapshotStockoutDate(item);
                                  setInventorySnapshotMenus((current) => ({ ...current, stockoutDate: false }));
                                }}
                              />
                            </div>
                          ) : null}
                        </div>

                        <div className={`${card.hasDateFilter ? 'tu-mt-1.5' : 'tu-mt-2'} tu-flex tu-items-center tu-gap-2.5`}>
                          <p className="tu-text-[26px] tu-font-semibold tu-text-[#333538]">{card.value}</p>
                          {card.meta && isStockoutCard ? (
                            <>
                              <span className="tu-h-7 tu-w-px tu-bg-[#dfe6de]" />
                              <span className="tu-text-[16px] tu-font-medium tu-leading-none tu-text-[#5f656c]">{card.meta}</span>
                            </>
                          ) : null}
                        </div>
                        {card.meta && !isStockoutCard ? (
                          <p className="tu-mt-1 tu-text-[12px] tu-font-medium tu-text-[#8e9299]">{card.meta}</p>
                        ) : null}
                      </article>
                    )})}
                  </div>
                </section>
                ) : null}
                {false ? (
                <section className="tu-mt-5 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-5">
                  <div className="tu-flex tu-flex-col tu-gap-4 xl:tu-flex-row xl:tu-items-center xl:tu-justify-between">
                    <h2 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">Inventory Movements</h2>

                    <div className="tu-flex tu-flex-wrap tu-items-center tu-gap-2.5 sm:tu-gap-3">
                      <div className="tu-relative">
                        <button
                          type="button"
                          onClick={() =>
                            setInventoryMovementMenus((current) => ({
                              date: false,
                              region: false,
                              status: false,
                              groupBy: !current.groupBy
                            }))
                          }
                          className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                        >
                          <BarChart3 className="tu-h-3.5 tu-w-3.5" />
                          <span>{`Group by: ${selectedInventoryGroupBy}`}</span>
                          <ChevronDown className="tu-h-3 tu-w-3" />
                        </button>
                        <SearchableDropdownMenu
                          open={inventoryMovementMenus.groupBy}
                          options={inventoryGroupByOptions}
                          selected={selectedInventoryGroupBy}
                          searchable={false}
                          onSelect={(item) => {
                            setSelectedInventoryGroupBy(item);
                            setInventoryMovementMenus((current) => ({ ...current, groupBy: false }));
                          }}
                        />
                      </div>
                      <span className="tu-mx-0.5 tu-inline-flex tu-h-9 tu-items-center tu-text-[#c2c8c0]">|</span>
                      {[
                        { key: 'date', value: selectedInventoryMovementDate, options: inventoryDateOptions },
                        {
                          key: 'region',
                          value: inventoryMovementLocationSummaryLabel,
                          options: inventoryMovementLocationOptions
                        },
                        {
                          key: 'status',
                          value: `Inventory Stages: ${selectedInventoryStatus}`,
                          options: inventoryStatusOptions
                        }
                      ].map((menu) => (
                        <div key={menu.key} className="tu-relative">
                          <button
                            type="button"
                            onClick={() => {
                              setInventoryMovementMenus((current) => ({
                                date: false,
                                region: false,
                                status: false,
                                groupBy: false,
                                [menu.key]: !current[menu.key as keyof typeof current]
                              }));
                              setInventoryMovementMenuSearch((current) => ({ ...current, [menu.key]: '' }));
                            }}
                            className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                          >
                            <span>{menu.value}</span>
                            <ChevronDown className="tu-h-3 tu-w-3" />
                          </button>

                          <SearchableDropdownMenu
                            open={inventoryMovementMenus[menu.key as keyof typeof inventoryMovementMenus]}
                            options={menu.options}
                            selected={
                              menu.key === 'region'
                                  ? selectedInventoryMovementRegion
                                  : menu.key === 'date'
                                    ? selectedInventoryMovementDate
                                    : selectedInventoryStatus
                            }
                            multiSelect={menu.key === 'region'}
                            searchable={menu.key !== 'date'}
                            searchValue={inventoryMovementMenuSearch[menu.key as keyof typeof inventoryMovementMenuSearch]}
                            onSearchChange={
                              menu.key !== 'date'
                                ? (value) => setInventoryMovementMenuSearch((current) => ({ ...current, [menu.key]: value }))
                                : undefined
                            }
                            widthClass={menu.key === 'status' ? 'tu-w-[240px]' : 'tu-w-[190px]'}
                            showChevronForCustom={menu.key === 'date'}
                            onSelect={(item) => {
                              if (menu.key === 'region') {
                                setSelectedInventoryMovementRegion((current) => toggleMultiSelectValue(current, item));
                                return;
                              }
                              if (menu.key === 'date') setSelectedInventoryMovementDate(item);
                              if (menu.key === 'status') setSelectedInventoryStatus(item);
                              setInventoryMovementMenus({
                                date: false,
                                region: false,
                                status: false,
                                groupBy: false
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="tu-mt-6 tu-grid tu-gap-5 xl:tu-items-start xl:tu-grid-cols-[300px_minmax(0,1fr)]">
                    <article
                      role="button"
                      tabIndex={0}
                      className="tu-group tu-cursor-pointer tu-rounded-[16px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] tu-p-4 tu-shadow-[0_12px_30px_rgba(31,41,55,0.06)] tu-transition-all hover:-tu-translate-y-0.5 hover:tu-border-[#d8e8db] hover:tu-bg-[linear-gradient(180deg,#ffffff_0%,#f3fbf6_100%)] hover:tu-shadow-[0_16px_34px_rgba(16,197,98,0.12)]"
                    >
                      <div className="tu-relative tu-rounded-[14px] tu-border tu-border-[#eef1eb] tu-bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] tu-p-4">
                        <a
                          href="#"
                          onClick={(event) => event.preventDefault()}
                          className="tu-absolute tu-right-4 tu-top-4 tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium tu-text-[#10c562] tu-underline tu-decoration-dotted tu-underline-offset-2 tu-opacity-0 transition-opacity group-hover:tu-opacity-100"
                        >
                          <span>See reports</span>
                          <ChevronRight className="tu-h-4 tu-w-4" />
                        </a>
                        {inventoryMovementKpis.map((metric, index) => {
                          const TrendIcon = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
                          const trendColor = metric.direction === 'up' ? 'tu-text-[#10c562]' : 'tu-text-[#de524c]';
                          const primaryMetric = index === 0;
                          const showTrendArrow = metric.label !== 'Unfulfilled';

                          return (
                            <div
                              key={metric.label}
                              className={`${index > 0 ? 'tu-mt-3 tu-border-t tu-border-dashed tu-border-[#e7ebe4] tu-pt-3' : ''}`}
                            >
                              <div className="tu-flex tu-items-start tu-justify-between tu-gap-2">
                                <div className="tu-group/tooltip tu-relative tu-inline-block">
                                  <span
                                    className={`${
                                      primaryMetric
                                        ? 'tu-text-[13px] tu-font-semibold tu-uppercase tu-tracking-[0.14em] tu-text-[#10c562]'
                                        : 'tu-text-[14px] tu-font-normal tu-text-[#8f9197]'
                                    }`}
                                  >
                                    {metric.label}
                                  </span>
                                  <InfoTooltip text={inventoryMovementKpiTooltips[metric.label]} widthClass="tu-w-[240px]" />
                                </div>
                              </div>

                              <div className={`tu-flex tu-items-end tu-gap-2 ${primaryMetric ? 'tu-mt-2' : 'tu-mt-1.5'}`}>
                                <div className="tu-flex tu-items-end tu-gap-2">
                                  <p
                                    className={`tu-text-[#333538] ${
                                      primaryMetric
                                        ? 'tu-text-[26px] tu-font-semibold tu-leading-none'
                                        : 'tu-text-[19px] tu-font-medium tu-leading-none'
                                    }`}
                                  >
                                    {metric.value}
                                  </p>
                                  {showTrendArrow ? (
                                    <div className="tu-relative">
                                      <button
                                        type="button"
                                        onMouseEnter={() => setHoveredInventoryMovementKpi(metric.label)}
                                        onMouseLeave={() => setHoveredInventoryMovementKpi(null)}
                                        className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[13px] tu-font-medium ${trendColor}`}
                                      >
                                        {metric.trend}
                                        <TrendIcon className="tu-h-4 tu-w-4" />
                                      </button>
                                      {hoveredInventoryMovementKpi === metric.label ? (
                                        <ComparisonPopover comparison={metric.comparison} trend={metric.trend} direction={metric.direction} />
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </article>

                    <div
                      className="tu-relative tu-rounded-[12px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-3 tu-shadow-[0_8px_24px_rgba(31,41,55,0.06)]"
                      onMouseLeave={() => setHoveredInventoryMovementPoint(null)}
                    >
                      <div className="tu-h-[420px]">
                        <Line data={inventoryMovementChartData} options={inventoryMovementChartOptions} />
                      </div>

                      {hoveredInventoryMovementPoint && inventoryMovementTooltipData ? (
                        <div
                          className="tu-pointer-events-none tu-absolute tu-z-30 tu-w-[286px] tu-rounded-[14px] tu-border tu-border-[#e5e9e2] tu-bg-white tu-p-4 tu-shadow-[0_18px_40px_rgba(31,41,55,0.16)]"
                          style={{
                            left: Math.min(Math.max(hoveredInventoryMovementPoint.x - 143, 12), 640),
                            top: Math.max(hoveredInventoryMovementPoint.y - 146, 12)
                          }}
                        >
                          <h3 className="tu-text-[14px] tu-font-semibold tu-leading-5 tu-text-[#333538]">Current vs Previous Period</h3>
                          <div className="tu-my-2.5 tu-h-px tu-bg-[#eceee8]" />

                          <div className="tu-space-y-3">
                            <div>
                              <div className="tu-flex tu-items-center tu-justify-between tu-gap-3">
                                <span className="tu-text-[12px] tu-text-[#44464b]">Current</span>
                                <span className="tu-text-[12px] tu-text-[#44464b]">
                                  {formatTooltipPeriodDate(inventoryMovementTooltipData.currentDate)}
                                </span>
                              </div>
                              <p className="tu-mt-1.5 tu-text-[18px] tu-font-semibold tu-leading-none tu-text-[#333538]">
                                {inventoryMovementTooltipData.current.toLocaleString('en-US')}
                              </p>
                            </div>

                            <div className="tu-h-px tu-bg-[#eceee8]" />

                            <div>
                              <div className="tu-flex tu-items-center tu-justify-between tu-gap-3">
                                <span className="tu-text-[12px] tu-text-[#44464b]">Previous</span>
                                <span className="tu-text-[12px] tu-text-[#44464b]">
                                  {formatTooltipPeriodDate(inventoryMovementTooltipData.previousDate)}
                                </span>
                              </div>
                              <p className="tu-mt-1.5 tu-text-[18px] tu-font-semibold tu-leading-none tu-text-[#333538]">
                                {inventoryMovementTooltipData.previous.toLocaleString('en-US')}
                              </p>
                            </div>

                            <div className="tu-h-px tu-bg-[#eceee8]" />

                            <div className="tu-flex tu-items-end tu-justify-between tu-gap-3">
                              <div>
                                <p className="tu-text-[12px] tu-font-semibold tu-text-[#333538]">Change</p>
                                <p className="tu-mt-1.5 tu-text-[18px] tu-font-semibold tu-leading-none tu-text-[#333538]">
                                  {Math.abs(inventoryMovementTooltipData.change).toLocaleString('en-US')}
                                </p>
                              </div>
                              <span
                                className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-semibold ${
                                  inventoryMovementTooltipData.change >= 0 ? 'tu-text-[#10c562]' : 'tu-text-[#de524c]'
                                }`}
                              >
                                {inventoryMovementTooltipData.change >= 0 ? (
                                  <ArrowUpRight className="tu-h-3.5 tu-w-3.5" />
                                ) : (
                                  <ArrowDownRight className="tu-h-3.5 tu-w-3.5" />
                                )}
                                {inventoryMovementTooltipData.changePercent}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>
                ) : null}
                <section className="tu-mt-5 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-5">
                  <div className="tu-flex tu-flex-col tu-gap-4 xl:tu-flex-row xl:tu-items-center xl:tu-justify-between">
                    <h2 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">Inventory Health Tracking</h2>
                    <div className="tu-flex tu-flex-wrap tu-gap-2.5 sm:tu-gap-3">
                      <div className="tu-relative">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenInventoryHealthFilterPill(null);
                            setInventoryHealthMenus((current) => ({
                              location: false,
                              date: false,
                              searchBy: false,
                              filterType: !current.filterType
                            }));
                          }}
                          className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                        >
                          <SlidersHorizontal className="tu-h-3.5 tu-w-3.5" />
                          <span>{activeInventoryHealthFilters.length > 0 ? `Filters (${activeInventoryHealthFilters.length})` : 'Add Filter'}</span>
                          <ChevronDown className="tu-h-3 tu-w-3" />
                        </button>
                        <SearchableDropdownMenu
                          open={inventoryHealthMenus.filterType}
                          options={inventoryHealthFilterTypeOptions}
                          selected={activeInventoryHealthFilters.map((key) => inventoryHealthFilterLabelMap[key])}
                          multiSelect
                          searchable={false}
                          widthClass="tu-w-[200px]"
                          onSelect={(item) => {
                            const filterKey = inventoryHealthFilterFromLabel[item];
                            if (!filterKey) return;
                            setActiveInventoryHealthFilters((current) =>
                              current.includes(filterKey) ? current.filter((key) => key !== filterKey) : [...current, filterKey]
                            );
                          }}
                        />
                      </div>
                      {activeInventoryHealthFilters.map((filterKey) => (
                        <div key={filterKey} className="tu-relative">
                          <button
                            type="button"
                            onClick={() => {
                              setInventoryHealthMenus({ location: false, date: false, searchBy: false, filterType: false });
                              setOpenInventoryHealthFilterPill((current) => (current === filterKey ? null : filterKey));
                            }}
                            className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-full tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-pl-3 tu-pr-2 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                          >
                            <span>{inventoryHealthFilterLabelMap[filterKey]}</span>
                            <span className="tu-inline-flex tu-rounded-full tu-bg-[#e9f3ec] tu-px-1.5 tu-py-0.5 tu-text-[10px] tu-font-semibold tu-text-[#4b8a60]">
                              {selectedInventoryHealthFilters[filterKey].length}
                            </span>
                            <ChevronDown className="tu-h-3 tu-w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenInventoryHealthFilterPill(null);
                              setActiveInventoryHealthFilters((current) => current.filter((key) => key !== filterKey));
                              setSelectedInventoryHealthFilters((current) => ({ ...current, [filterKey]: [] }));
                            }}
                            className="tu-absolute -tu-right-1.5 -tu-top-1.5 tu-inline-flex tu-h-4.5 tu-w-4.5 tu-items-center tu-justify-center tu-rounded-full tu-border tu-border-[#dfe5dc] tu-bg-white tu-text-[#8d9096] hover:tu-text-[#2a2c2f]"
                            aria-label={`Remove ${inventoryHealthFilterLabelMap[filterKey]} filter`}
                          >
                            <X className="tu-h-3 tu-w-3" />
                          </button>
                          <SearchableDropdownMenu
                            open={openInventoryHealthFilterPill === filterKey}
                            options={inventoryHealthFilterOptionsByKey[filterKey]}
                            selected={selectedInventoryHealthFilters[filterKey]}
                            multiSelect
                            searchable
                            widthClass="tu-w-[220px]"
                            searchValue={inventoryHealthMenuSearch[filterKey]}
                            onSearchChange={(value) =>
                              setInventoryHealthMenuSearch((current) => ({ ...current, [filterKey]: value }))
                            }
                            onSelect={(item) =>
                              setSelectedInventoryHealthFilters((current) => ({
                                ...current,
                                [filterKey]: toggleMultiSelectValue(current[filterKey], item)
                              }))
                            }
                          />
                        </div>
                      ))}
                      {[
                        { key: 'location', value: inventoryHealthLocationSummaryLabel, options: inventoryLocationOptions },
                        { key: 'date', value: selectedInventoryHealthDate, options: inventoryDateOptions }
                      ].map((menu) => (
                        <div key={menu.key} className="tu-relative">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenInventoryHealthFilterPill(null);
                              setInventoryHealthMenus((current) => ({
                                location: false,
                                date: false,
                                searchBy: false,
                                filterType: false,
                                [menu.key]: !current[menu.key as keyof typeof current]
                              }));
                              setInventoryHealthMenuSearch((current) => ({ ...current, [menu.key]: '' }));
                            }}
                            className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                          >
                            <span>{menu.value}</span>
                            <ChevronDown className="tu-h-3 tu-w-3" />
                          </button>
                          <SearchableDropdownMenu
                            open={inventoryHealthMenus[menu.key as keyof typeof inventoryHealthMenus]}
                            options={menu.options}
                            selected={
                              menu.key === 'location'
                                  ? selectedInventoryHealthLocation
                                  : selectedInventoryHealthDate
                            }
                            multiSelect={menu.key === 'location'}
                            searchable={menu.key !== 'date'}
                            searchValue={inventoryHealthMenuSearch[menu.key as keyof typeof inventoryHealthMenuSearch]}
                            onSearchChange={
                              menu.key !== 'date'
                                ? (value) => setInventoryHealthMenuSearch((current) => ({ ...current, [menu.key]: value }))
                                : undefined
                            }
                            widthClass={menu.key === 'location' ? 'tu-w-[230px]' : 'tu-w-[190px]'}
                            showChevronForCustom={menu.key === 'date'}
                            onSelect={(item) => {
                              if (menu.key === 'location') return setSelectedInventoryHealthLocation((current) => toggleMultiSelectValue(current, item));
                              if (menu.key === 'date') setSelectedInventoryHealthDate(item);
                              setInventoryHealthMenus({ location: false, date: false, searchBy: false, filterType: false });
                            }}
                          />
                        </div>
                      ))}
                      <span className="tu-inline-flex tu-h-9 tu-items-center tu-text-[#c2c8c0]">|</span>
                      <button
                        type="button"
                        onClick={handleInventoryHealthExport}
                        disabled={inventoryHealthVisibleProducts.length === 0}
                        className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#10c562] tu-bg-[#10c562] tu-px-3.5 tu-text-[12px] tu-font-semibold tu-text-white tu-shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-colors hover:tu-bg-[#0ea856] hover:tu-border-[#0ea856] disabled:tu-cursor-not-allowed disabled:tu-opacity-50"
                      >
                        <Download className="tu-h-3.5 tu-w-3.5" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>
                  <div className="tu-mt-4 tu-flex tu-flex-col tu-gap-2 sm:tu-flex-row sm:tu-items-center">
                    <div className="tu-relative tu-flex-1">
                      <Search className="tu-pointer-events-none tu-absolute tu-left-3 tu-top-1/2 tu-h-3.5 tu-w-3.5 -tu-translate-y-1/2 tu-text-[#9a9ca2]" />
                      <input
                        value={inventoryHealthSearchTerm}
                        onChange={(event) => setInventoryHealthSearchTerm(event.target.value)}
                        placeholder={`Search by ${inventoryHealthSearchFieldLabel}`}
                        className="tu-h-10 tu-w-full tu-rounded-[10px] tu-border tu-border-[#e1e6de] tu-bg-[#fafbf8] tu-pl-9 tu-pr-3 tu-text-[13px] tu-text-[#2f3133] outline-none placeholder:tu-text-[#9a9ca2] focus:tu-border-[#c6d3c1]"
                      />
                    </div>
                    <div className="tu-relative sm:tu-w-[190px]">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenInventoryHealthFilterPill(null);
                          setInventoryHealthMenus((current) => ({
                            location: false,
                            date: false,
                            filterType: false,
                            searchBy: !current.searchBy
                          }));
                        }}
                        className="tu-inline-flex tu-h-10 tu-w-full tu-items-center tu-justify-between tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#e1e6de] tu-bg-[#fafbf8] tu-px-3 tu-text-[12px] tu-font-medium tu-text-[#5f656c] hover:tu-border-[#c6d3c1] hover:tu-bg-white"
                      >
                        <span>{`Search by: ${inventoryHealthSearchFieldLabel}`}</span>
                        <ChevronDown className="tu-h-3 tu-w-3" />
                      </button>
                      <SearchableDropdownMenu
                        open={inventoryHealthMenus.searchBy}
                        options={inventoryHealthSearchFieldOptions}
                        selected={inventoryHealthSearchFieldLabel}
                        searchable={false}
                        widthClass="tu-w-[190px]"
                        onSelect={(item) => {
                          const searchField = inventoryHealthSearchFieldFromLabel[item];
                          if (searchField) setSelectedInventoryHealthSearchField(searchField);
                          setInventoryHealthMenus({ location: false, date: false, searchBy: false, filterType: false });
                        }}
                      />
                    </div>
                  </div>
                  <div className="tu-mt-4 tu-overflow-hidden tu-rounded-[12px] tu-border tu-border-[#eceee8]">
                    <div className="tu-max-h-[520px] tu-overflow-auto">
                      <table className="tu-w-full tu-min-w-max tu-border-collapse">
                        <thead className="tu-sticky tu-top-0 tu-z-10 tu-bg-[#f8faf7]">
                          <tr className="tu-border-b tu-border-[#e8ece5]">
                            {inventoryHealthVisibleColumns.map((column) => (
                              <th
                                key={column.key}
                                className={`tu-px-3 tu-py-2.5 tu-text-left ${column.key === 'name' ? 'tu-w-[360px] tu-min-w-[360px]' : ''}`}
                              >
                                {column.key === 'deadStocks' ? (
                                  <div className="tu-relative">
                                    <button
                                      type="button"
                                      onClick={() => handleInventoryHealthSort(column.key)}
                                      onMouseEnter={(event) => {
                                        const rect = event.currentTarget.getBoundingClientRect();
                                        setInventoryHealthHeaderTooltip({
                                          key: column.tooltipKey,
                                          x: Math.max(12, rect.left),
                                          y: Math.max(12, rect.top - 12)
                                        });
                                      }}
                                      onMouseLeave={() => setInventoryHealthHeaderTooltip(null)}
                                      className="tu-group/tooltip tu-relative tu-inline-flex tu-items-center tu-gap-1.5 tu-text-[12px] tu-font-semibold tu-text-[#5f656c]"
                                    >
                                      <span className="tu-text-left">
                                        <span className="tu-block">{column.label}</span>
                                      </span>
                                      {renderInventoryHealthSortIcon(column.key)}
                                    </button>
                                    <div className="tu-mt-0.5 tu-text-[11px] tu-font-medium tu-text-[#5f656c]">
                                      <span>(Aging &gt; </span>
                                      <button
                                        type="button"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setDeadStockAgingMenuOpen((current) => !current);
                                        }}
                                        className="tu-inline-flex tu-items-center tu-gap-0.5 tu-text-[11px] tu-font-normal tu-text-[#5f656c] hover:tu-text-[#2a2c2f]"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                      >
                                        <span>{selectedDeadStockAgingDays}</span>
                                        <span>Days</span>
                                        <ChevronDown className="tu-h-3 tu-w-3" />
                                      </button>
                                      <span>)</span>
                                    </div>
                                    {deadStockAgingMenuOpen ? (
                                      <div className="tu-absolute tu-left-0 tu-top-[calc(100%+6px)] tu-z-30 tu-w-[88px] tu-rounded-[10px] tu-border tu-border-[#e6e7e4] tu-bg-white tu-p-1.5 tu-shadow-[0_10px_24px_rgba(31,41,55,0.14)]">
                                        <div className="tu-space-y-0.5">
                                          {deadStockAgingDayOptions.map((item) => {
                                            const isSelected = selectedDeadStockAgingDays === item;
                                            return (
                                              <button
                                                key={item}
                                                type="button"
                                                onClick={() => {
                                                  setSelectedDeadStockAgingDays(item);
                                                  setDeadStockAgingMenuOpen(false);
                                                }}
                                                className={`tu-flex tu-h-7 tu-w-full tu-items-center tu-justify-center tu-rounded-[7px] tu-text-[11px] tu-font-normal ${
                                                  isSelected
                                                    ? 'tu-bg-[#f3f5f1] tu-text-[#2a2c2f]'
                                                    : 'tu-text-[#3f444a] hover:tu-bg-[#f7f8f5]'
                                                }`}
                                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                              >
                                                {item}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleInventoryHealthSort(column.key)}
                                    onMouseEnter={(event) => {
                                      const rect = event.currentTarget.getBoundingClientRect();
                                      setInventoryHealthHeaderTooltip({
                                        key: column.tooltipKey,
                                        x: Math.max(12, rect.left),
                                        y: Math.max(12, rect.top - 12)
                                      });
                                    }}
                                    onMouseLeave={() => setInventoryHealthHeaderTooltip(null)}
                                    className="tu-group/tooltip tu-relative tu-inline-flex tu-items-center tu-gap-1.5 tu-text-[12px] tu-font-semibold tu-text-[#5f656c]"
                                  >
                                    <span className="tu-text-left">
                                      <span className="tu-block">{column.label}</span>
                                      {column.subtitle ? <span className="tu-block tu-text-[11px] tu-font-medium">{column.subtitle}</span> : null}
                                    </span>
                                    {renderInventoryHealthSortIcon(column.key)}
                                  </button>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryHealthVisibleProducts.map((product) => (
                            <tr key={product.id} className="tu-border-b tu-border-[#edf0ea] hover:tu-bg-[#fbfcfa]">
                              {inventoryHealthVisibleColumns.map((column) => (
                                <td
                                  key={`${product.id}-${column.key}`}
                                  className={`tu-px-3 tu-py-2.5 ${column.key === 'name' ? 'tu-text-left' : 'tu-text-center'} tu-align-middle`}
                                >
                                  {column.key === 'name' ? (
                                    <div className="tu-flex tu-items-center tu-gap-3">
                                      <img src={product.image} alt={product.name} className="tu-h-10 tu-w-10 tu-rounded-[10px] tu-border tu-border-[#e5e9e2] tu-object-cover" />
                                      <div>
                                        <p className="tu-text-[13px] tu-font-medium tu-text-[#2f3133]">{product.name}</p>
                                        <p className="tu-text-[11px] tu-text-[#8f949b]">{product.sku}</p>
                                      </div>
                                    </div>
                                  ) : null}
                                  {column.key === 'quantityIn' ? (
                                    <span className="tu-text-[13px] tu-text-[#333538]">{product.quantityIn.toLocaleString('en-US')}</span>
                                  ) : null}
                                  {column.key === 'quantityOut' ? (
                                    <span className="tu-text-[13px] tu-text-[#333538]">{product.quantityOut.toLocaleString('en-US')}</span>
                                  ) : null}
                                  {column.key === 'deadStocks' ? (
                                    <span className="tu-text-[13px] tu-text-[#333538]">{product.deadStocks.toLocaleString('en-US')}</span>
                                  ) : null}
                                  {column.key === 'salesVelocity' ? (
                                    <span className="tu-text-[13px] tu-text-[#333538]">{product.salesVelocity.toFixed(1)} units/day</span>
                                  ) : null}
                                  {column.key === 'stockToSalesRatio' ? (
                                    <span className="tu-text-[13px] tu-text-[#333538]">{product.stockToSalesRatio.toFixed(2)}x</span>
                                  ) : null}
                                  {column.key === 'inventoryTurnoverRatio' ? (
                                    <span className="tu-text-[13px] tu-text-[#333538]">{product.inventoryTurnoverRatio.toFixed(2)}x</span>
                                  ) : null}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="tu-flex tu-items-center tu-justify-between tu-border-t tu-border-[#edf0ea] tu-bg-[#fafbf8] tu-px-3.5 tu-py-2">
                      <p className="tu-text-[12px] tu-text-[#7f838a]">
                        Showing {inventoryHealthVisibleProducts.length.toLocaleString('en-US')} of {inventoryHealthSortedProducts.length.toLocaleString('en-US')} products
                      </p>
                      <p className="tu-text-[11px] tu-font-medium tu-text-[#8f949b]">
                        {inventoryHealthVisibleProducts.length < inventoryHealthSortedProducts.length
                          ? `Displaying first ${inventoryHealthDisplayLimit} products. Use Export for table data.`
                          : 'Use Export to download table data.'}
                      </p>
                    </div>
                  </div>
                  {inventoryHealthHeaderTooltip ? (
                    <div
                      className="tu-pointer-events-none tu-fixed tu-z-[120] tu-w-[270px] -tu-translate-y-full tu-rounded-md tu-bg-[#111111] tu-px-2.5 tu-py-2 tu-text-[11px] tu-leading-4 tu-text-white tu-shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
                      style={{ left: inventoryHealthHeaderTooltip.x, top: inventoryHealthHeaderTooltip.y }}
                    >
                      {renderFloatingTooltipBody(
                        inventoryHealthHeaderTooltips[inventoryHealthHeaderTooltip.key] ?? 'No tooltip available'
                      )}
                    </div>
                  ) : null}
                </section>
                </>
              ) : null}
              {activeTab !== 'inventory' ? (
                <>
              <section className="tu-hidden tu-order-2 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-3.5 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-4">
              <h1 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">Sales  Overview</h1>

              <div className="tu-mt-4 tu-grid tu-gap-3 xl:tu-grid-cols-4">
                {periods.map((period) => {
                  const isDateMenuOpen = openDateMenu === period.key;

                  return (
                    <article
                      key={period.key}
                      className="tu-relative tu-overflow-visible tu-rounded-[12px] tu-border tu-border-[#eceee8] tu-bg-white tu-pb-2.5 tu-pr-2.5 tu-pt-3.5 tu-pl-3.5 tu-shadow-[0_8px_24px_rgba(31,41,55,0.08)]"
                    >
                      <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
                        <div>
                          <h2 className="tu-text-[17px] tu-font-semibold tu-leading-none tu-text-[#333538]">
                            {cardDates[period.key].title}
                          </h2>
                          <p className="tu-mt-1.5 tu-text-[13px] tu-text-[#95979d]">{cardDates[period.key].dateLabel}</p>
                        </div>

                        <div className="tu-relative">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDateMenu(isDateMenuOpen ? null : period.key);
                              setCustomDateCard(null);
                              setDateMenuSearch('');
                            }}
                            className="tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium tu-text-[#7f838a] hover:tu-text-[#2a2c2f]"
                          >
                            <span>Select Date</span>
                            <ChevronDown className="tu-h-3 tu-w-3" />
                          </button>

                          <SearchableDropdownMenu
                            open={isDateMenuOpen}
                            options={dateMenu}
                            selected=""
                            searchable={false}
                            widthClass="tu-w-[190px]"
                            showChevronForCustom
                            onSelect={(item) => {
                              if (item === 'Custom') {
                                setCustomDateCard(period.key);
                                return;
                              }

                              const presetMap = {
                                Today: 'today',
                                Yesterday: 'yesterday',
                                'Last 7 Days': 'last7',
                                'Last 30 Days': 'last30',
                                'Last 90 Days': 'last90',
                                'Last 365 Days': 'last365'
                              } as const;
                              applyDatePreset(period.key, presetMap[item as keyof typeof presetMap]);
                            }}
                          />

                          {customDateCard === period.key ? (
                            <div className="tu-absolute tu-right-0 tu-top-[calc(100%+10px)] tu-z-40 tu-w-[230px] tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-p-3 tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                              <div className="tu-space-y-3">
                                <div>
                                  <label className="tu-mb-1 tu-block tu-text-[11px] tu-font-medium tu-text-[#7f838a]">
                                    From
                                  </label>
                                  <input
                                    type="date"
                                    value={cardDates[period.key].from}
                                    onChange={(event) =>
                                      setCardDates((current) => ({
                                        ...current,
                                        [period.key]: { ...current[period.key], from: event.target.value }
                                      }))
                                    }
                                    className="tu-w-full tu-rounded-md tu-border tu-border-[#dde2d8] tu-px-2.5 tu-py-2 tu-text-[12px] outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="tu-mb-1 tu-block tu-text-[11px] tu-font-medium tu-text-[#7f838a]">
                                    To
                                  </label>
                                  <input
                                    type="date"
                                    value={cardDates[period.key].to}
                                    onChange={(event) =>
                                      setCardDates((current) => ({
                                        ...current,
                                        [period.key]: { ...current[period.key], to: event.target.value }
                                      }))
                                    }
                                    className="tu-w-full tu-rounded-md tu-border tu-border-[#dde2d8] tu-px-2.5 tu-py-2 tu-text-[12px] outline-none"
                                  />
                                </div>
                                <div className="tu-flex tu-justify-end tu-gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setCustomDateCard(null)}
                                    className="tu-rounded-md tu-border tu-border-[#dde2d8] tu-px-2.5 tu-py-1.5 tu-text-[11px] tu-font-medium tu-text-[#72767d]"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => applyCustomDateRange(period.key)}
                                    className="tu-rounded-md tu-bg-[#10c562] tu-px-2.5 tu-py-1.5 tu-text-[11px] tu-font-medium tu-text-white"
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="tu-mt-3 tu-h-px tu-bg-[#eceee8]" />

                      <div className="tu-mt-3 tu-grid tu-grid-cols-2 tu-gap-x-3 tu-gap-y-3">
                        {period.metrics.map((metric) => {
                          const trend = metricTrendStyles[metric.key];
                          const metricPopoverRows = getMetricPopoverContent(period.key, metric.key);
                          const metricHoverOpen =
                            metric.key !== 'expenses' &&
                            metricPopoverRows.length > 0 &&
                            hoveredMetric?.period === period.key &&
                            hoveredMetric.metric === metric.key;
                          const trendHoverOpen =
                            hoveredTrend?.period === period.key && hoveredTrend.metric === metric.key;
                          const TrendIcon = trend.direction === 'up' ? ArrowUpRight : ArrowDownRight;

                          return (
                            <div key={metric.key} className="tu-relative">
                              <div className="tu-group tu-relative tu-inline-block">
                                <button
                                  type="button"
                                  className="tu-text-[13px] tu-text-[#9a9ca2]"
                                >
                                  {metric.label}
                                </button>
                                <InfoTooltip
                                  text={metricTooltips[metric.key]}
                                  widthClass={metric.key === 'cogs' || metric.key === 'expenses' ? 'tu-w-[180px]' : 'tu-w-[260px]'}
                                />
                              </div>
                              <button
                                type="button"
                                onMouseEnter={() => setHoveredMetric({ period: period.key, metric: metric.key })}
                                onMouseLeave={() => setHoveredMetric(null)}
                                className="tu-mt-0.5 tu-block tu-text-left"
                              >
                                <span className="tu-text-[15px] tu-font-semibold tu-text-[#333538] tu-underline tu-underline-offset-4">
                                  {metric.value}
                                </span>
                              </button>
                              <button
                                type="button"
                                onMouseEnter={() => setHoveredTrend({ period: period.key, metric: metric.key })}
                                onMouseLeave={() => setHoveredTrend(null)}
                                className={`tu-mt-0.5 tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium ${
                                  trend.direction === 'up' ? 'tu-text-[#10c562]' : 'tu-text-[#de524c]'
                                }`}
                              >
                                <span>{trend.delta}</span>
                                <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                              </button>

                              {metricHoverOpen ? (
                                <div
                                  className={`tu-absolute tu-z-20 tu-w-[264px] tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-p-2.5 tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)] ${
                                    metric.key === 'netProfit'
                                      ? 'tu-left-auto tu-right-0 tu-top-[calc(100%+10px)] before:tu-top-[-7px] before:tu-right-[34px] before:tu-border-l before:tu-border-t'
                                      : 'tu-bottom-[calc(100%+10px)] tu-left-0 before:tu-bottom-[-7px] before:tu-left-[34px] before:tu-border-b before:tu-border-r'
                                  } before:tu-absolute before:tu-h-3.5 before:tu-w-3.5 before:tu-rotate-45 before:tu-border-[#ededed] before:tu-bg-white before:tu-content-['']`}
                                >
                                  <div className="tu-space-y-1.5">
                                    {metricPopoverRows.map((item) => (
                                      <div
                                        key={`${metric.key}-${item.label}`}
                                        className={`tu-flex tu-items-end tu-justify-between tu-gap-3 ${
                                          item.dividerBefore ? 'tu-border-t tu-border-[#eceee8] tu-pt-1.5' : ''
                                        }`}
                                      >
                                        <span
                                          className={`tu-text-[12px] ${
                                            item.medium ? 'tu-font-semibold tu-text-[#333538]' : 'tu-text-[#44464b]'
                                          }`}
                                        >
                                          <span>{item.label}</span>
                                        </span>
                                        <span
                                          className={`tu-text-[12px] ${
                                            item.medium ? 'tu-font-semibold tu-text-[#333538]' : 'tu-text-[#44464b]'
                                          }`}
                                        >
                                          {item.prefix ? `${item.prefix} ` : ''}{item.value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null}

                              {trendHoverOpen ? (
                                <div className="tu-absolute tu-bottom-[calc(100%+10px)] tu-left-0 tu-z-20 tu-w-[245px] tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-p-0 tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                                  <div className="tu-border-b tu-border-[#eceee8] tu-px-4 tu-py-2.5">
                                    <h3 className="tu-text-[11px] tu-font-semibold tu-text-[#333538]">
                                      Current vs Previous Period
                                    </h3>
                                  </div>
                                  <div className="tu-px-4 tu-py-3">
                                    <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
                                      <div>
                                        <p className="tu-text-[11px] tu-text-[#44464b]">
                                          {trendPopoverContent[metric.key].currentLabel}
                                        </p>
                                        <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">
                                          {trendPopoverContent[metric.key].currentValue}
                                        </p>
                                      </div>
                                      <p className="tu-text-[11px] tu-text-[#44464b]">
                                        {trendPopoverContent[metric.key].currentDate}
                                      </p>
                                    </div>
                                    <div className="tu-my-2.5 tu-h-px tu-bg-[#eceee8]" />
                                    <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
                                      <div>
                                        <p className="tu-text-[11px] tu-text-[#44464b]">
                                          {trendPopoverContent[metric.key].previousLabel}
                                        </p>
                                        <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">
                                          {trendPopoverContent[metric.key].previousValue}
                                        </p>
                                      </div>
                                      <p className="tu-text-[11px] tu-text-[#44464b]">
                                        {trendPopoverContent[metric.key].previousDate}
                                      </p>
                                    </div>
                                    <div className="tu-my-2.5 tu-h-px tu-bg-[#eceee8]" />
                                    <div className="tu-flex tu-items-center tu-justify-between tu-gap-3">
                                      <div>
                                        <p className="tu-text-[11px] tu-font-semibold tu-text-[#333538]">Change</p>
                                        <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">
                                          {trendPopoverContent[metric.key].changeValue}
                                        </p>
                                      </div>
                                      <div
                                        className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[11px] tu-font-semibold ${
                                          trendPopoverContent[metric.key].direction === 'up'
                                            ? 'tu-text-[#10c562]'
                                            : 'tu-text-[#de524c]'
                                        }`}
                                      >
                                        {trendPopoverContent[metric.key].direction === 'up' ? (
                                          <ArrowUpRight className="tu-h-3.5 tu-w-3.5" />
                                        ) : (
                                          <ArrowDownRight className="tu-h-3.5 tu-w-3.5" />
                                        )}
                                        <span>{trendPopoverContent[metric.key].changePercent}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      <div className="tu-mt-3 tu-h-px tu-bg-[#eceee8]" />

                      <div className="tu-mt-3 tu-flex tu-w-full tu-justify-between tu-gap-3 tu-rounded-[8px] tu-bg-[#f2f2f1] tu-px-3 tu-py-2">
                        {period.footer.map((item) => (
                          <div key={item.label} className="tu-min-w-0">
                            <div className="tu-group tu-relative tu-inline-block">
                              <button type="button" className="tu-text-[13px] tu-text-[#8f9197]">
                                {item.label}
                              </button>
                              <div className="tu-pointer-events-none tu-absolute tu-bottom-[calc(100%+8px)] tu-left-0 tu-z-30 tu-w-[180px] tu-rounded-md tu-bg-[#111111] tu-px-2.5 tu-py-2 tu-text-[11px] tu-leading-4 tu-text-white tu-opacity-0 tu-shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-opacity group-hover:tu-opacity-100">
                                {footerTooltips[item.label] ?? item.label}
                              </div>
                            </div>
                            <p className="tu-mt-1 tu-text-[15px] tu-font-medium tu-text-[#333538]">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="tu-hidden tu-order-2 tu-mt-5 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-3.5 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-4">
              <div className="tu-flex tu-flex-col tu-gap-3 tu-pb-2 lg:tu-flex-row lg:tu-items-start lg:tu-justify-between">
                <h2 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">
                  Key Performance Metrics at a Glance
                </h2>

                <div className="tu-flex tu-flex-col tu-gap-2 sm:tu-flex-row">
                  <div className="tu-relative">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenGlanceDateMenu((current) => !current);
                        setOpenStoreMenu(false);
                        setGlanceMenuSearch((current) => ({ ...current, date: '' }));
                      }}
                      className="tu-inline-flex tu-h-10 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-4 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                    >
                      <span>{selectedGlanceDate}</span>
                      <ChevronDown className="tu-h-3 tu-w-3" />
                    </button>

                    <SearchableDropdownMenu
                      open={openGlanceDateMenu}
                      options={glanceDateOptions}
                      selected={selectedGlanceDate}
                      searchable={false}
                      widthClass="tu-w-[190px]"
                      showChevronForCustom
                      onSelect={(item) => {
                        setSelectedGlanceDate(item);
                        setOpenGlanceDateMenu(false);
                        setGlanceMenuSearch((current) => ({ ...current, date: '' }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="tu-mt-3 tu-grid tu-gap-3 lg:tu-grid-cols-4">
                {glanceMetrics.map((metric) => {
                  const TrendIcon = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
                  const trendColor = metric.direction === 'up' ? 'tu-text-[#10c562]' : 'tu-text-[#de524c]';

                  return (
                    <article
                      key={metric.label}
                      className="tu-rounded-[12px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-3 tu-shadow-[0_8px_24px_rgba(31,41,55,0.08)]"
                    >
                      <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
                        <div className="tu-min-w-0">
                          <div className="tu-group tu-relative tu-inline-block">
                            <button type="button" className="tu-text-[13px] tu-text-[#9a9ca2]">
                              {metric.label}
                            </button>
                            <InfoTooltip
                              text={glanceKpiTooltips[metric.label]}
                              widthClass={
                                metric.label === 'Customer Lifetime Value'
                                  ? 'tu-w-[360px]'
                                  : metric.label === 'Average Order Value'
                                    ? 'tu-w-[280px]'
                                    : metric.label === 'Customer Retention'
                                      ? 'tu-w-[280px]'
                                    : 'tu-w-[190px]'
                              }
                            />
                          </div>
                          <div className="tu-mt-1">
                            <p className="tu-text-[21px] tu-font-semibold tu-text-[#333538]">{metric.value}</p>
                          </div>
                        </div>

                        {metric.showStoreSelect ? (
                          <div className="tu-relative">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenStoreMenu((current) => !current);
                                setOpenGlanceDateMenu(false);
                                setGlanceMenuSearch((current) => ({ ...current, store: '' }));
                              }}
                              className="tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium tu-text-[#7f838a] hover:tu-text-[#2a2c2f]"
                            >
                              <span>{formatMultiSelectLabel(selectedStore, 'Select Store', 'store', 'stores')}</span>
                              <ChevronDown className="tu-h-3 tu-w-3" />
                            </button>

                            <SearchableDropdownMenu
                              open={openStoreMenu}
                              options={storeOptions}
                              selected={selectedStore}
                              multiSelect
                              searchValue={glanceMenuSearch.store}
                              onSearchChange={(value) => setGlanceMenuSearch((current) => ({ ...current, store: value }))}
                              widthClass="tu-w-[220px]"
                              onSelect={(item) => setSelectedStore((current) => toggleMultiSelectValue(current, item))}
                            />
                          </div>
                        ) : null}
                      </div>
                      <div className="tu-mt-3 tu-flex tu-items-center tu-gap-2">
                        <div className="tu-relative">
                          <button
                            type="button"
                            onMouseEnter={() => setHoveredGlanceKpi(metric.label)}
                            onMouseLeave={() => setHoveredGlanceKpi(null)}
                            className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium ${trendColor}`}
                          >
                            {metric.trend}
                            <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                          </button>
                          {hoveredGlanceKpi === metric.label ? (
                            <ComparisonPopover comparison={metric.comparison} trend={metric.trend} direction={metric.direction} />
                          ) : null}
                        </div>
                        <span className="tu-text-[12px] tu-text-[#9a9ca2]">{metric.sublabel}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="tu-order-2 tu-mt-5 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-5">
              <div className="tu-flex tu-flex-col tu-gap-4 xl:tu-flex-row xl:tu-items-center xl:tu-justify-between">
                <h2 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">Sales Performance by Store</h2>

                <div className="tu-flex tu-flex-wrap tu-items-center tu-gap-2.5 sm:tu-gap-3">
                  <div className="tu-relative">
                    <button
                      type="button"
                      onClick={() =>
                        setSalesMenus((current) => ({
                          store: false,
                          metric: false,
                          date: false,
                          region: false,
                          groupBy: !current.groupBy
                        }))
                      }
                      className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                    >
                      <BarChart3 className="tu-h-3.5 tu-w-3.5" />
                      <span>{`Group by: ${selectedSalesGroupBy}`}</span>
                      <ChevronDown className="tu-h-3 tu-w-3" />
                    </button>
                    <SearchableDropdownMenu
                      open={salesMenus.groupBy}
                      options={inventoryGroupByOptions}
                      selected={selectedSalesGroupBy}
                      searchable={false}
                      onSelect={(item) => {
                        setSelectedSalesGroupBy(item);
                        setSalesMenus((current) => ({ ...current, groupBy: false }));
                      }}
                    />
                  </div>
                  <span className="tu-mx-0.5 tu-inline-flex tu-h-9 tu-items-center tu-text-[#c2c8c0]">|</span>
                  {[
                    {
                      key: 'store',
                      value: salesStoreSummaryLabel,
                      options: salesStoreOptions
                    },
                    { key: 'metric', value: selectedSalesMetric, options: salesMetricOptions },
                    { key: 'date', value: selectedSalesDate, options: salesDateOptions },
                    {
                      key: 'region',
                      value: formatLocationFilterLabel(selectedSalesRegion),
                      options: []
                    }
                  ].map((menu) => (
                    <div key={menu.key} className="tu-relative">
                      <button
                        type="button"
                        onClick={() => {
                          setSalesMenus((current) => ({
                            store: false,
                            metric: false,
                            date: false,
                            region: false,
                            groupBy: false,
                            [menu.key]: !current[menu.key as keyof typeof current]
                          }));
                          setSalesMenuSearch((current) => ({ ...current, [menu.key]: '' }));
                          if (menu.key === 'region') setSalesRegionProvince(null);
                        }}
                        className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                      >
                        <span>{menu.value}</span>
                        <ChevronDown className="tu-h-3 tu-w-3" />
                      </button>

                      {menu.key === 'region' ? (
                        <HierarchicalLocationDropdown
                          open={salesMenus.region}
                          selected={selectedSalesRegion}
                          onChange={setSelectedSalesRegion}
                          searchValue={salesMenuSearch.region}
                          onSearchChange={(value) => setSalesMenuSearch((current) => ({ ...current, region: value }))}
                          activeProvince={salesRegionProvince}
                          onProvinceChange={setSalesRegionProvince}
                        />
                      ) : (
                        <SearchableDropdownMenu
                          open={salesMenus[menu.key as keyof typeof salesMenus]}
                          options={menu.options}
                          selected={menu.key === 'store' ? selectedSalesStore : menu.key === 'metric' ? selectedSalesMetric : selectedSalesDate}
                          multiSelect={menu.key === 'store'}
                          searchable={menu.key !== 'date'}
                          searchValue={salesMenuSearch[menu.key as keyof typeof salesMenuSearch]}
                          onSearchChange={
                            menu.key !== 'date'
                              ? (value) => setSalesMenuSearch((current) => ({ ...current, [menu.key]: value }))
                              : undefined
                          }
                          widthClass={menu.key === 'store' ? 'tu-w-[220px]' : 'tu-w-[190px]'}
                          showChevronForCustom={menu.key === 'date'}
                          onSelect={(item) => {
                            if (menu.key === 'store') {
                              setSelectedSalesStore((current) => toggleMultiSelectValue(current, item));
                              return;
                            }
                            if (menu.key === 'metric') setSelectedSalesMetric(item);
                            if (menu.key === 'date') setSelectedSalesDate(item);
                            setSalesMenus({ store: false, metric: false, date: false, region: false, groupBy: false });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tu-mt-6 tu-grid tu-gap-5 xl:tu-grid-cols-[300px_minmax(0,1fr)]">
                <article className="tu-group/card tu-cursor-pointer tu-rounded-[16px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] tu-p-4 tu-shadow-[0_12px_30px_rgba(31,41,55,0.06)] tu-transition-all hover:-tu-translate-y-0.5 hover:tu-border-[#d8e8db] hover:tu-bg-[linear-gradient(180deg,#ffffff_0%,#f3fbf6_100%)] hover:tu-shadow-[0_16px_34px_rgba(16,197,98,0.12)]">
                  <div className="tu-relative tu-rounded-[14px] tu-border tu-border-[#eef1eb] tu-bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] tu-p-4">
                    <a
                      href="/reports"
                      className="tu-absolute tu-right-4 tu-top-4 tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium tu-text-[#10c562] tu-underline tu-decoration-dotted tu-underline-offset-2 tu-opacity-0 transition-opacity group-hover/card:tu-opacity-100"
                    >
                      <span>See reports</span>
                      <ChevronRight className="tu-h-4 tu-w-4" />
                    </a>
                    {dynamicSalesMetricCards.map((metric, index) => {
                      const TrendIcon = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
                      const trendColor = metric.direction === 'up' ? 'tu-text-[#10c562]' : 'tu-text-[#de524c]';
                      const primaryMetric = index === 0;

                      return (
                        <div
                          key={metric.label}
                          className={`${index > 0 ? 'tu-mt-3 tu-border-t tu-border-dashed tu-border-[#e7ebe4] tu-pt-3' : ''}`}
                        >
                          <div className="tu-group/tooltip tu-relative tu-inline-block">
                            <button
                              type="button"
                              className={`${
                                primaryMetric
                                  ? 'tu-text-[12px] tu-font-semibold tu-uppercase tu-tracking-[0.14em] tu-text-[#10c562]'
                                  : 'tu-text-[13px] tu-text-[#8f9197]'
                              }`}
                            >
                              {metric.label}
                            </button>
                            <InfoTooltip
                              text={salesKpiTooltips[metric.label]}
                              widthClass={
                                metric.label.includes('Average') ? 'tu-w-[280px]' : 'tu-w-[190px]'
                              }
                            />
                          </div>

                          <div className={`tu-flex tu-items-end tu-gap-2 ${primaryMetric ? 'tu-mt-2' : 'tu-mt-1.5'}`}>
                            <div className="tu-flex tu-items-end tu-gap-2">
                              <p
                                className={`tu-text-[#333538] ${
                                  primaryMetric
                                    ? 'tu-text-[24px] tu-font-semibold tu-leading-none'
                                    : 'tu-text-[17px] tu-font-medium tu-leading-none'
                                }`}
                              >
                                {metric.value}
                              </p>
                              {metric.extraStores?.length ? (
                                <div className="tu-group tu-relative tu-inline-flex tu-items-center">
                                  <button
                                    type="button"
                                    className="tu-text-[12px] tu-font-medium tu-text-[#10c562] tu-underline tu-decoration-dotted tu-underline-offset-2"
                                  >
                                    and more
                                  </button>
                                  <div className="tu-pointer-events-none tu-absolute tu-bottom-[calc(100%+8px)] tu-left-0 tu-z-30 tu-min-w-[150px] tu-rounded-md tu-bg-[#111111] tu-px-2.5 tu-py-2 tu-text-[11px] tu-leading-4 tu-text-white tu-opacity-0 tu-shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-opacity group-hover:tu-opacity-100">
                                    {metric.extraStores.join(', ')}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            {!metric.hideTrend ? (
                              <div className="tu-relative">
                                <button
                                  type="button"
                                  onMouseEnter={() => setHoveredSalesKpi(metric.label)}
                                  onMouseLeave={() => setHoveredSalesKpi(null)}
                                  className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium ${trendColor}`}
                                >
                                  {metric.trend}
                                  <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                                </button>

                                {hoveredSalesKpi === metric.label ? (
                                  <ComparisonPopover comparison={metric.comparison!} trend={metric.trend} direction={metric.direction} />
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>

                <div
                  className="tu-relative tu-rounded-[12px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-3 tu-shadow-[0_8px_24px_rgba(31,41,55,0.06)]"
                  onMouseLeave={() => setHoveredSalesPoint(null)}
                >
                  <div className="tu-h-[420px]">
                    <Line data={salesChartData} options={salesChartOptions} />
                  </div>

                  {hoveredSalesPoint && salesTooltipData && salesTooltipData.stores.length > 0 ? (
                    <div
                      className="tu-pointer-events-none tu-absolute tu-z-20 tu-w-[420px] tu-rounded-[16px] tu-border tu-border-[#ededed] tu-bg-white tu-p-4 tu-shadow-[0_20px_40px_rgba(31,41,55,0.20)]"
                      style={{
                        left: Math.min(Math.max(hoveredSalesPoint.x - 150, 12), 450),
                        top: Math.max(hoveredSalesPoint.y - 185, 12)
                      }}
                    >
                      <div className="tu-flex tu-justify-end">
                        <h3 className="tu-text-[14px] tu-font-semibold tu-text-[#333538]">{salesTooltipData.date}</h3>
                      </div>
                      <div className="tu-mt-4 tu-grid tu-grid-cols-[1.3fr_0.7fr_1fr] tu-gap-4 tu-text-[10px] tu-font-semibold tu-uppercase tu-tracking-[0.04em] tu-text-[#9a9ca2]">
                        <span />
                        <span className="tu-whitespace-nowrap">Total Orders</span>
                        <span>{salesTooltipData.metric.label}</span>
                      </div>
                      <div className="tu-mt-3 tu-space-y-2.5">
                        {salesTooltipData.stores.map((store) => (
                          <div key={`${salesTooltipData.date}-${store.name}`} className="tu-grid tu-grid-cols-[1.3fr_0.7fr_1fr] tu-gap-4 tu-items-center">
                            <div className="tu-flex tu-items-center tu-gap-2.5">
                              <span className="tu-h-2.5 tu-w-2.5 tu-rounded-full" style={{ backgroundColor: store.color }} />
                              <span className="tu-text-[13px] tu-text-[#4b4e53]">{store.name}</span>
                            </div>
                            <span className="tu-text-[13px] tu-font-medium tu-text-[#333538]">
                              {store.totalOrders.toLocaleString('en-US')}
                            </span>
                            <span className="tu-text-[13px] tu-font-medium tu-text-[#333538]">
                              {salesTooltipData.metric.formatValue(store[salesTooltipData.metric.key])}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="tu-order-2 tu-mt-5 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-5">
              <div className="tu-flex tu-flex-col tu-gap-4 xl:tu-flex-row xl:tu-items-center xl:tu-justify-between">
                <h2 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">Sales Performance by City</h2>

                <div className="tu-flex tu-flex-wrap tu-gap-2.5 sm:tu-gap-3">
                  {[
                    { key: 'metric', value: selectedLocationMetric, options: locationMetricOptions },
                    { key: 'date', value: selectedLocationDate, options: locationDateOptions },
                    {
                      key: 'region',
                      value: formatLocationFilterLabel(selectedLocationRegion),
                      options: []
                    }
                  ].map((menu) => (
                    <div key={menu.key} className="tu-relative">
                      <button
                        type="button"
                        onClick={() => {
                          setLocationMenus((current) => ({
                            metric: false,
                            date: false,
                            region: false,
                            [menu.key]: !current[menu.key as keyof typeof current]
                          }));
                          setLocationMenuSearch((current) => ({ ...current, [menu.key]: '' }));
                          if (menu.key === 'region') setLocationRegionProvince(null);
                        }}
                        className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                      >
                        <span>{menu.value}</span>
                        <ChevronDown className="tu-h-3 tu-w-3" />
                      </button>

                      {menu.key === 'region' ? (
                        <HierarchicalLocationDropdown
                          open={locationMenus.region}
                          selected={selectedLocationRegion}
                          onChange={setSelectedLocationRegion}
                          searchValue={locationMenuSearch.region}
                          onSearchChange={(value) => setLocationMenuSearch((current) => ({ ...current, region: value }))}
                          activeProvince={locationRegionProvince}
                          onProvinceChange={setLocationRegionProvince}
                        />
                      ) : (
                        <SearchableDropdownMenu
                          open={locationMenus[menu.key as keyof typeof locationMenus]}
                          options={menu.options}
                          selected={menu.key === 'metric' ? selectedLocationMetric : selectedLocationDate}
                          searchable={menu.key !== 'date'}
                          searchValue={locationMenuSearch[menu.key as keyof typeof locationMenuSearch]}
                          onSearchChange={
                            menu.key !== 'date'
                              ? (value) => setLocationMenuSearch((current) => ({ ...current, [menu.key]: value }))
                              : undefined
                          }
                          widthClass="tu-w-[190px]"
                          onSelect={(item) => {
                            if (menu.key === 'metric') setSelectedLocationMetric(item);
                            if (menu.key === 'date') setSelectedLocationDate(item);
                            setLocationMenus({ metric: false, date: false, region: false });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tu-mt-6 tu-grid tu-gap-3 lg:tu-grid-cols-4">
                {dynamicLocationKpiCards.map((metric) => {
                  const TrendIcon = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
                  const trendPillClass =
                    metric.direction === 'up'
                      ? 'tu-border-[#cdeedc] tu-bg-[#ecfbf3] tu-text-[#10c562]'
                      : 'tu-border-[#f4d5d4] tu-bg-[#fff1f1] tu-text-[#de524c]';

                  return (
                    <article
                      key={metric.label}
                      className="tu-group/card tu-relative tu-cursor-pointer tu-rounded-[14px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] tu-p-4 tu-shadow-[0_8px_24px_rgba(31,41,55,0.06)] tu-transition-all hover:-tu-translate-y-0.5 hover:tu-border-[#d8e8db] hover:tu-bg-[linear-gradient(180deg,#ffffff_0%,#f3fbf6_100%)] hover:tu-shadow-[0_12px_28px_rgba(16,197,98,0.12)]"
                    >
                      <a
                        href="/reports"
                        className="tu-absolute tu-right-4 tu-top-3.5 tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium tu-text-[#10c562] tu-underline tu-decoration-dotted tu-underline-offset-2 tu-opacity-0 transition-opacity group-hover/card:tu-opacity-100"
                      >
                        <span>See reports</span>
                        <ChevronRight className="tu-h-4 tu-w-4" />
                      </a>
                      <div className="tu-group/tooltip tu-relative tu-inline-block">
                        <button type="button" className="tu-text-[13px] tu-text-[#8f9197]">
                          {metric.label}
                        </button>
                        <InfoTooltip
                          text={locationKpiTooltips[metric.label]}
                          widthClass={metric.label.includes('Average') ? 'tu-w-[280px]' : 'tu-w-[190px]'}
                        />
                      </div>
                      <div className="tu-mt-2.5 tu-flex tu-items-end tu-gap-2.5">
                        <p className="tu-text-[24px] tu-font-semibold tu-leading-none tu-text-[#333538]">{metric.value}</p>
                        <div className="tu-relative">
                          <button
                            type="button"
                            onMouseEnter={() => setHoveredLocationKpi(metric.label)}
                            onMouseLeave={() => setHoveredLocationKpi(null)}
                            className={`tu-inline-flex tu-items-center tu-gap-1 tu-rounded-full tu-border tu-px-2 tu-py-1 tu-text-[12px] tu-font-semibold ${trendPillClass}`}
                          >
                            {metric.trend}
                            <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                          </button>
                          {hoveredLocationKpi === metric.label ? (
                            <ComparisonPopover
                              comparison={metric.comparison}
                              trend={metric.trend}
                              direction={metric.direction}
                            />
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="tu-mt-5 tu-rounded-[14px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_8px_24px_rgba(31,41,55,0.06)]">
                <div className="tu-h-[420px]">
                  <Bar data={locationChartData} options={locationChartOptions} />
                </div>
              </div>
            </section>

            <section className="tu-order-2 tu-mt-5 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-5">
              <div className="tu-flex tu-flex-col tu-gap-4 xl:tu-flex-row xl:tu-items-center xl:tu-justify-between">
                <h2 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">Sales Performance by Products</h2>

                <div className="tu-flex tu-flex-wrap tu-gap-2.5 sm:tu-gap-3">
                  {[
                    { key: 'metric', value: selectedProductMetric, options: productMetricOptions },
                    { key: 'date', value: selectedProductDate, options: productDateOptions },
                    {
                      key: 'region',
                      value: formatLocationFilterLabel(selectedProductRegion),
                      options: []
                    }
                  ].map((menu) => (
                    <div key={menu.key} className="tu-relative">
                      <button
                        type="button"
                        onClick={() => {
                          setProductMenus((current) => ({
                            metric: false,
                            date: false,
                            region: false,
                            [menu.key]: !current[menu.key as keyof typeof current]
                          }));
                          setProductMenuSearch((current) => ({ ...current, [menu.key]: '' }));
                          if (menu.key === 'region') setProductRegionProvince(null);
                        }}
                        className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                      >
                        <span>{menu.value}</span>
                        <ChevronDown className="tu-h-3 tu-w-3" />
                      </button>

                      {menu.key === 'region' ? (
                        <HierarchicalLocationDropdown
                          open={productMenus.region}
                          selected={selectedProductRegion}
                          onChange={setSelectedProductRegion}
                          searchValue={productMenuSearch.region}
                          onSearchChange={(value) => setProductMenuSearch((current) => ({ ...current, region: value }))}
                          activeProvince={productRegionProvince}
                          onProvinceChange={setProductRegionProvince}
                        />
                      ) : (
                        <SearchableDropdownMenu
                          open={productMenus[menu.key as keyof typeof productMenus]}
                          options={menu.options}
                          selected={menu.key === 'metric' ? selectedProductMetric : selectedProductDate}
                          searchable={menu.key !== 'date'}
                          searchValue={productMenuSearch[menu.key as keyof typeof productMenuSearch]}
                          onSearchChange={
                            menu.key !== 'date'
                              ? (value) => setProductMenuSearch((current) => ({ ...current, [menu.key]: value }))
                              : undefined
                          }
                          widthClass="tu-w-[190px]"
                          onSelect={(item) => {
                            if (menu.key === 'metric') setSelectedProductMetric(item);
                            if (menu.key === 'date') setSelectedProductDate(item);
                            setProductMenus({ metric: false, date: false, region: false });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tu-mt-6 tu-grid tu-gap-5 xl:tu-grid-cols-[300px_minmax(0,1fr)]">
                <article className="tu-group/card tu-cursor-pointer tu-rounded-[16px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] tu-p-4 tu-shadow-[0_12px_30px_rgba(31,41,55,0.06)] tu-transition-all hover:-tu-translate-y-0.5 hover:tu-border-[#d8e8db] hover:tu-bg-[linear-gradient(180deg,#ffffff_0%,#f3fbf6_100%)] hover:tu-shadow-[0_16px_34px_rgba(16,197,98,0.12)]">
                  <div className="tu-relative tu-rounded-[14px] tu-border tu-border-[#eef1eb] tu-bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] tu-p-4">
                    <a
                      href="/reports"
                      className="tu-absolute tu-right-4 tu-top-4 tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium tu-text-[#10c562] tu-underline tu-decoration-dotted tu-underline-offset-2 tu-opacity-0 transition-opacity group-hover/card:tu-opacity-100"
                    >
                      <span>See reports</span>
                      <ChevronRight className="tu-h-4 tu-w-4" />
                    </a>
                    {dynamicProductMetricCards.map((metric, index) => {
                      const hasTrend = 'trend' in metric;
                      const trendDirection = hasTrend && metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
                      const trendColor = hasTrend && metric.direction === 'up' ? 'tu-text-[#10c562]' : 'tu-text-[#de524c]';
                      const TrendIcon = trendDirection;
                      const primaryMetric = index === 0;

                      return (
                        <div
                          key={metric.label}
                          className={`${index > 0 ? 'tu-mt-3 tu-border-t tu-border-dashed tu-border-[#e7ebe4] tu-pt-3' : ''}`}
                        >
                          <div className="tu-group/tooltip tu-relative tu-inline-block">
                            <button
                              type="button"
                              className={`${
                                primaryMetric
                                  ? 'tu-text-[12px] tu-font-semibold tu-uppercase tu-tracking-[0.14em] tu-text-[#10c562]'
                                  : 'tu-text-[13px] tu-text-[#8f9197]'
                              }`}
                            >
                              {metric.label}
                            </button>
                            <InfoTooltip
                              text={productKpiTooltips[metric.label]}
                              widthClass={metric.label.includes('Avg.') ? 'tu-w-[300px]' : 'tu-w-[190px]'}
                            />
                          </div>

                          <div className={`tu-flex tu-items-end tu-gap-2 ${primaryMetric ? 'tu-mt-2' : 'tu-mt-1.5'}`}>
                            <div className="tu-flex tu-items-end tu-gap-2">
                              <p
                                className={`tu-text-[#333538] ${
                                  primaryMetric ? 'tu-text-[24px] tu-font-semibold tu-leading-none' : 'tu-text-[17px] tu-font-medium tu-leading-none'
                                }`}
                              >
                                {metric.value}
                              </p>
                              {'extraItems' in metric && metric.extraItems?.length ? (
                                <div className="tu-group tu-relative tu-inline-flex tu-items-center">
                                  <button
                                    type="button"
                                    className="tu-text-[12px] tu-font-medium tu-text-[#10c562] tu-underline tu-decoration-dotted tu-underline-offset-2"
                                  >
                                    and more
                                  </button>
                                  <InfoTooltip text={metric.extraItems.join(', ')} widthClass="tu-min-w-[150px]" />
                                </div>
                              ) : null}
                            </div>
                            {hasTrend ? (
                              <div className="tu-relative">
                                <button
                                  type="button"
                                  onMouseEnter={() => setHoveredProductKpi(metric.label)}
                                  onMouseLeave={() => setHoveredProductKpi(null)}
                                  className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium ${trendColor}`}
                                >
                                  {metric.trend}
                                  <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                                </button>

                                {hoveredProductKpi === metric.label ? (
                                  <ComparisonPopover comparison={metric.comparison!} trend={metric.trend!} direction={metric.direction!} />
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>

                <div className="tu-rounded-[14px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_8px_24px_rgba(31,41,55,0.06)]">
                  <div className="tu-h-[420px]">
                    <Bar data={productChartData} options={productChartOptions} />
                  </div>
                </div>
              </div>
            </section>

            <section className="tu-order-1 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-3.5 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-4">
              <div className="tu-flex tu-flex-col tu-gap-3 tu-pb-2 lg:tu-flex-row lg:tu-items-center lg:tu-justify-between">
                <h2 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">
                  Key Performing Metrics Overview
                </h2>

                <div className="tu-flex tu-flex-col tu-gap-2 sm:tu-flex-row">
                  <div className="tu-relative">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenGlanceDateMenu((current) => !current);
                        setOpenStoreMenu(false);
                        setGlanceMenuSearch((current) => ({ ...current, date: '' }));
                      }}
                      className="tu-inline-flex tu-h-10 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-4 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                    >
                      <span>{selectedGlanceDate}</span>
                      <ChevronDown className="tu-h-3 tu-w-3" />
                    </button>

                    <SearchableDropdownMenu
                      open={openGlanceDateMenu}
                      options={glanceDateOptions}
                      selected={selectedGlanceDate}
                      searchable={false}
                      widthClass="tu-w-[190px]"
                      showChevronForCustom
                      onSelect={(item) => {
                        setSelectedGlanceDate(item);
                        setOpenGlanceDateMenu(false);
                        setGlanceMenuSearch((current) => ({ ...current, date: '' }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="tu-mt-4 tu-space-y-4">
                {sectionSixMetricSections
                  .filter((metricSection) => metricSection.title !== 'Orders')
                  .map((metricSection) => (
                  <article
                    key={metricSection.title}
                    className="tu-rounded-[14px] tu-border tu-border-[#eceee8] tu-bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] tu-p-3.5 sm:tu-p-4"
                  >
                    <div className="tu-flex tu-items-center tu-justify-between">
                      <h3 className="tu-text-[15px] tu-font-semibold tu-text-[#2a2c2f]">{metricSection.title}</h3>
                    </div>

                    <div className="tu-mt-3 tu-grid tu-gap-3 lg:tu-grid-cols-4">
                      {metricSection.metrics.map((metric) => {
                        const TrendIcon = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
                        const trendPillClass =
                          metric.direction === 'up'
                            ? 'tu-border-[#cdeedc] tu-bg-[#ecfbf3] tu-text-[#10c562]'
                            : 'tu-border-[#f4d5d4] tu-bg-[#fff1f1] tu-text-[#de524c]';
                        const hoverKey = `${metricSection.title}-${metric.label}`;
                        const sectionSixMetricKeyMap: Record<string, MetricKey> = {
                          'Net Sales': 'netSales',
                          COGS: 'cogs',
                          Expenses: 'expenses',
                          'Net Profit': 'netProfit'
                        };
                        const mappedMetricKey = sectionSixMetricKeyMap[metric.label];
                        const breakdownRows =
                          metricSection.title === 'Sales' &&
                          mappedMetricKey &&
                          metric.label !== 'Expenses'
                            ? getMetricPopoverContent(selectedGlancePeriodKey, mappedMetricKey)
                            : [];
                        const showBreakdownPopover =
                          breakdownRows.length > 0 && hoveredSectionSixValue === hoverKey;

                        return (
                          <article
                            key={hoverKey}
                            className="tu-group tu-rounded-[12px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-3 tu-shadow-[0_8px_24px_rgba(31,41,55,0.08)] tu-transition-all hover:-tu-translate-y-0.5 hover:tu-border-[#d8e8db] hover:tu-bg-[#f8fcf9] hover:tu-shadow-[0_12px_28px_rgba(16,197,98,0.12)]"
                          >
                            <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
                              <div className="tu-min-w-0">
                                <div className="tu-group/tooltip tu-relative tu-inline-block">
                                  <button type="button" className="tu-text-[13px] tu-text-[#9a9ca2]">
                                    {metric.label}
                                  </button>
                                  <InfoTooltip text={sectionSixKpiTooltips[metric.label]} widthClass="tu-w-[280px]" />
                                </div>
                                <div className="tu-mt-1">
                                  {metricSection.title === 'Sales' ? (
                                    <div className="tu-relative">
                                      <button
                                        type="button"
                                        onMouseEnter={() => setHoveredSectionSixValue(hoverKey)}
                                        onMouseLeave={() => setHoveredSectionSixValue(null)}
                                        className={`tu-inline-flex tu-w-fit tu-items-center tu-whitespace-nowrap tu-text-left tu-text-[26px] tu-font-semibold tu-text-[#10c562] tu-transition-all hover:tu-scale-[1.01] hover:tu-text-[#0ea857] hover:tu-drop-shadow-[0_2px_10px_rgba(16,197,98,0.2)] ${
                                          metric.label === 'Expenses'
                                            ? ''
                                            : 'tu-decoration-dotted tu-underline tu-underline-offset-4'
                                        }`}
                                        style={
                                          metric.label === 'Expenses'
                                            ? undefined
                                            : { textDecorationThickness: '1px', textDecorationColor: '#10c562' }
                                        }
                                      >
                                        {metric.value}
                                      </button>
                                      {showBreakdownPopover ? (
                                        <div className="tu-absolute tu-bottom-[calc(100%+10px)] tu-left-0 tu-z-20 tu-w-[264px] tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-p-2.5 tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                                          <div className="tu-space-y-1.5">
                                            {breakdownRows.map((item) => (
                                              <div
                                                key={`${hoverKey}-${item.label}`}
                                                className={`tu-flex tu-items-end tu-justify-between tu-gap-3 ${
                                                  item.dividerBefore ? 'tu-border-t tu-border-[#eceee8] tu-pt-1.5' : ''
                                                }`}
                                              >
                                                <span
                                                  className={`tu-text-[12px] ${
                                                    item.medium ? 'tu-font-semibold tu-text-[#333538]' : 'tu-text-[#44464b]'
                                                  }`}
                                                >
                                                  {item.label}
                                                </span>
                                                <span
                                                  className={`tu-text-[12px] ${
                                                    item.medium ? 'tu-font-semibold tu-text-[#333538]' : 'tu-text-[#44464b]'
                                                  }`}
                                                >
                                                  {item.prefix ? `${item.prefix} ` : ''}
                                                  {item.value}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : (
                                    <p className="tu-text-[26px] tu-font-semibold tu-text-[#333538]">{metric.value}</p>
                                  )}
                                  {metric.secondaryText ? (
                                    <div className="tu-group/tooltip tu-relative tu-mt-1.5 tu-inline-block">
                                      <p className="tu-text-[11px] tu-font-medium tu-text-[#8f9197]">{metric.secondaryText}</p>
                                      <InfoTooltip text={metric.secondaryTooltip ?? ''} widthClass="tu-w-[320px]" />
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                              {metric.label === 'COGS' ? (
                                <div className="tu-group/tooltip tu-relative tu-inline-flex tu-shrink-0">
                                  <button
                                    type="button"
                                    aria-label="COGS tooltip"
                                    className="tu-inline-flex tu-h-[18px] tu-w-[18px] tu-shrink-0 tu-items-center tu-justify-center tu-rounded-full tu-border tu-border-[#939393] tu-bg-[#939393] tu-text-[10px] tu-font-medium tu-leading-none tu-text-white"
                                  >
                                    <span className="tu-leading-none">?</span>
                                  </button>
                                  <InfoTooltip
                                    text="COGS is calculated only for shipped orders where inventory is detected."
                                    widthClass="tu-w-[280px]"
                                  />
                                </div>
                              ) : metric.showStoreSelect ? (
                                <div className="tu-relative">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenSectionSixCustomerStoreMenu((current) => !current);
                                      setOpenGlanceDateMenu(false);
                                      setSectionSixCustomerStoreSearch('');
                                    }}
                                    className="tu-inline-flex tu-items-center tu-gap-1 tu-rounded-[8px] tu-px-1.5 tu-py-1 tu-text-[11px] tu-font-medium tu-text-[#5f656c] transition-colors hover:tu-bg-[#f3f5f1] hover:tu-text-[#2a2c2f]"
                                  >
                                    <span>
                                      {formatMultiSelectLabel(
                                        selectedSectionSixCustomerStores,
                                        'Select Store',
                                        'store',
                                        'stores'
                                      )}
                                    </span>
                                    <ChevronDown className="tu-h-3 tu-w-3" />
                                  </button>
                                  <SearchableDropdownMenu
                                    open={openSectionSixCustomerStoreMenu}
                                    options={storeOptions}
                                    selected={selectedSectionSixCustomerStores}
                                    multiSelect
                                    searchable
                                    searchValue={sectionSixCustomerStoreSearch}
                                    onSearchChange={setSectionSixCustomerStoreSearch}
                                    widthClass="tu-w-[220px]"
                                    onSelect={(item) => {
                                      setSelectedSectionSixCustomerStores((current) =>
                                        toggleMultiSelectValue(current, item)
                                      );
                                    }}
                                  />
                                </div>
                              ) : (
                                <a
                                  href="/reports"
                                  className="tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium tu-text-[#10c562] tu-underline tu-decoration-dotted tu-underline-offset-2 tu-opacity-0 tu-transition-opacity group-hover:tu-opacity-100"
                                >
                                  <span>See reports</span>
                                  <ChevronRight className="tu-h-4 tu-w-4" />
                                </a>
                              )}
                            </div>
                            <div className="tu-mt-3 tu-flex tu-items-center tu-gap-2">
                              <div className="tu-relative">
                                <button
                                  type="button"
                                  onMouseEnter={() => setHoveredGlanceKpi(hoverKey)}
                                  onMouseLeave={() => setHoveredGlanceKpi(null)}
                                  className={`tu-inline-flex tu-items-center tu-gap-1 tu-rounded-full tu-border tu-px-2 tu-py-1 tu-text-[12px] tu-font-semibold ${trendPillClass}`}
                                >
                                  {metric.trend}
                                  <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                                </button>
                                {hoveredGlanceKpi === hoverKey ? (
                                  <ComparisonPopover
                                    comparison={metric.comparison}
                                    trend={metric.trend}
                                    direction={metric.direction}
                                  />
                                ) : null}
                              </div>
                              <span className="tu-text-[12px] tu-text-[#9a9ca2]">{metric.sublabel}</span>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                    {metricSection.title === 'Sales' && salesOrderRibbonMetrics.length > 0 ? (
                      <div className="tu-mt-3 tu-grid tu-gap-3 lg:tu-grid-cols-4">
                        {salesOrderRibbonMetrics.map((metric) => (
                          <div
                            key={`sales-order-ribbon-${metric.label}`}
                            className="tu-group tu-rounded-[12px] tu-border tu-border-[#eceee8] tu-bg-white tu-px-3 tu-py-2"
                          >
                            <div className="tu-flex tu-items-start tu-justify-between tu-gap-2">
                              <p className="tu-font-sans tu-text-[13px] tu-font-medium tu-text-[#9a9ca2]">{metric.label}</p>
                              <a
                                href="/reports"
                                className="tu-inline-flex tu-items-center tu-gap-1 tu-text-[11px] tu-font-medium tu-text-[#10c562] tu-underline tu-decoration-dotted tu-underline-offset-2 tu-opacity-0 tu-transition-opacity group-hover:tu-opacity-100"
                              >
                                <span>See reports</span>
                                <ChevronRight className="tu-h-3.5 tu-w-3.5" />
                              </a>
                            </div>
                            <p className="tu-mt-1 tu-font-sans tu-text-[20px] tu-font-medium tu-leading-none tu-text-[#333538]">
                              {metric.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
                </>
              ) : null}
          </div>
          </section>
        </main>
      </div>
    </div>
  );
}

