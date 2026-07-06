/** Milestone 159 — Performance Monitor™ · Living performance metrics */

export const PERFORMANCE_MONITOR_STORAGE_KEY = 'studioOsPerformanceMonitor_v1';
export const PERFORMANCE_MONITOR_VERSION = '1.0.0';
export const STUDIO_OS_PERFORMANCE_MONITOR_UPDATED = 'studio-os-performance-monitor-updated';

export const PERFORMANCE_MONITOR_ACCENT = '#0891B2';

export const PERFORMANCE_MONITOR_PHILOSOPHY = [
  'Performance Monitor™ continuously measures speed, responsiveness, efficiency, and operational performance across Studio OS.',
  'Performance is a living metric — not something measured only before releases.',
  'Studio OS should never become slower simply because it becomes more capable.',
  'Every new feature must preserve the fast, premium, responsive experience users expect. Performance is a feature — not an afterthought.',
] as const;

export const MONITOR_METRICS = [
  'page-load-times',
  'interaction-latency',
  'animation-smoothness',
  'rendering-performance',
  'memory-usage',
  'cpu-usage',
  'gpu-utilization',
  'network-requests',
  'api-response-times',
  'database-queries',
  'ai-response-times',
  'storage-utilization',
  'mobile-performance',
  'desktop-performance',
  'battery-impact',
] as const;

export const SIMULATION_SCENARIOS = [
  'mobile-devices',
  'tablets',
  'desktop',
  'low-bandwidth',
  'high-latency',
  'older-hardware',
  'large-organizations',
  'heavy-ai-workloads',
] as const;

export const BOTTLENECK_TYPES = [
  'slow-page-load',
  'high-interaction-latency',
  'janky-animation',
  'render-blocking',
  'memory-leak',
  'cpu-spike',
  'excessive-network',
  'slow-api',
  'slow-database',
  'slow-ai-response',
  'storage-bloat',
  'mobile-degradation',
  'battery-drain',
] as const;

export const PERFORMANCE_SEVERITIES = ['critical', 'warning', 'advisory'] as const;

export const SPEED_TRENDS = ['improving', 'stable', 'declining'] as const;

export const MONITOR_METRIC_LABELS: Record<(typeof MONITOR_METRICS)[number], string> = {
  'page-load-times': 'Page Load Times',
  'interaction-latency': 'Interaction Latency',
  'animation-smoothness': 'Animation Smoothness',
  'rendering-performance': 'Rendering Performance',
  'memory-usage': 'Memory Usage',
  'cpu-usage': 'CPU Usage',
  'gpu-utilization': 'GPU Utilization',
  'network-requests': 'Network Requests',
  'api-response-times': 'API Response Times',
  'database-queries': 'Database Queries',
  'ai-response-times': 'AI Response Times',
  'storage-utilization': 'Storage Utilization',
  'mobile-performance': 'Mobile Performance',
  'desktop-performance': 'Desktop Performance',
  'battery-impact': 'Battery Impact',
};

export const SIMULATION_SCENARIO_LABELS: Record<(typeof SIMULATION_SCENARIOS)[number], string> = {
  'mobile-devices': 'Mobile Devices',
  tablets: 'Tablets',
  desktop: 'Desktop',
  'low-bandwidth': 'Low Bandwidth',
  'high-latency': 'High Latency',
  'older-hardware': 'Older Hardware',
  'large-organizations': 'Large Organizations',
  'heavy-ai-workloads': 'Heavy AI Workloads',
};

export const BOTTLENECK_LABELS: Record<(typeof BOTTLENECK_TYPES)[number], string> = {
  'slow-page-load': 'Slow Page Load',
  'high-interaction-latency': 'High Interaction Latency',
  'janky-animation': 'Janky Animation',
  'render-blocking': 'Render Blocking',
  'memory-leak': 'Memory Leak Suspected',
  'cpu-spike': 'CPU Spike',
  'excessive-network': 'Excessive Network Requests',
  'slow-api': 'Slow API Response',
  'slow-database': 'Slow Database Query',
  'slow-ai-response': 'Slow AI Response',
  'storage-bloat': 'Storage Bloat',
  'mobile-degradation': 'Mobile Performance Degradation',
  'battery-drain': 'Battery Drain',
};
