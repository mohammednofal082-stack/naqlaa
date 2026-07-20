import type { FeedPost, User } from './types';
import {
  feedPosts,
  getJobsWithCompany,
  companies,
  users,
  getCompanyById,
  getUserById,
} from './mock/data';

export interface SearchResults {
  jobs: ReturnType<typeof getJobsWithCompany>;
  companies: typeof companies;
  people: User[];
  posts: FeedPost[];
  total: number;
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

function matches(q: string, ...parts: (string | undefined)[]) {
  if (!q) return true;
  return parts.some((p) => p && norm(p).includes(q));
}

export function globalSearch(query: string): SearchResults {
  const q = norm(query);

  const jobs = getJobsWithCompany().filter(
    (job) =>
      matches(q, job.title, job.company.name, job.company.industry, job.location, ...job.skills)
  );

  const filteredCompanies = companies.filter(
    (c) => matches(q, c.name, c.industry, c.location, c.about)
  );

  const people = users.filter(
    (u) => matches(q, u.firstName, u.lastName, u.email, u.role)
  );

  const posts = feedPosts.filter(
    (p) => matches(q, p.content, ...p.tags)
  );

  return {
    jobs,
    companies: filteredCompanies,
    people,
    posts,
    total: jobs.length + filteredCompanies.length + people.length + posts.length,
  };
}

export function getPostAuthor(post: FeedPost) {
  if (post.authorType === 'company') {
    const company = getCompanyById(post.authorId);
    return company
      ? { name: company.name, avatar: company.logo, subtitle: company.industry }
      : { name: 'شركة', avatar: '', subtitle: '' };
  }
  if (post.authorType === 'university') {
    return { name: 'جامعة بيرزيت', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BZ&backgroundColor=1d4ed8', subtitle: 'جامعة شريكة' };
  }
  const user = getUserById(post.authorId);
  return user
    ? { name: `${user.firstName} ${user.lastName}`, avatar: user.avatar, subtitle: user.role }
    : { name: 'مستخدم', avatar: '', subtitle: '' };
}
