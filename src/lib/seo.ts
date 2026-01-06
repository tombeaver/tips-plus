export type PageSEO = {
  title: string;
  description: string;
  canonicalPath: string;
};

const upsertMeta = (name: string) => {
  const existing = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (existing) return existing;
  const el = document.createElement('meta');
  el.setAttribute('name', name);
  document.head.appendChild(el);
  return el;
};

const upsertLink = (rel: string) => {
  const existing = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (existing) return existing;
  const el = document.createElement('link');
  el.setAttribute('rel', rel);
  document.head.appendChild(el);
  return el;
};

export const setPageSEO = ({ title, description, canonicalPath }: PageSEO) => {
  document.title = title;

  const desc = upsertMeta('description');
  desc.setAttribute('content', description);

  const canonical = upsertLink('canonical');
  canonical.setAttribute('href', `${window.location.origin}${canonicalPath}`);
};
