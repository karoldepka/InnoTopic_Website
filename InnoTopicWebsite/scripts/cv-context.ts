/**
 * Renders the CV page's data as Markdown for the CV chat's system prompt. Bundled and run by
 * generate-cv-context.mjs, which writes the result to api/_cv-context.ts.
 */
import { personalDataItems } from '../src/app/cv-page/personal-data/personal-data.data';
import { LanguageExperiences } from '../src/app/skills/language-experience-data';
import { highlights } from '../src/app/skills/work-experience-highlights-data';
import { workExperience } from '../src/app/skills/work-experience-data';
import { WorkOrganisationsAndProjectsData, Organisation } from '../src/app/work-projects/work-projects-data';
import { booksData } from '../src/app/books/books.data';

/** "#Amazon_Bedrock" (a topic tag on the CV page) → "Amazon Bedrock". */
function plainText(text: string): string {
  return text.replace(/#([\w.+-]+)/g, (_, tag: string) => tag.replace(/_/g, ' ')).trim();
}

function list(items: string[]): string {
  return items.join(', ');
}

function workHistory(): string[] {
  const lines: string[] = [];
  for (const [name, org] of Object.entries(WorkOrganisationsAndProjectsData.instance) as [string, Organisation][]) {
    lines.push(`### ${name} (${org.time.join(' – ')})`);
    if (org.locations) lines.push(`Locations: ${org.locations}`);
    if (org.description) lines.push(plainText(org.description));
    for (const [projectName, project] of Object.entries(org.projects)) {
      lines.push('', `#### Project: ${projectName}`);
      if (project.roles) lines.push(`Roles: ${plainText(project.roles)}`);
      if (project.description) lines.push(plainText(project.description));
      const technologies = Object.keys(project.topicsById ?? {});
      if (technologies.length) lines.push(`Technologies: ${list(technologies)}`);
    }
    lines.push('');
  }
  return lines;
}

function skillLevels(): string[] {
  const lines: string[] = [];
  for (const group of Object.values(workExperience)) {
    lines.push(`### ${group.title} (${group.comment})`);
    for (const [topic, value] of Object.entries(group.topics as Record<string, { skillLevels?: { have?: string; want?: string } }>)) {
      const { have, want } = value.skillLevels ?? {};
      const level = [have && `has ${have}`, want && want !== have && `aiming for ${want}`].filter(Boolean).join(', ');
      lines.push(`- ${topic}${level ? `: ${level.replace(/_/g, ' ')}` : ''}`);
    }
    lines.push('');
  }
  return lines;
}

export function cvContext(): string {
  return [
    '# Karol Depka Pradzinski – CV',
    '',
    '## Personal data',
    ...personalDataItems.map(item => `- ${item.label}: ${item.value}`),
    '',
    '## Spoken languages',
    ...LanguageExperiences.map(language => `- ${language.name}: ${language.details.level}`),
    '',
    '## Highlighted technologies',
    // e.g. "personalInterests" → "personal interests"
    ...Object.entries(highlights).map(([group, { ids }]) => `- ${group.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${list(ids)}`),
    '',
    '## Skill levels',
    ...skillLevels(),
    '## Work history (most recent first)',
    ...workHistory(),
    '## Books read',
    ...booksData.map(book => `- ${book.id}${book.authors ? ` (${book.authors})` : ''}`),
    '',
  ].join('\n');
}
