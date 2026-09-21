import type { Complaint } from '@fixmyinfra/types';

export interface RecentUpdate extends Complaint {
  title: string;
  timestamp: string;
  thumbnail: string;
}

export const mockComplaints: Complaint[] = [
  {
    id: 'IF-2048',
    category: 'Road damage',
    description: 'Large pothole near the community park entrance.',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=240&q=80',
    latitude: 19.9975,
    longitude: 73.7898,
    status: 'IN_PROGRESS',
    departmentId: 'roads',
    createdAt: '2024-09-18T08:30:00.000Z'
  },
  {
    id: 'IF-2039',
    category: 'Streetlight',
    description: 'Streetlight is not working outside the library.',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=240&q=80',
    latitude: 19.9971,
    longitude: 73.7902,
    status: 'RESOLVED',
    departmentId: 'electrical',
    createdAt: '2024-09-15T14:10:00.000Z'
  },
  {
    id: 'IF-2027',
    category: 'Water and drainage',
    description: 'Water is collecting near the school crossing after rain.',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=240&q=80',
    latitude: 19.9964,
    longitude: 73.7885,
    status: 'SUBMITTED',
    departmentId: 'water',
    createdAt: '2024-09-12T10:45:00.000Z'
  }
];

export const recentUpdates: RecentUpdate[] = [
  { ...mockComplaints[0], title: 'Pothole reported on College Road', timestamp: '2 hours ago', thumbnail: mockComplaints[0].imageUrl ?? '' },
  { ...mockComplaints[1], title: 'Streetlight fixed near City Library', timestamp: 'Yesterday', thumbnail: mockComplaints[1].imageUrl ?? '' },
  { ...mockComplaints[2], title: 'Drainage issue received', timestamp: '3 days ago', thumbnail: mockComplaints[2].imageUrl ?? '' }
];
