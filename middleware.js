export const config = {
  matcher: ['/', '/index.html'],
};

export default async function middleware(request) {
  // Check MAINTENANCE_MODE environment variable
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true' || process.env.MAINTENANCE_MODE === '1';

  if (isMaintenanceMode) {
    const maintenanceUrl = new URL('/maintenance.html', request.url);
    return fetch(maintenanceUrl);
  }
}
