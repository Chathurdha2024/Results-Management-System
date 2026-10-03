// Same relative-time logic as StudentDashboard.jsx in the web portal.
export function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + ' min' + (interval === 1 ? '' : 's') + ' ago';

  if (seconds < 10) return 'just now';
  return Math.floor(seconds) + ' sec ago';
}

export const nonPassingGrades = ['E', 'F', 'AB', '-'];
