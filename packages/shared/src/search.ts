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
    return { name: 'جامعة بيرزيت', avatar: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22128%22%20height%3D%22128%22%20viewBox%3D%220%200%20128%20128%22%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20rx%3D%2224%22%20fill%3D%22%231d4ed8%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2268%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Segoe%20UI%2CTahoma%2CArial%2Csans-serif%22%20font-size%3D%2248%22%20font-weight%3D%22700%22%3EB%3C%2Ftext%3E%3C%2Fsvg%3E', subtitle: 'جامعة شريكة' };
  }
  const user = getUserById(post.authorId);
  return user
    ? { name: `${user.firstName} ${user.lastName}`, avatar: user.avatar, subtitle: user.role }
    : { name: 'مستخدم', avatar: '', subtitle: '' };
}
