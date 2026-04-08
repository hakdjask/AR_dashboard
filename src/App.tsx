import { useMemo, useState } from 'react';
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
  ArrowUpRight,
  Bell,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Menu,
  Package2,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShoppingBag,
  Truck
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

type PeriodKey = 'today' | 'yesterday' | 'last7' | 'last30';
type TabKey = 'courier' | 'sales';
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
  { key: 'sales', label: 'Sales' }
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
    { label: 'Revenue', value: values.netSales, dividerBefore: true },
    { label: 'COGS', value: values.cogs, prefix: '-' },
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

const salesKpiTooltips: Record<string, string | TooltipContent> = {
  'Total Orders': 'Total orders booked across the selected stores and period.',
  'Total Revenue': 'Gross revenue generated across all selected stores in the active period.',
  'Highest Store Revenue': 'Store with the strongest revenue contribution in the selected period.',
  'Average Revenue per Store': {
    title: 'Average Revenue per Store',
    blocks: [
      { type: 'text', text: 'Average revenue contribution across active stores in the selected view.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Average Revenue per Store = Total Revenue / Active Stores' }
    ]
  },
  'Peak Revenue Day': 'Day with the highest gross revenue in the selected date range.',
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
const salesMetricOptions = ['Gross Revenue', 'Order Returns', 'Units Sold'];
const salesDateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 365 Days', 'Custom'];
const locationMetricOptions = ['Orders Volume', 'Gross Revenue'];
const locationDateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];
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
  'Average Revenue per City': {
    title: 'Average Revenue per City',
    blocks: [
      { type: 'text', text: 'Average revenue contributed by each active city in the selected period.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Average Revenue per City = Total Revenue / Active Cities' }
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
  'Gross Revenue': {
    currentKey: 'revenueCurrent',
    previousKey: 'revenuePrevious',
    axisMax: 4500000,
    stepSize: 1000000,
    tickFormatter: (value) => `PKR ${(value / 1000000).toFixed(1)}M`,
    tooltipFormatter: (value) => `PKR ${value.toLocaleString('en-US')}`
  }
};

const productMetricOptions = ['Units Sold', 'Revenue Generated'];
const productDateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

const productKpiTooltips: Record<string, string | TooltipContent> = {
  'Total Units Sold': 'Total units sold across the selected products and period.',
  'Total Revenue Generated': 'Total revenue generated across the selected products and period.',
  'Best Selling Product': 'Product with the highest units sold in the selected period.',
  'Top Revenue Product': 'Product generating the highest revenue in the selected period.',
  'Most Improved Product': 'Product with the strongest positive change in units sold.',
  'Most Improved Revenue Product': 'Product with the strongest positive revenue change in the selected period.',
  'Most Declined Product': 'Product with the sharpest decline in units sold.',
  'Most Declined Revenue Product': 'Product with the sharpest revenue decline in the selected period.',
  'Avg. Units Sold Per Order': {
    title: 'Avg. Units Sold Per Order',
    blocks: [
      { type: 'text', text: 'Average units sold per order across the selected products.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Avg. Units Sold per Order = Total Units Sold / Total Orders' }
    ]
  },
  'Avg. Revenue Generated Per Order': {
    title: 'Avg. Revenue Generated Per Order',
    blocks: [
      { type: 'text', text: 'Average revenue generated per order across the selected products.' },
      { type: 'spacer' },
      { type: 'formula', text: 'Avg. Revenue per Order = Total Revenue Generated / Total Orders' }
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
  'Revenue Generated': {
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
  'Gross Revenue': {
    key: 'grossRevenue',
    label: 'Gross Revenue',
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

function InfoTooltip({
  text,
  widthClass = 'tu-w-[190px]'
}: {
  text: string | TooltipContent;
  widthClass?: string;
}) {
  return (
    <div
      className={`tu-pointer-events-none tu-absolute tu-bottom-[calc(100%+8px)] tu-left-0 tu-z-30 ${widthClass} tu-rounded-md tu-bg-[#111111] tu-px-2.5 tu-py-2 tu-text-[11px] tu-leading-4 tu-text-white tu-opacity-0 tu-shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-opacity group-hover:tu-opacity-100`}
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
  const [selectedGlanceDate, setSelectedGlanceDate] = useState('This Week');
  const [selectedStore, setSelectedStore] = useState<string[]>([]);
  const [glanceMenuSearch, setGlanceMenuSearch] = useState({ date: '', store: '' });
  const [salesMenus, setSalesMenus] = useState<{ store: boolean; metric: boolean; date: boolean; region: boolean }>({
    store: false,
    metric: false,
    date: false,
    region: false
  });
  const [selectedSalesStore, setSelectedSalesStore] = useState<string[]>(salesStoreOptions);
  const [selectedSalesMetric, setSelectedSalesMetric] = useState('Gross Revenue');
  const [selectedSalesDate, setSelectedSalesDate] = useState('Last 30 Days');
  const [selectedSalesRegion, setSelectedSalesRegion] = useState<string[]>([...pakistanProvinceOptions]);
  const [salesMenuSearch, setSalesMenuSearch] = useState({ store: '', metric: '', date: '', region: '' });
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
  const [hoveredSalesKpi, setHoveredSalesKpi] = useState<string | null>(null);
  const [hoveredLocationKpi, setHoveredLocationKpi] = useState<string | null>(null);
  const [hoveredProductKpi, setHoveredProductKpi] = useState<string | null>(null);
  const [cardDates, setCardDates] = useState<
    Record<PeriodKey, { title: string; dateLabel: string; from: string; to: string }>
  >({
    today: { title: 'Today', dateLabel: 'May 12, 2024', from: '2024-05-12', to: '2024-05-12' },
    yesterday: { title: 'Yesterday', dateLabel: 'May 11, 2024', from: '2024-05-11', to: '2024-05-11' },
    last7: { title: 'Last 7 Days', dateLabel: 'May 05, 2024 - May 12, 2024', from: '2024-05-05', to: '2024-05-12' },
    last30: { title: 'Last 30 Days', dateLabel: 'Apr 13, 2024 - May 12, 2024', from: '2024-04-13', to: '2024-05-12' }
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
  const dynamicSalesMetricCards = useMemo(() => {
    if (selectedSalesMetric === 'Units Sold') {
      return [
        {
          label: 'Total Orders',
          value: '35,140',
          trend: '10.0%',
          direction: 'up' as const,
          comparison: { current: '35,140', previous: '31,945', change: '3,195' }
        },
        {
          label: 'Total Units Sold',
          value: '91,800',
          trend: '11.6%',
          direction: 'up' as const,
          comparison: { current: '91,800', previous: '82,280', change: '9,520' }
        },
        {
          label: 'Top Store by Units Sold',
          value: 'Shopify-03',
          trend: '8.1%',
          direction: 'up' as const,
          comparison: { current: 'Shopify-03', previous: 'WOO-01', change: '8.1%' },
          extraStores: ['WOO-01', 'Shopify-02']
        },
        {
          label: 'Average Units Sold per Store',
          value: '18,360',
          trend: '6.9%',
          direction: 'up' as const,
          comparison: { current: '18,360', previous: '17,176', change: '1,184' }
        },
        {
          label: 'Peak Units Sold Day',
          value: '21st April 2025',
          trend: '9.4%',
          direction: 'up' as const,
          comparison: { current: '21st April 2025', previous: '18th April 2025', change: '9.4%' },
          hideTrend: true
        }
      ];
    }

    if (selectedSalesMetric === 'Order Returns') {
      return [
        {
          label: 'Total Orders',
          value: '35,140',
          trend: '10.0%',
          direction: 'up' as const,
          comparison: { current: '35,140', previous: '31,945', change: '3,195' }
        },
        {
          label: 'Total Order Returns',
          value: '8,420',
          trend: '7.8%',
          direction: 'down' as const,
          comparison: { current: '8,420', previous: '9,130', change: '710' }
        },
        {
          label: 'Highest Store Returns',
          value: 'Shopify-02',
          trend: '5.2%',
          direction: 'down' as const,
          comparison: { current: 'Shopify-02', previous: 'Shopify-03', change: '5.2%' },
          extraStores: ['Shopify-03', 'WOO-01']
        },
        {
          label: 'Average Returns per Store',
          value: '1,684',
          trend: '4.1%',
          direction: 'down' as const,
          comparison: { current: '1,684', previous: '1,826', change: '142' }
        },
        {
          label: 'Peak Returns Day',
          value: '11th April 2025',
          trend: '6.2%',
          direction: 'down' as const,
          comparison: { current: '11th April 2025', previous: '14th April 2025', change: '6.2%' },
          hideTrend: true
        }
      ];
    }

    return [
      {
        label: 'Total Orders',
        value: '35,140',
        trend: '10.0%',
        direction: 'up' as const,
        comparison: { current: '35,140', previous: '31,945', change: '3,195' }
      },
      {
        label: 'Total Revenue',
        value: 'PKR 20,00,000',
        trend: '10.0%',
        direction: 'down' as const,
        comparison: { current: 'PKR 20,00,000', previous: 'PKR 22,20,000', change: 'PKR 2,20,000' }
      },
      {
        label: 'Highest Store Revenue',
        value: 'Shopify-01',
        trend: '7.4%',
        direction: 'up' as const,
        comparison: { current: 'Shopify-01', previous: 'Daraz-02', change: '7.4%' },
        extraStores: ['Daraz-02', 'WOO-01']
      },
      {
        label: 'Average Revenue per Store',
        value: 'PKR 3,00,000',
        trend: '10.0%',
        direction: 'down' as const,
        comparison: { current: 'PKR 3,00,000', previous: 'PKR 3,33,000', change: 'PKR 33,000' }
      },
      {
        label: 'Peak Revenue Day',
        value: '13th April 2025',
        trend: '12.8%',
        direction: 'up' as const,
        comparison: { current: '13th April 2025', previous: '9th April 2025', change: '12.8%' },
        hideTrend: true
      }
    ];
  }, [selectedSalesMetric]);

  const salesStoreSummaryLabel =
    selectedSalesStore.length === salesStoreOptions.length
      ? 'All Stores'
      : formatMultiSelectLabel(selectedSalesStore, 'Select Stores', 'store', 'stores');

  const salesChartData = useMemo(
    () => ({
      labels: salesChartLabels,
      datasets: activeSalesStoreSeries.map((series) => ({
        label: series.name,
        data: series[selectedStoreMetricConfig.key],
        borderColor: series.color,
        backgroundColor: series.color,
        pointBackgroundColor: series.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2.5,
        tension: 0.38
      }))
    }),
    [activeSalesStoreSeries, selectedStoreMetricConfig]
  );

  const salesChartOptions = useMemo(
    () => ({
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
            }
          },
          border: {
            display: false
          }
        },
        y: {
          min: 0,
          max: selectedStoreMetricConfig.axisMax,
          ticks: {
            stepSize: selectedStoreMetricConfig.stepSize,
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
    }),
    [selectedStoreMetricConfig]
  );

  const salesTooltipData = hoveredSalesPoint
    ? {
        ...dayBreakdown[hoveredSalesPoint.dataIndex % dayBreakdown.length],
        stores: dayBreakdown[hoveredSalesPoint.dataIndex % dayBreakdown.length].stores.filter((store) =>
          selectedSalesStore.includes(store.name)
        ),
        metric: selectedStoreMetricConfig
      }
    : null;

  const selectedLocationMetricConfig = locationMetricConfig[selectedLocationMetric];
  const dynamicLocationKpiCards = useMemo(() => {
    if (selectedLocationMetric === 'Gross Revenue') {
      return locationKpiCards.map((metric, index) =>
        index === 3
          ? {
              ...metric,
              label: 'Average Revenue per City',
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
    if (selectedProductMetric === 'Revenue Generated') {
      return [
        {
          label: 'Total Revenue Generated',
          value: 'PKR 11,500,000',
          trend: '12.4%',
          direction: 'up' as const,
          comparison: { current: 'PKR 11,500,000', previous: 'PKR 10,230,000', change: 'PKR 1,270,000' }
        },
        {
          label: 'Top Revenue Product',
          value: 'Earbuds X',
          extraItems: ['Travel Pack', 'Smart Watch']
        },
        {
          label: 'Most Improved Revenue Product',
          value: 'Travel Pack',
          extraItems: ['Steel Bottle', 'Fleece Hoodie']
        },
        {
          label: 'Most Declined Revenue Product',
          value: 'Smart Watch',
          extraItems: ['Earbuds X', 'Canvas Tote']
        },
        {
          label: 'Avg. Revenue Generated Per Order',
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

            <div>
              <section className="tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-3.5 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-4">
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

            <section className="tu-mt-5 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-3.5 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-4">
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

            <section className="tu-mt-5 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-5">
              <div className="tu-flex tu-flex-col tu-gap-4 xl:tu-flex-row xl:tu-items-center xl:tu-justify-between">
                <h2 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">Sales Performance by Store</h2>

                <div className="tu-flex tu-flex-wrap tu-gap-2.5 sm:tu-gap-3">
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
                            setSalesMenus({ store: false, metric: false, date: false, region: false });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tu-mt-6 tu-grid tu-gap-5 xl:tu-grid-cols-[300px_minmax(0,1fr)]">
                <article className="tu-rounded-[16px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] tu-p-4 tu-shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
                  <div className="tu-rounded-[14px] tu-border tu-border-[#eef1eb] tu-bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] tu-p-4">
                    {dynamicSalesMetricCards.map((metric, index) => {
                      const TrendIcon = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
                      const trendColor = metric.direction === 'up' ? 'tu-text-[#10c562]' : 'tu-text-[#de524c]';
                      const primaryMetric = index === 0;

                      return (
                        <div
                          key={metric.label}
                          className={`${index > 0 ? 'tu-mt-3 tu-border-t tu-border-dashed tu-border-[#e7ebe4] tu-pt-3' : ''}`}
                        >
                          <div className="tu-group tu-relative tu-inline-block">
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
                              {metric.label === 'Highest Store Revenue' && metric.extraStores?.length ? (
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

            <section className="tu-mt-5 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-5">
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
                  const trendColor = metric.direction === 'up' ? 'tu-text-[#10c562]' : 'tu-text-[#de524c]';

                  return (
                    <article
                      key={metric.label}
                      className="tu-rounded-[14px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] tu-p-4 tu-shadow-[0_8px_24px_rgba(31,41,55,0.06)]"
                    >
                      <div className="tu-group tu-relative tu-inline-block">
                        <button type="button" className="tu-text-[13px] tu-text-[#8f9197]">
                          {metric.label}
                        </button>
                        <InfoTooltip
                          text={locationKpiTooltips[metric.label]}
                          widthClass={metric.label.includes('Average') ? 'tu-w-[280px]' : 'tu-w-[190px]'}
                        />
                      </div>
                      <div className="tu-mt-2 tu-flex tu-items-end tu-gap-2">
                        <p className="tu-text-[21px] tu-font-semibold tu-leading-none tu-text-[#333538]">{metric.value}</p>
                        <div className="tu-relative">
                          <button
                            type="button"
                            onMouseEnter={() => setHoveredLocationKpi(metric.label)}
                            onMouseLeave={() => setHoveredLocationKpi(null)}
                            className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium ${trendColor}`}
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

            <section className="tu-mt-5 tu-rounded-[16px] tu-border tu-border-[#eceee8] tu-bg-white tu-p-4 tu-shadow-[0_10px_30px_rgba(31,41,55,0.08)] sm:tu-p-5">
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
                <article className="tu-rounded-[16px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] tu-p-4 tu-shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
                  <div className="tu-rounded-[14px] tu-border tu-border-[#eef1eb] tu-bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] tu-p-4">
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
                          <div className="tu-group tu-relative tu-inline-block">
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
          </div>
          </section>
        </main>
      </div>
    </div>
  );
}
