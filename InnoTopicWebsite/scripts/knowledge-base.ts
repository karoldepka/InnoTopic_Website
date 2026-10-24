/**
 * The work history (one document per organisation, with its projects) and skill levels as Markdown
 * documents for an Amazon Bedrock knowledge base, each with a metadata sidecar that queries can
 * filter on. Bundled and run by generate-knowledge-base.mjs.
 */
import { workExperience } from '../src/app/skills/work-experience-data';
import { Organisation, WorkOrganisationsAndProjectsData } from '../src/app/work-projects/work-projects-data';
import { plainText } from './cv-context';

export interface KnowledgeBaseDocument {
  /** File name, e.g. "work-history/rithum.md". */
  path: string;
  markdown: string;
  /** Bedrock's metadata sidecar attributes (strings, numbers or booleans). */
  metadata: Record<string, string | number | boolean>;
}

const PERSON = 'Karol Depka Pradzinski';

const slug = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** The year an organisation's time range starts or ends ("September 2023" → 2023). */
const year = (time: number | string | undefined) => Number(String(time ?? '').match(/\d{4}/)?.[0] ?? 0);

function organisationDocument(name: string, org: Organisation, order: number): KnowledgeBaseDocument {
  const period = org.time.join(' – ');
  const lines = [
    `# ${name} (${period})`,
    '',
    `Part of ${PERSON}'s work history: his work with ${name}.`,
    '',
    `- Period: ${period}`,
  ];
  if (org.locations) lines.push(`- Locations: ${org.locations}`);
  if (org.description) lines.push('', plainText(org.description));
  for (const [projectName, project] of Object.entries(org.projects)) {
    lines.push('', `## Project: ${plainText(projectName)}`);
    if (project.roles) lines.push('', `Roles: ${plainText(project.roles)}`);
    if (project.description) lines.push('', plainText(project.description));
    const technologies = Object.keys(project.topicsById ?? {});
    if (technologies.length) lines.push('', `Technologies: ${technologies.join(', ')}`);
  }
  return {
    path: `work-history/${String(order).padStart(2, '0')}-${slug(name)}.md`,
    markdown: lines.join('\n') + '\n',
    metadata: {
      person: PERSON,
      type: 'work-history',
      organisation: name,
      startYear: year(org.time[0]),
      endYear: year(org.time[org.time.length - 1]),
      projects: Object.keys(org.projects).length,
    },
  };
}

function skillsDocument(): KnowledgeBaseDocument {
  const lines = [`# ${PERSON} – skill levels`, '', `${PERSON}'s technology skills: the level he has, and the level he aims for.`];
  for (const group of Object.values(workExperience)) {
    lines.push('', `## ${group.title}`, '', `(${group.comment})`, '');
    for (const [topic, value] of Object.entries(group.topics as Record<string, { skillLevels?: { have?: string; want?: string } }>)) {
      const { have, want } = value.skillLevels ?? {};
      const level = [have && `has ${have}`, want && want !== have && `aiming for ${want}`].filter(Boolean).join(', ');
      lines.push(`- ${topic}${level ? `: ${level.replace(/_/g, ' ')}` : ''}`);
    }
  }
  return {
    path: 'work-experience/skill-levels.md',
    markdown: lines.join('\n') + '\n',
    metadata: { person: PERSON, type: 'work-experience' },
  };
}

export function knowledgeBaseDocuments(): KnowledgeBaseDocument[] {
  // Most recent first, as on the CV page.
  const organisations = Object.entries(WorkOrganisationsAndProjectsData.instance) as [string, Organisation][];
  return [...organisations.map(([name, org], i) => organisationDocument(name, org, i + 1)), skillsDocument()];
}

/** The same work history as structured data, for tools that filter it (by technology, year, ...). */
export function workHistoryData() {
  const organisations = Object.entries(WorkOrganisationsAndProjectsData.instance) as [string, Organisation][];
  return {
    person: PERSON,
    organisations: organisations.map(([name, org]) => ({
      name,
      period: org.time.join(' – '),
      startYear: year(org.time[0]),
      // A period of one year ("2017") gives no end: open-ended for filtering.
      endYear: org.time.length > 1 ? year(org.time[org.time.length - 1]) : null,
      locations: org.locations ?? null,
      description: org.description ? plainText(org.description) : null,
      projects: Object.entries(org.projects).map(([projectName, project]) => ({
        name: plainText(projectName),
        roles: project.roles ? plainText(project.roles) : null,
        description: project.description ? plainText(project.description) : null,
        technologies: Object.keys(project.topicsById ?? {}),
      })),
    })),
    skills: Object.values(workExperience).map(group => ({
      group: group.title,
      comment: group.comment,
      topics: Object.entries(group.topics as Record<string, { skillLevels?: { have?: string; want?: string } }>)
        .map(([topic, value]) => ({ topic, have: value.skillLevels?.have ?? null, want: value.skillLevels?.want ?? null })),
    })),
  };
}
