export const config = {
  matcher: '/:path*',
};

export default async function middleware(request) {
  // Check and block specific IP
  const clientIp = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '';
  if (clientIp.includes('223.188.46.116')) {
    return new Response('404 Not Found', {
      status: 404,
      headers: { 'content-type': 'text/plain' }
    });
  }

  // Check MAINTENANCE_MODE environment variable
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true' || process.env.MAINTENANCE_MODE === '1';

  if (isMaintenanceMode) {
    const maintenanceUrl = new URL('/maintenance.html', request.url);
    return fetch(maintenanceUrl);
  }
}
