/**
 * Formats a date string (YYYY-MM-DD or ISO string) to Thai Day Month Year format
 * e.g., "2026-08-19" -> "19 ส.ค. 2569"
 */
export const formatDateThai = (dateStr: string | null | undefined, fullMonth: boolean = false): string => {
  if (!dateStr || dateStr === '-') return '-';

  try {
    const cleanDate = dateStr.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length !== 3) return dateStr;

    const yyyy = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);
    const dd = parseInt(parts[2], 10);

    if (isNaN(yyyy) || isNaN(mm) || isNaN(dd)) return dateStr;

    const thaiYear = yyyy + 543;
    const shortMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const fullMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const monthText = fullMonth ? fullMonths[mm - 1] : shortMonths[mm - 1];
    return `${dd} ${monthText} ${thaiYear}`;
  } catch (e) {
    return dateStr;
  }
};

export const formatDateNumericThai = (dateStr: string | null | undefined): string => {
  if (!dateStr || dateStr === '-') return '-';

  try {
    const cleanDate = dateStr.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length !== 3) return dateStr;

    const yyyy = parseInt(parts[0], 10);
    const mm = parts[1].padStart(2, '0');
    const dd = parts[2].padStart(2, '0');

    if (isNaN(yyyy)) return dateStr;

    const thaiYear = yyyy + 543;
    return `${dd}/${mm}/${thaiYear}`;
  } catch (e) {
    return dateStr;
  }
};
