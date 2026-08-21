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

/**
 * Formats a time string (e.g., "08:30" or "08:30:00") to Thai time format
 * e.g., "08:30" -> "08:30 น."
 */
export const formatTimeThai = (timeStr: string | null | undefined): string => {
  if (!timeStr || timeStr === '-') return '-';
  const clean = timeStr.trim().replace(/\s*น\.?$/i, '');
  if (!clean) return '-';
  const parts = clean.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')} น.`;
  }
  return `${clean} น.`;
};

/**
 * Formats date and time into Thai format with "น."
 * e.g. "2026-08-20 14:30:00" -> "20 ส.ค. 2569 14:30 น."
 */
export const formatDateTimeThai = (dateTimeStr: string | null | undefined): string => {
  if (!dateTimeStr || dateTimeStr === '-') return '-';
  try {
    const [datePart, timePart] = dateTimeStr.includes('T')
      ? dateTimeStr.split('T')
      : dateTimeStr.split(' ');

    const formattedDate = formatDateThai(datePart);
    if (!timePart) return formattedDate;

    const timeFormatted = formatTimeThai(timePart.substring(0, 5));
    return `${formattedDate} ${timeFormatted}`;
  } catch (e) {
    return dateTimeStr;
  }
};

/**
 * Formats phone number into Thai standard format:
 * - 9 digits -> xx-xxx-xxxx (e.g. 02-123-4567)
 * - 10 digits -> xxx-xxx-xxxx (e.g. 081-234-5678)
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone || phone === '-') return '-';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return phone;
};
