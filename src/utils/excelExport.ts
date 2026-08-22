/**
 * Utility to export structured array data to Excel-compatible CSV with UTF-8 BOM.
 * UTF-8 BOM (\uFEFF) ensures Thai language (ภาษาไทย) renders perfectly in MS Excel & Google Sheets.
 */
export const exportToExcel = (
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) => {
  const escapeCell = (cell: any): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = rows.map((row) => row.map(escapeCell).join(','));

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatJobStatusThai = (status: string): string => {
  switch (status) {
    case 'Pending':
      return 'รอมอบหมาย';
    case 'Assigned':
      return 'มอบหมายแล้ว';
    case 'Started':
      return 'เริ่มงานแล้ว';
    case 'Arrived':
      return 'ถึงสถานที่แล้ว';
    case 'Completed':
      return 'ปิดงานแล้ว';
    case 'Cancelled':
      return 'ยกเลิก';
    default:
      return status || '-';
  }
};
