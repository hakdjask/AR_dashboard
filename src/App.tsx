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

const periods: PeriodCard[] = [
  {
    key: 'today',
    title: 'Today',
    dateLabel: 'May 12, 2024',
    metrics: [
      { key: 'netSales', label: 'Net Sales', value: 'PKR 223,456', delta: '100%' },
      { key: 'cogs', label: 'COGS', value: 'PKR 50,000', delta: '100%' },
      { key: 'expenses', label: 'Expenses', value: 'PKR 23,456', delta: '100%' },
      { key: 'netProfit', label: 'Net Profit', value: 'PKR 123,456', delta: '100%' }
    ],
    footer: [
      { label: 'Orders', value: '200' },
      { label: 'Units Sold', value: '200' },
      { label: 'Refunds', value: '200' }
    ]
  },
  {
    key: 'yesterday',
    title: 'Yesterday',
    dateLabel: 'May 11, 2024',
    metrics: [
      { key: 'netSales', label: 'Net Sales', value: 'PKR 223,456', delta: '100%' },
      { key: 'cogs', label: 'COGS', value: 'PKR 50,000', delta: '100%' },
      { key: 'expenses', label: 'Expenses', value: 'PKR 23,456', delta: '100%' },
      { key: 'netProfit', label: 'Net Profit', value: 'PKR 123,456', delta: '100%' }
    ],
    footer: [
      { label: 'Orders', value: '200' },
      { label: 'Units Sold', value: '200' },
      { label: 'Refunds', value: '200' }
    ]
  },
  {
    key: 'last7',
    title: 'Last 7 Days',
    dateLabel: 'May 05, 2024 - May 12, 2024',
    metrics: [
      { key: 'netSales', label: 'Net Sales', value: 'PKR 223,456', delta: '100%' },
      { key: 'cogs', label: 'COGS', value: 'PKR 50,000', delta: '100%' },
      { key: 'expenses', label: 'Expenses', value: 'PKR 23,456', delta: '100%' },
      { key: 'netProfit', label: 'Net Profit', value: 'PKR 123,456', delta: '100%' }
    ],
    footer: [
      { label: 'Orders', value: '200' },
      { label: 'Units Sold', value: '200' },
      { label: 'Refunds', value: '200' }
    ]
  },
  {
    key: 'last30',
    title: 'Last 30 Days',
    dateLabel: 'May 12, 2024',
    metrics: [
      { key: 'netSales', label: 'Net Sales', value: 'PKR 223,456', delta: '100%' },
      { key: 'cogs', label: 'COGS', value: 'PKR 50,000', delta: '100%' },
      { key: 'expenses', label: 'Expenses', value: 'PKR 23,456', delta: '100%' },
      { key: 'netProfit', label: 'Net Profit', value: 'PKR 123,456', delta: '100%' }
    ],
    footer: [
      { label: 'Orders', value: '200' },
      { label: 'Units Sold', value: '200' },
      { label: 'Refunds', value: '200' }
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

const metricPopoverContent: Record<
  MetricKey,
  { label: string; value: string; strong?: boolean; dividerBefore?: boolean }[]
> = {
  netSales: [
    { label: 'Gross Sales', value: 'PKR 123,456' },
    { label: 'Total Taxes', value: 'PKR 223,456' },
    { label: 'Discounts', value: 'PKR 223,456' },
    { label: 'Returns', value: 'PKR 223,456' },
    { label: 'Net Sales', value: 'PKR 100,000', strong: true, dividerBefore: true },
    { label: 'COGS', value: 'PKR 223,456', dividerBefore: true },
    { label: 'Gross Profit', value: 'PKR 100,000', strong: true },
    { label: 'Gross Profit Margin', value: '50%', strong: true },
    { label: 'Expenses', value: 'PKR 223,456', dividerBefore: true },
    { label: 'Net Profit', value: 'PKR 100,000', strong: true }
  ],
  cogs: [
    { label: 'Gross Sales', value: 'PKR 123,456' },
    { label: 'Total Taxes', value: 'PKR 223,456' },
    { label: 'Discounts', value: 'PKR 223,456' },
    { label: 'Returns', value: 'PKR 223,456' },
    { label: 'Net Sales', value: 'PKR 100,000', strong: true, dividerBefore: true },
    { label: 'COGS', value: 'PKR 223,456', dividerBefore: true },
    { label: 'Gross Profit', value: 'PKR 100,000', strong: true },
    { label: 'Gross Profit Margin', value: '50%', strong: true },
    { label: 'Expenses', value: 'PKR 223,456', dividerBefore: true },
    { label: 'Net Profit', value: 'PKR 100,000', strong: true }
  ],
  expenses: [
    { label: 'Gross Sales', value: 'PKR 123,456' },
    { label: 'Total Taxes', value: 'PKR 223,456' },
    { label: 'Discounts', value: 'PKR 223,456' },
    { label: 'Returns', value: 'PKR 223,456' },
    { label: 'Net Sales', value: 'PKR 100,000', strong: true, dividerBefore: true },
    { label: 'COGS', value: 'PKR 223,456', dividerBefore: true },
    { label: 'Gross Profit', value: 'PKR 100,000', strong: true },
    { label: 'Gross Profit Margin', value: '50%', strong: true },
    { label: 'Expenses', value: 'PKR 223,456', dividerBefore: true },
    { label: 'Net Profit', value: 'PKR 100,000', strong: true }
  ],
  netProfit: [
    { label: 'Gross Sales', value: 'PKR 123,456' },
    { label: 'Total Taxes', value: 'PKR 223,456' },
    { label: 'Discounts', value: 'PKR 223,456' },
    { label: 'Returns', value: 'PKR 223,456' },
    { label: 'Net Sales', value: 'PKR 100,000', strong: true, dividerBefore: true },
    { label: 'COGS', value: 'PKR 223,456', dividerBefore: true },
    { label: 'Gross Profit', value: 'PKR 100,000', strong: true },
    { label: 'Gross Profit Margin', value: '50%', strong: true },
    { label: 'Expenses', value: 'PKR 223,456', dividerBefore: true },
    { label: 'Net Profit', value: 'PKR 100,000', strong: true }
  ]
};

const metricTooltips: Record<MetricKey, string> = {
  netSales: 'Revenue after discounts, returns, and taxes for the selected period.',
  cogs: 'Direct costs tied to products sold during the selected period.',
  expenses: 'Operating expenses allocated to the selected date range.',
  netProfit: 'Profit remaining after direct costs and operating expenses.'
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

const glanceMetrics = [
  {
    label: 'New Customers',
    value: '156',
    sublabel: 'Since Yesterday',
    trend: '7.2%',
    direction: 'up' as const,
    showStoreSelect: false
  },
  {
    label: 'Average Order Value',
    value: 'PKR 10,500',
    sublabel: 'Since Yesterday',
    trend: '7.2%',
    direction: 'up' as const,
    showStoreSelect: false
  },
  {
    label: 'Customer Lifetime Value',
    value: 'PKR 19,000',
    sublabel: 'Since Yesterday',
    trend: '7.2%',
    direction: 'up' as const,
    showStoreSelect: false
  },
  {
    label: 'Customer Retention',
    value: '35%',
    sublabel: 'Since Yesterday',
    trend: '7.2%',
    direction: 'up' as const,
    showStoreSelect: true
  }
];

const salesKpiTooltips: Record<string, string> = {
  'Total Orders': 'Total orders booked across the selected stores and period.',
  'Total Revenue': 'Gross revenue generated across all selected stores in the active period.',
  'Highest Store Revenue': 'Store with the strongest revenue contribution in the selected period.',
  'Average Revenue per Store': 'Average revenue contribution across active stores in the selected view.',
  'Peak Revenue Day': 'Day with the highest gross revenue in the selected date range.'
};

const salesMetricCards = [
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

const salesStoreOptions = ['All Stores', 'Daraz-02', 'Shopify-01', 'WOO-01', 'Shopify-02', 'Shopify-03'];
const salesMetricOptions = ['Gross Revenue', 'Total Orders', 'Average Order Value'];
const salesDateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 365 Days', 'Custom'];
const salesRegionOptions = ['Pakistan', 'UAE', 'Saudi Arabia', 'UK'];
const locationMetricOptions = ['Orders Volume', 'Gross Revenue', 'Average Order Value'];
const locationDateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];
const locationRegionOptions = ['Pakistan', 'UAE', 'Saudi Arabia', 'UK'];

const locationKpiCards = [
  { label: 'Top Performing Location', value: 'Karachi', trend: '14.2%', direction: 'up' as const },
  { label: 'Most Improved Location', value: 'Lahore', trend: '9.8%', direction: 'up' as const },
  { label: 'Most Declined Location', value: 'Peshawar', trend: '6.1%', direction: 'down' as const },
  { label: 'Average Orders Per Location', value: '1,000', trend: '4.3%', direction: 'up' as const }
];

const locationPerformanceData = [
  { location: 'Karachi', current: 400, previous: 350 },
  { location: 'Lahore', current: 350, previous: 250 },
  { location: 'Islamabad', current: 300, previous: 340 },
  { location: 'Peshawar', current: 250, previous: 187 },
  { location: 'Quetta', current: 200, previous: 240 },
  { location: 'Gilgit', current: 180, previous: 120 },
  { location: 'Hub', current: 160, previous: 180 },
  { location: 'Kashmir', current: 140, previous: 150 },
  { location: 'Bahawalpur', current: 120, previous: 140 },
  { location: 'Rawalpindi', current: 100, previous: 55 }
];

const productMetricOptions = ['Units Sold', 'Gross Revenue', 'Orders Volume'];
const productDateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];
const productRegionOptions = ['Pakistan', 'UAE', 'Saudi Arabia', 'UK'];

const productKpiTooltips: Record<string, string> = {
  'Total Units Sold': 'Total units sold across the selected products and period.',
  'Best Selling Product': 'Product with the highest units sold in the selected period.',
  'Most Improved Product': 'Product with the strongest positive change in units sold.',
  'Most Declined Product': 'Product with the sharpest decline in units sold.',
  'Avg. Units Sold Per Order': 'Average units sold per order across the selected products.'
};

const productMetricCards = [
  {
    label: 'Total Units Sold',
    value: '44,000',
    trend: '10.0%',
    direction: 'up' as const,
    comparison: { current: '44,000', previous: '40,000', change: '4,000' }
  },
  {
    label: 'Best Selling Product',
    value: 'Product One'
  },
  {
    label: 'Most Improved Product',
    value: 'Product Two'
  },
  {
    label: 'Most Declined Product',
    value: 'Product Nine'
  },
  {
    label: 'Avg. Units Sold Per Order',
    value: '1,000',
    trend: '10.0%',
    direction: 'down' as const,
    comparison: { current: '1,000', previous: '1,110', change: '110' }
  }
];

const productPerformanceData = [
  { product: 'Product One', current: 70, previous: 60 },
  { product: 'Product Two', current: 68, previous: 50 },
  { product: 'Product Three', current: 60, previous: 54 },
  { product: 'Product Four', current: 55, previous: 16 },
  { product: 'Product Five', current: 50, previous: 40 },
  { product: 'Product Six', current: 49, previous: 61 },
  { product: 'Product Seven', current: 45, previous: 37 },
  { product: 'Product Eight', current: 32, previous: 25 },
  { product: 'Product Nine', current: 29, previous: 35 },
  { product: 'Product Ten', current: 27, previous: 17 }
];

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
  { name: 'Daraz-02', color: '#22B8C5', data: [71000, 94000, 72000, 83000, 78000, 79000, 66000, 22000, 58000, 29000, 64000, 55000, 73000, 63000, 67000] },
  { name: 'Shopify-01', color: '#F97316', data: [34000, 95000, 21000, 79000, 41000, 100000, 81000, 70000, 37000, 72000, 27000, 69000, 23000, 53000, 34000] },
  { name: 'WOO-01', color: '#9D7AE5', data: [91000, 43000, 49000, 40000, 68000, 34000, 71000, 26000, 23000, 21000, 66000, 24000, 74000, 93000, 91000] },
  { name: 'Shopify-02', color: '#4FE3D5', data: [80000, 22000, 57000, 52000, 78000, 81000, 74000, 40000, 79000, 79000, 54000, 21000, 82000, 81000, 98000] },
  { name: 'Shopify-03', color: '#D946EF', data: [40000, 41000, 21000, 95000, 61000, 81000, 83000, 92000, 33000, 90000, 97000, 25000, 37000, 33000, 81000] }
];

const dayBreakdown = [
  {
    date: 'May 12, 2023',
    stores: [
      { name: 'Daraz-02', orders: 98, revenue: 'PKR 1,350,000', color: '#22B8C5' },
      { name: 'Shopify-01', orders: 47, revenue: 'PKR 2,410,445', color: '#F97316' },
      { name: 'WOO-01', orders: 47, revenue: 'PKR 1,324,350', color: '#9D7AE5' },
      { name: 'Shopify-02', orders: 71, revenue: 'PKR 1,311,785', color: '#4FE3D5' },
      { name: 'Shopify-03', orders: 100, revenue: 'PKR 1,311,785', color: '#D946EF' }
    ]
  },
  {
    date: 'May 14, 2023',
    stores: [
      { name: 'Daraz-02', orders: 84, revenue: 'PKR 1,145,200', color: '#22B8C5' },
      { name: 'Shopify-01', orders: 42, revenue: 'PKR 2,088,410', color: '#F97316' },
      { name: 'WOO-01', orders: 50, revenue: 'PKR 1,402,780', color: '#9D7AE5' },
      { name: 'Shopify-02', orders: 68, revenue: 'PKR 1,274,300', color: '#4FE3D5' },
      { name: 'Shopify-03', orders: 92, revenue: 'PKR 1,254,600', color: '#D946EF' }
    ]
  },
  {
    date: 'May 16, 2023',
    stores: [
      { name: 'Daraz-02', orders: 76, revenue: 'PKR 1,010,000', color: '#22B8C5' },
      { name: 'Shopify-01', orders: 51, revenue: 'PKR 2,220,110', color: '#F97316' },
      { name: 'WOO-01', orders: 45, revenue: 'PKR 1,280,120', color: '#9D7AE5' },
      { name: 'Shopify-02', orders: 74, revenue: 'PKR 1,410,000', color: '#4FE3D5' },
      { name: 'Shopify-03', orders: 105, revenue: 'PKR 1,522,900', color: '#D946EF' }
    ]
  }
];

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
    currentValue: 'PKR 50,000',
    currentDate: '30/Sep/25',
    previousLabel: 'Previous COGS',
    previousValue: 'PKR 54,000',
    previousDate: '29/Sep/25',
    changeValue: 'PKR 4,000',
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('sales');
  const [openDateMenu, setOpenDateMenu] = useState<PeriodKey | null>(null);
  const [customDateCard, setCustomDateCard] = useState<PeriodKey | null>(null);
  const [hoveredMetric, setHoveredMetric] = useState<{ period: PeriodKey; metric: MetricKey } | null>(null);
  const [hoveredTrend, setHoveredTrend] = useState<{ period: PeriodKey; metric: MetricKey } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [openGlanceDateMenu, setOpenGlanceDateMenu] = useState(false);
  const [openStoreMenu, setOpenStoreMenu] = useState(false);
  const [selectedGlanceDate, setSelectedGlanceDate] = useState('This Week');
  const [selectedStore, setSelectedStore] = useState('Select Store');
  const [salesMenus, setSalesMenus] = useState<{ store: boolean; metric: boolean; date: boolean; region: boolean }>({
    store: false,
    metric: false,
    date: false,
    region: false
  });
  const [selectedSalesStore, setSelectedSalesStore] = useState('All Stores');
  const [selectedSalesMetric, setSelectedSalesMetric] = useState('Gross Revenue');
  const [selectedSalesDate, setSelectedSalesDate] = useState('Last 30 Days');
  const [selectedSalesRegion, setSelectedSalesRegion] = useState('Pakistan');
  const [locationMenus, setLocationMenus] = useState<{ metric: boolean; date: boolean; region: boolean }>({
    metric: false,
    date: false,
    region: false
  });
  const [selectedLocationMetric, setSelectedLocationMetric] = useState('Orders Volume');
  const [selectedLocationDate, setSelectedLocationDate] = useState('Last 30 Days');
  const [selectedLocationRegion, setSelectedLocationRegion] = useState('Pakistan');
  const [productMenus, setProductMenus] = useState<{ metric: boolean; date: boolean; region: boolean }>({
    metric: false,
    date: false,
    region: false
  });
  const [selectedProductMetric, setSelectedProductMetric] = useState('Units Sold');
  const [selectedProductDate, setSelectedProductDate] = useState('Last 30 Days');
  const [selectedProductRegion, setSelectedProductRegion] = useState('Pakistan');
  const [hoveredSalesPoint, setHoveredSalesPoint] = useState<{ x: number; y: number; dataIndex: number } | null>(null);
  const [hoveredSalesKpi, setHoveredSalesKpi] = useState<string | null>(null);
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
  };

  const salesChartData = useMemo(
    () => ({
      labels: salesChartLabels,
      datasets: storeSeries.map((series) => ({
        label: series.name,
        data: series.data,
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
    []
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
          max: 110000,
          ticks: {
            stepSize: 20000,
            color: '#7D828A',
            font: {
              family: 'Poppins',
              size: 10
            },
            callback: (value: string | number) => `${(Number(value) / 1000).toFixed(1)}`
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
    []
  );

  const salesTooltipData = hoveredSalesPoint ? dayBreakdown[hoveredSalesPoint.dataIndex % dayBreakdown.length] : null;

  const locationChartData = useMemo(
    () => ({
      labels: locationPerformanceData.map((item) => item.location),
      datasets: [
        {
          label: 'June',
          data: locationPerformanceData.map((item) => item.current),
          backgroundColor: '#10c562',
          borderRadius: 6,
          maxBarThickness: 34
        },
        {
          label: 'May',
          data: locationPerformanceData.map((item) => item.previous),
          backgroundColor: '#c9c9c9',
          borderRadius: 6,
          maxBarThickness: 34
        }
      ]
    }),
    []
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
          max: 420,
          ticks: {
            stepSize: 100,
            color: '#7D828A',
            font: { family: 'Poppins', size: 11 }
          },
          grid: { color: '#EEF0EB' },
          border: { display: false }
        }
      }
    }),
    []
  );

  const productChartData = useMemo(
    () => ({
      labels: productPerformanceData.map((item) => item.product),
      datasets: [
        {
          label: 'April',
          data: productPerformanceData.map((item) => item.current),
          backgroundColor: '#10c562',
          borderRadius: 6,
          maxBarThickness: 34
        },
        {
          label: 'May',
          data: productPerformanceData.map((item) => item.previous),
          backgroundColor: '#c9c9c9',
          borderRadius: 6,
          maxBarThickness: 34
        }
      ]
    }),
    []
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
          max: 75,
          ticks: {
            stepSize: 10,
            color: '#7D828A',
            font: { family: 'Poppins', size: 11 }
          },
          grid: { color: '#EEF0EB' },
          border: { display: false }
        }
      }
    }),
    []
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
              <div className="tu-flex tu-gap-4 sm:tu-gap-5">
                {tabs.map((tab) => {
                  const active = tab.key === activeTab;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`tu-relative tu-pb-2 tu-text-[14px] tu-font-medium tu-transition ${
                        active ? 'tu-text-[#10c562]' : 'tu-text-[#2f3133]'
                      }`}
                    >
                      {tab.label}
                      {active ? (
                        <span className="tu-absolute tu-bottom-0 tu-left-0 tu-h-[2px] tu-w-full tu-rounded-full tu-bg-[#10c562]" />
                      ) : null}
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
                            }}
                            className="tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium tu-text-[#7f838a] hover:tu-text-[#2a2c2f]"
                          >
                            <span>Select Date</span>
                            <ChevronDown className="tu-h-3 tu-w-3" />
                          </button>

                          {isDateMenuOpen ? (
                            <div className="tu-absolute tu-right-0 tu-top-[calc(100%+10px)] tu-z-30 tu-w-[170px] tu-overflow-hidden tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                              {dateMenu.map((item, index) => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => {
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
                                  className={`tu-flex tu-w-full tu-items-center tu-justify-between tu-px-3.5 tu-py-2.5 tu-text-left tu-text-[13px] tu-text-[#2f3133] hover:tu-bg-[#f5f6f3] ${
                                    index === 0 ? 'tu-bg-[#f5f6f3]' : ''
                                  }`}
                                >
                                  <span>{item}</span>
                                  {item === 'Custom' ? <ChevronRight className="tu-h-3.5 tu-w-3.5 tu-text-[#9d9ea2]" /> : null}
                                </button>
                              ))}
                            </div>
                          ) : null}

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
                          const metricHoverOpen =
                            hoveredMetric?.period === period.key && hoveredMetric.metric === metric.key;
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
                                <div className="tu-pointer-events-none tu-absolute tu-bottom-[calc(100%+8px)] tu-left-0 tu-z-30 tu-w-[180px] tu-rounded-md tu-bg-[#111111] tu-px-2.5 tu-py-2 tu-text-[11px] tu-leading-4 tu-text-white tu-opacity-0 tu-shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-opacity group-hover:tu-opacity-100">
                                  {metricTooltips[metric.key]}
                                </div>
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
                                <div className="tu-absolute tu-left-0 tu-top-[calc(100%+8px)] tu-z-20 tu-w-[280px] tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-p-3 tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)] before:tu-absolute before:tu-left-[34px] before:tu-top-[-7px] before:tu-h-3.5 before:tu-w-3.5 before:tu-rotate-45 before:tu-border-l before:tu-border-t before:tu-border-[#ededed] before:tu-bg-white before:tu-content-['']">
                                  <div className="tu-space-y-2">
                                    {metricPopoverContent[metric.key].map((item, index) => (
                                      <div
                                        key={`${metric.key}-${item.label}`}
                                        className={`tu-flex tu-items-end tu-justify-between tu-gap-3 ${
                                          item.dividerBefore ? 'tu-border-t tu-border-[#eceee8] tu-pt-2' : ''
                                        }`}
                                      >
                                        <span
                                          className={`tu-text-[11px] ${
                                            item.strong ? 'tu-font-semibold tu-text-[#333538]' : 'tu-text-[#44464b]'
                                          }`}
                                        >
                                          <span className="tu-underline tu-underline-offset-2">{item.label}</span>
                                        </span>
                                        <span
                                          className={`tu-text-[11px] ${
                                            item.strong ? 'tu-font-semibold tu-text-[#333538]' : 'tu-text-[#44464b]'
                                          }`}
                                        >
                                          {item.value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null}

                              {trendHoverOpen ? (
                                <div className="tu-absolute tu-left-0 tu-top-[calc(100%+8px)] tu-z-20 tu-w-[245px] tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-p-0 tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                                  <div className="tu-border-b tu-border-[#eceee8] tu-px-4 tu-py-2.5">
                                    <h3 className="tu-text-[11px] tu-font-semibold tu-text-[#333538]">
                                      Current vs Pervious Period
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
              <div className="tu-flex tu-flex-col tu-gap-3 lg:tu-flex-row lg:tu-items-start lg:tu-justify-between">
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
                      }}
                      className="tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium tu-text-[#7f838a] hover:tu-text-[#2a2c2f]"
                    >
                      <span>{selectedGlanceDate}</span>
                      <ChevronDown className="tu-h-3 tu-w-3" />
                    </button>

                    {openGlanceDateMenu ? (
                      <div className="tu-absolute tu-right-0 tu-top-[calc(100%+10px)] tu-z-30 tu-w-[170px] tu-overflow-hidden tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                        {glanceDateOptions.map((item, index) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setSelectedGlanceDate(item);
                              setOpenGlanceDateMenu(false);
                            }}
                            className={`tu-flex tu-w-full tu-items-center tu-justify-between tu-px-3.5 tu-py-2.5 tu-text-left tu-text-[13px] tu-text-[#2f3133] hover:tu-bg-[#f5f6f3] ${
                              index === 0 ? 'tu-bg-[#f5f6f3]' : ''
                            }`}
                          >
                            <span>{item}</span>
                            {item === 'Custom' ? <ChevronRight className="tu-h-3.5 tu-w-3.5 tu-text-[#9d9ea2]" /> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="tu-mt-4 tu-grid tu-gap-3 lg:tu-grid-cols-4">
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
                          <p className="tu-text-[13px] tu-text-[#9a9ca2]">{metric.label}</p>
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
                              }}
                              className="tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium tu-text-[#7f838a] hover:tu-text-[#2a2c2f]"
                            >
                              <span>{selectedStore}</span>
                              <ChevronDown className="tu-h-3 tu-w-3" />
                            </button>

                            {openStoreMenu ? (
                              <div className="tu-absolute tu-right-0 tu-top-[calc(100%+10px)] tu-z-30 tu-w-[190px] tu-overflow-hidden tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                                {storeOptions.map((item, index) => (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => {
                                      setSelectedStore(item);
                                      setOpenStoreMenu(false);
                                    }}
                                    className={`tu-flex tu-w-full tu-items-center tu-justify-between tu-px-3.5 tu-py-2.5 tu-text-left tu-text-[13px] tu-text-[#2f3133] hover:tu-bg-[#f5f6f3] ${
                                      index === 0 ? 'tu-bg-[#f5f6f3]' : ''
                                    }`}
                                  >
                                    <span>{item}</span>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="tu-mt-3 tu-flex tu-items-center tu-gap-2">
                        <span className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium ${trendColor}`}>
                          {metric.trend}
                          <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                        </span>
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
                    { key: 'store', value: selectedSalesStore, options: salesStoreOptions },
                    { key: 'metric', value: selectedSalesMetric, options: salesMetricOptions },
                    { key: 'date', value: selectedSalesDate, options: salesDateOptions },
                    { key: 'region', value: selectedSalesRegion, options: salesRegionOptions }
                  ].map((menu) => (
                    <div key={menu.key} className="tu-relative">
                      <button
                        type="button"
                        onClick={() =>
                          setSalesMenus((current) => ({
                            store: false,
                            metric: false,
                            date: false,
                            region: false,
                            [menu.key]: !current[menu.key as keyof typeof current]
                          }))
                        }
                        className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                      >
                        <span>{menu.value}</span>
                        <ChevronDown className="tu-h-3 tu-w-3" />
                      </button>

                      {salesMenus[menu.key as keyof typeof salesMenus] ? (
                        <div className="tu-absolute tu-right-0 tu-top-[calc(100%+10px)] tu-z-30 tu-w-[180px] tu-overflow-hidden tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                          {menu.options.map((item, index) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (menu.key === 'store') setSelectedSalesStore(item);
                                if (menu.key === 'metric') setSelectedSalesMetric(item);
                                if (menu.key === 'date') setSelectedSalesDate(item);
                                if (menu.key === 'region') setSelectedSalesRegion(item);
                                setSalesMenus({ store: false, metric: false, date: false, region: false });
                              }}
                              className={`tu-flex tu-w-full tu-items-center tu-justify-between tu-px-3.5 tu-py-2.5 tu-text-left tu-text-[13px] tu-text-[#2f3133] hover:tu-bg-[#f5f6f3] ${
                                index === 0 ? 'tu-bg-[#f5f6f3]' : ''
                              }`}
                            >
                              <span>{item}</span>
                              {item === 'Custom' ? <ChevronRight className="tu-h-3.5 tu-w-3.5 tu-text-[#9d9ea2]" /> : null}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tu-mt-6 tu-grid tu-gap-5 xl:tu-grid-cols-[300px_minmax(0,1fr)]">
                <article className="tu-rounded-[16px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] tu-p-4 tu-shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
                  <div className="tu-rounded-[14px] tu-border tu-border-[#eef1eb] tu-bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] tu-p-4">
                    {salesMetricCards.map((metric, index) => {
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
                            <div className="tu-pointer-events-none tu-absolute tu-bottom-[calc(100%+8px)] tu-left-0 tu-z-30 tu-w-[190px] tu-rounded-md tu-bg-[#111111] tu-px-2.5 tu-py-2 tu-text-[11px] tu-leading-4 tu-text-white tu-opacity-0 tu-shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-opacity group-hover:tu-opacity-100">
                              {salesKpiTooltips[metric.label]}
                            </div>
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
                                  <div className="tu-absolute tu-left-0 tu-top-[calc(100%+8px)] tu-z-20 tu-w-[235px] tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-p-0 tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                                    <div className="tu-border-b tu-border-[#eceee8] tu-px-4 tu-py-2.5">
                                      <h3 className="tu-text-[11px] tu-font-semibold tu-text-[#333538]">Current vs Pervious Period</h3>
                                    </div>
                                    <div className="tu-px-4 tu-py-3">
                                      <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
                                        <div>
                                          <p className="tu-text-[11px] tu-text-[#44464b]">Current</p>
                                          <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">{metric.comparison!.current}</p>
                                        </div>
                                        <p className="tu-text-[11px] tu-text-[#44464b]">Current Period</p>
                                      </div>
                                      <div className="tu-my-2.5 tu-h-px tu-bg-[#eceee8]" />
                                      <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
                                        <div>
                                          <p className="tu-text-[11px] tu-text-[#44464b]">Previous</p>
                                          <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">{metric.comparison!.previous}</p>
                                        </div>
                                        <p className="tu-text-[11px] tu-text-[#44464b]">Previous Period</p>
                                      </div>
                                      <div className="tu-my-2.5 tu-h-px tu-bg-[#eceee8]" />
                                      <div className="tu-flex tu-items-center tu-justify-between tu-gap-3">
                                        <div>
                                          <p className="tu-text-[11px] tu-font-semibold tu-text-[#333538]">Change</p>
                                          <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">{metric.comparison!.change}</p>
                                        </div>
                                        <div className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[11px] tu-font-semibold ${trendColor}`}>
                                          <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                                          <span>{metric.trend}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
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

                  {hoveredSalesPoint && salesTooltipData ? (
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
                      <div className="tu-mt-4 tu-grid tu-grid-cols-[1.3fr_0.7fr_1.2fr] tu-gap-4 tu-text-[10px] tu-font-semibold tu-uppercase tu-tracking-[0.04em] tu-text-[#9a9ca2]">
                        <span />
                        <span className="tu-whitespace-nowrap">Total Orders</span>
                        <span>Gross Revenue</span>
                      </div>
                      <div className="tu-mt-3 tu-space-y-2.5">
                        {salesTooltipData.stores.map((store) => (
                          <div key={`${salesTooltipData.date}-${store.name}`} className="tu-grid tu-grid-cols-[1.3fr_0.7fr_1.2fr] tu-gap-4 tu-items-center">
                            <div className="tu-flex tu-items-center tu-gap-2.5">
                              <span className="tu-h-2.5 tu-w-2.5 tu-rounded-full" style={{ backgroundColor: store.color }} />
                              <span className="tu-text-[13px] tu-text-[#4b4e53]">{store.name}</span>
                            </div>
                            <span className="tu-text-[13px] tu-font-medium tu-text-[#333538]">{store.orders}</span>
                            <span className="tu-text-[13px] tu-font-medium tu-text-[#333538]">{store.revenue}</span>
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
                <h2 className="tu-text-[20px] tu-font-semibold tu-text-[#2a2c2f]">Sales Performance by Location</h2>

                <div className="tu-flex tu-flex-wrap tu-gap-2.5 sm:tu-gap-3">
                  {[
                    { key: 'metric', value: selectedLocationMetric, options: locationMetricOptions },
                    { key: 'date', value: selectedLocationDate, options: locationDateOptions },
                    { key: 'region', value: selectedLocationRegion, options: locationRegionOptions }
                  ].map((menu) => (
                    <div key={menu.key} className="tu-relative">
                      <button
                        type="button"
                        onClick={() =>
                          setLocationMenus((current) => ({
                            metric: false,
                            date: false,
                            region: false,
                            [menu.key]: !current[menu.key as keyof typeof current]
                          }))
                        }
                        className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                      >
                        <span>{menu.value}</span>
                        <ChevronDown className="tu-h-3 tu-w-3" />
                      </button>

                      {locationMenus[menu.key as keyof typeof locationMenus] ? (
                        <div className="tu-absolute tu-right-0 tu-top-[calc(100%+10px)] tu-z-30 tu-w-[180px] tu-overflow-hidden tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                          {menu.options.map((item, index) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (menu.key === 'metric') setSelectedLocationMetric(item);
                                if (menu.key === 'date') setSelectedLocationDate(item);
                                if (menu.key === 'region') setSelectedLocationRegion(item);
                                setLocationMenus({ metric: false, date: false, region: false });
                              }}
                              className={`tu-flex tu-w-full tu-items-center tu-justify-between tu-px-3.5 tu-py-2.5 tu-text-left tu-text-[13px] tu-text-[#2f3133] hover:tu-bg-[#f5f6f3] ${
                                index === 0 ? 'tu-bg-[#f5f6f3]' : ''
                              }`}
                            >
                              <span>{item}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tu-mt-6 tu-grid tu-gap-3 lg:tu-grid-cols-4">
                {locationKpiCards.map((metric) => {
                  const TrendIcon = metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
                  const trendColor = metric.direction === 'up' ? 'tu-text-[#10c562]' : 'tu-text-[#de524c]';

                  return (
                    <article
                      key={metric.label}
                      className="tu-rounded-[14px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] tu-p-4 tu-shadow-[0_8px_24px_rgba(31,41,55,0.06)]"
                    >
                      <p className="tu-text-[13px] tu-text-[#8f9197]">{metric.label}</p>
                      <div className="tu-mt-2 tu-flex tu-items-end tu-gap-2">
                        <p className="tu-text-[21px] tu-font-semibold tu-leading-none tu-text-[#333538]">{metric.value}</p>
                        <span className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[12px] tu-font-medium ${trendColor}`}>
                          {metric.trend}
                          <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                        </span>
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
                    { key: 'region', value: selectedProductRegion, options: productRegionOptions }
                  ].map((menu) => (
                    <div key={menu.key} className="tu-relative">
                      <button
                        type="button"
                        onClick={() =>
                          setProductMenus((current) => ({
                            metric: false,
                            date: false,
                            region: false,
                            [menu.key]: !current[menu.key as keyof typeof current]
                          }))
                        }
                        className="tu-inline-flex tu-h-9 tu-items-center tu-gap-1.5 tu-rounded-[10px] tu-border tu-border-[#dfe5dc] tu-bg-[#f8faf7] tu-px-3.5 tu-text-[12px] tu-font-medium tu-text-[#5f656c] tu-shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:tu-border-[#ccd7c9] hover:tu-bg-white hover:tu-text-[#2a2c2f]"
                      >
                        <span>{menu.value}</span>
                        <ChevronDown className="tu-h-3 tu-w-3" />
                      </button>

                      {productMenus[menu.key as keyof typeof productMenus] ? (
                        <div className="tu-absolute tu-right-0 tu-top-[calc(100%+10px)] tu-z-30 tu-w-[180px] tu-overflow-hidden tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                          {menu.options.map((item, index) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (menu.key === 'metric') setSelectedProductMetric(item);
                                if (menu.key === 'date') setSelectedProductDate(item);
                                if (menu.key === 'region') setSelectedProductRegion(item);
                                setProductMenus({ metric: false, date: false, region: false });
                              }}
                              className={`tu-flex tu-w-full tu-items-center tu-justify-between tu-px-3.5 tu-py-2.5 tu-text-left tu-text-[13px] tu-text-[#2f3133] hover:tu-bg-[#f5f6f3] ${
                                index === 0 ? 'tu-bg-[#f5f6f3]' : ''
                              }`}
                            >
                              <span>{item}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tu-mt-6 tu-grid tu-gap-5 xl:tu-grid-cols-[300px_minmax(0,1fr)]">
                <article className="tu-rounded-[16px] tu-border tu-border-[#e9ece5] tu-bg-[linear-gradient(180deg,#ffffff_0%,#f8faf7_100%)] tu-p-4 tu-shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
                  <div className="tu-rounded-[14px] tu-border tu-border-[#eef1eb] tu-bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfa_100%)] tu-p-4">
                    {productMetricCards.map((metric, index) => {
                      const hasTrend = 'trend' in metric;
                      const trendDirection = hasTrend && metric.direction === 'up' ? ArrowUpRight : ArrowDownRight;
                      const trendColor = hasTrend && metric.direction === 'up' ? 'tu-text-[#10c562]' : 'tu-text-[#de524c]';
                      const TrendIcon = trendDirection;

                      return (
                        <div
                          key={metric.label}
                          className={`${index > 0 ? 'tu-mt-3 tu-border-t tu-border-dashed tu-border-[#e7ebe4] tu-pt-3' : ''}`}
                        >
                          <div className="tu-group tu-relative tu-inline-block">
                            <button type="button" className={`tu-text-[13px] ${index === 0 ? 'tu-text-[#7f9385]' : 'tu-text-[#8f9197]'}`}>
                              {metric.label}
                            </button>
                            <div className="tu-pointer-events-none tu-absolute tu-bottom-[calc(100%+8px)] tu-left-0 tu-z-30 tu-w-[190px] tu-rounded-md tu-bg-[#111111] tu-px-2.5 tu-py-2 tu-text-[11px] tu-leading-4 tu-text-white tu-opacity-0 tu-shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-opacity group-hover:tu-opacity-100">
                              {productKpiTooltips[metric.label]}
                            </div>
                          </div>

                          <div className={`tu-flex tu-items-end tu-gap-2 ${index === 0 ? 'tu-mt-2' : 'tu-mt-1.5'}`}>
                            <p
                              className={`tu-text-[#333538] ${
                                index === 0 ? 'tu-text-[24px] tu-font-semibold tu-leading-none' : 'tu-text-[17px] tu-font-medium tu-leading-none'
                              }`}
                            >
                              {metric.value}
                            </p>
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
                                  <div className="tu-absolute tu-left-0 tu-top-[calc(100%+8px)] tu-z-20 tu-w-[235px] tu-rounded-[12px] tu-border tu-border-[#ededed] tu-bg-white tu-p-0 tu-shadow-[0_16px_40px_rgba(31,41,55,0.18)]">
                                    <div className="tu-border-b tu-border-[#eceee8] tu-px-4 tu-py-2.5">
                                      <h3 className="tu-text-[11px] tu-font-semibold tu-text-[#333538]">Current vs Pervious Period</h3>
                                    </div>
                                    <div className="tu-px-4 tu-py-3">
                                      <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
                                        <div>
                                          <p className="tu-text-[11px] tu-text-[#44464b]">Current</p>
                                          <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">{metric.comparison!.current}</p>
                                        </div>
                                        <p className="tu-text-[11px] tu-text-[#44464b]">Current Period</p>
                                      </div>
                                      <div className="tu-my-2.5 tu-h-px tu-bg-[#eceee8]" />
                                      <div className="tu-flex tu-items-start tu-justify-between tu-gap-3">
                                        <div>
                                          <p className="tu-text-[11px] tu-text-[#44464b]">Previous</p>
                                          <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">{metric.comparison!.previous}</p>
                                        </div>
                                        <p className="tu-text-[11px] tu-text-[#44464b]">Previous Period</p>
                                      </div>
                                      <div className="tu-my-2.5 tu-h-px tu-bg-[#eceee8]" />
                                      <div className="tu-flex tu-items-center tu-justify-between tu-gap-3">
                                        <div>
                                          <p className="tu-text-[11px] tu-font-semibold tu-text-[#333538]">Change</p>
                                          <p className="tu-mt-1.5 tu-text-[13px] tu-font-semibold tu-text-[#333538]">{metric.comparison!.change}</p>
                                        </div>
                                        <div className={`tu-inline-flex tu-items-center tu-gap-1 tu-text-[11px] tu-font-semibold ${trendColor}`}>
                                          <TrendIcon className="tu-h-3.5 tu-w-3.5" />
                                          <span>{metric.trend}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
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
