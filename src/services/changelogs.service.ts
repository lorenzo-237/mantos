import { Service } from 'typedi';
import { Container } from 'typedi';
import { IssuesService } from '@/services/issues.service';
import { tags } from '@/constants';
import { MANTIS_URL } from '@/config';
import { IssueSimple } from '@/interfaces/issues.interface';
import { IssuesQueries } from '@/queries/issues.query';
import { ProjectsService } from './projects.service';

@Service()
export class ChangelogService {
  public issues = Container.get(IssuesService);
  public project = Container.get(ProjectsService);

  public async generateChangelogMd(queries: IssuesQueries) {
    const issues = await this.issues.findAllIssues(queries);

    const data: Record<string, IssueSimple[]> = {};

    issues.forEach(issue => {
      if (!data[issue.category.name]) {
        data[issue.category.name] = [];
      }
      data[issue.category.name].push(issue);
    });

    let markdown = '';

    for (const category in data) {
      markdown += `\n## ${category}\n\n`;
      data[category].forEach(issue => {
        const tag = this.getTag(issue.summary);
        const summary = this.getSummaryWithoutTag(issue.summary);
        const sentence = `- ${tag}(${MANTIS_URL}/view.php?id=${issue.id}) ${summary}`;
        markdown += sentence + '\n';
      });
    }

    return { markdown, categories: data };
  }

  public async generateChangelogHtml(queries: IssuesQueries) {
    const issues = await this.issues.findAllIssues(queries);

    const data: Record<string, IssueSimple[]> = {};

    issues.forEach(issue => {
      if (!data[issue.category.name]) {
        data[issue.category.name] = [];
      }
      data[issue.category.name].push(issue);
    });

    let html = '';

    for (const category in data) {
      html += `<h2>${category}</h2><ul>`;
      data[category].forEach(issue => {
        const tag = this.getTag(issue.summary);
        const summary = this.getSummaryWithoutTag(issue.summary);
        const sentence = `<li><a href="${MANTIS_URL}/view.php?id=${issue.id}">${tag}</a> ${summary}</li>`;
        html += sentence;
      });
      html += '</ul>';
    }

    return { html, categories: data };
  }

  private getTag(resume: string) {
    for (const tag of tags) {
      if (resume.startsWith(tag)) {
        return `${tag.toUpperCase()}`;
      }
    }
    return `[MANTIS]`;
  }

  private getSummaryWithoutTag(str: string): string {
    tags.forEach(tag => {
      str = str.replace(tag, '');
    });
    return str.trim();
  }
}
