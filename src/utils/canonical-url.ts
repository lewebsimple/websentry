export function getCanonicalUrl(url: string): string {
  const parsedUrl = new URL(url);

  // Drop hash
  parsedUrl.hash = "";

  // Sort query params by key then value
  const entries = [...parsedUrl.searchParams.entries()].sort(([ka, va], [kb, vb]) =>
    ka === kb ? va.localeCompare(vb) : ka.localeCompare(kb),
  );
  parsedUrl.search = "";
  for (const [k, v] of entries) parsedUrl.searchParams.append(k, v);

  // Strip trailing slash except root
  if (parsedUrl.pathname.length > 1 && parsedUrl.pathname.endsWith("/")) {
    parsedUrl.pathname = parsedUrl.pathname.slice(0, -1);
  }

  return parsedUrl.toString();
}
