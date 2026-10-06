import { getCollection, type CollectionEntry } from 'astro:content';

export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) =>
    b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id),
  );
}

export function postUrl(post: CollectionEntry<'blog'>) {
  return `/blog/${post.id.split('/').map(encodeURIComponent).join('/')}/`;
}

export function formatDate(date: Date, lang: string) {
  return new Intl.DateTimeFormat(lang, {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  }).format(date);
}
