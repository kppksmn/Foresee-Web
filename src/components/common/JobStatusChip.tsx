import React from 'react';
import { Chip } from '@mui/material';

interface Props {
  status: string;
}

export const JobStatusChip: React.FC<Props> = ({ status }) => {
  let label = status;
  let color: 'default' | 'warning' | 'info' | 'secondary' | 'success' | 'error' = 'default';

  switch (status) {
    case 'Pending':
      label = 'รอมอบหมาย';
      color = 'warning';
      break;
    case 'Assigned':
      label = 'มอบหมายแล้ว';
      color = 'info';
      break;
    case 'Started':
      label = 'เริ่มงานแล้ว';
      color = 'secondary';
      break;
    case 'Arrived':
      label = 'ถึงสถานที่แล้ว';
      color = 'info';
      break;
    case 'Completed':
      label = 'ปิดงานแล้ว';
      color = 'success';
      break;
    case 'Cancelled':
      label = 'ยกเลิก';
      color = 'error';
      break;
  }

  return <Chip label={label} color={color} size="small" />;
};
