export function buildBarChart(title: string, dataStr: string): string {
  const items = dataStr
    .split(",")
    .map((item) => {
      const [label, rawVal] = item.split("=").map((s) => s.trim());
      return { label: label || "", value: parseFloat(rawVal) || 0 };
    })
    .filter((i) => i.label);

  if (items.length === 0) return "";
  const max = Math.max(...items.map((i) => i.value));

  const rows = items
    .map(({ label, value }) => {
      const pct = max > 0 ? (value / max) * 100 : 0;
      return `<div class="chart-row">
      <div class="chart-label">${label}</div>
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="width:${pct.toFixed(1)}%"></div>
        <span class="chart-value">${value}</span>
      </div>
    </div>`;
    })
    .join("");

  return `<div class="chart-container"><div class="chart-title">${title}</div>${rows}</div>`;
}

export function processCharts(html: string): string {
  return html
    .replace(/<p>\s*\[CHART:bar:([^:]+):([^\]]+)\]\s*<\/p>/g, (_, t, d) => buildBarChart(t, d))
    .replace(/\[CHART:bar:([^:]+):([^\]]+)\]/g, (_, t, d) => buildBarChart(t, d));
}
