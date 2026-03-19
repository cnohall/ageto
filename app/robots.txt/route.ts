export async function GET() {
  return new Response(
    `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://tokenprobe.nohall.dev/sitemap.xml`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
