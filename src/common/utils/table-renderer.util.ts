import { UsageData } from '../interfaces/usage-data.interface';
export function formatUsageRow(data: UsageData): string {
  return `
    <tr>
      <td>${data.domainName}</td>
      <td>${data.emailVolume.toLocaleString()}</td>
      <td>${Number.isFinite(data.spfPassRatio) ? data.spfPassRatio.toFixed(1) : 'N/A'}</td>
      <td>${Number.isFinite(data.dmarcPassRatio) ? data.dmarcPassRatio.toFixed(1) : 'N/A'}</td>
    </tr>
  `;
}

export function renderUsageDataRows(dataArray: UsageData[]): string {
  if (!dataArray || dataArray.length === 0) {
    return `
      <tr>
        <td colspan="4">No usage data available for this period.</td>
      </tr>
    `;
  }
  return dataArray.map(formatUsageRow).join('');
}

export function renderTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  return Object.entries(variables).reduce(
    (html, [key, value]) => html.replace(`{{${key}}}`, value),
    template,
  );
}
