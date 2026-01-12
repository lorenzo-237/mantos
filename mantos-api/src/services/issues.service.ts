import { PrismaMantis } from '@/config/prisma';
import { AttachNoteDto, AttachTagsDto, CreateIssueDto, FixIssueDto, UpdateIssueDto } from '@/dtos/issues.dto';
import { FileMantis, IssueMantis } from '@/interfaces/mantis.interface';
import { UserRequest } from '@/interfaces/users.interface';
import { mantisGET, mantisPATCH, mantisPOST, mantisPOST_Bis } from '@/mantis/mantis.request';
import { IssueFilesParams } from '@/params/issues.param';
import { IssuesQueries } from '@/queries/issues.query';
import { dateToTimestamp } from '@/utils/functions/dateToTimestamp';
import { compareByCategoryAndLastUpdatedAsc, formatIssue, formatIssueMysql } from '@/utils/issues.utils';
import { logger } from '@/utils/logger';
import { Service } from 'typedi';

@Service()
export class IssuesService {
  public issue = PrismaMantis.issue;
  public bug_text = PrismaMantis.bugText;
  public relationship = PrismaMantis.bugRelationShip;
  public bugnote_text = PrismaMantis.bugNoteTextTable;

  public async findIssue(issue_id: number) {
    const data = await this.issue.findUnique({
      where: {
        id: issue_id,
      },
      include: {
        source_relations: {
          select: {
            id: true,
            relationship_type: true,
            destination: {
              select: {
                id: true,
                summary: true,
                status: true,
              },
            },
          },
        },
        dest_relations: {
          select: {
            id: true,
            relationship_type: true,
            source: {
              select: {
                id: true,
                summary: true,
                status: true,
              },
            },
          },
        },
        category: true,
        bugText: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        handler: {
          select: {
            id: true,
            email: true,
            username: true,
            realname: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            username: true,
            realname: true,
          },
        },
      },
    });
    return formatIssueMysql(data);
  }

  public async findAllIssues(queries: IssuesQueries) {
    if (!queries.page) queries.page = 1;
    if (!queries.page_size) queries.page_size = 50;

    const { project_id, fixed_in_version, target_version, status, version, category_id, issue_id, summary } = queries;

    const issues = await this.issue.findMany({
      where: {
        project_id,
        fixed_in_version: fixed_in_version ? fixed_in_version : undefined,
        target_version: target_version ? target_version : undefined,
        status: status ? +status : undefined,
        version: version ? version : undefined,
        category_id: category_id ? category_id : undefined,
        id: issue_id ? issue_id : undefined,
        summary: summary
          ? {
              contains: summary,
            }
          : undefined,
      },
      include: {
        category: true,
        bugText: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        handler: {
          select: {
            id: true,
            email: true,
            username: true,
            realname: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            username: true,
            realname: true,
          },
        },
      },
    });

    const issuesMysql = issues.map(issue => formatIssueMysql(issue));
    return issuesMysql.sort(compareByCategoryAndLastUpdatedAsc);
  }

  public async findIssueFiles(mantisToken: string, params: IssueFilesParams) {
    const url = `/issues/${params.issue_id}/files/${params.file_id}`;
    const data = await mantisGET<{ files: FileMantis[] }>(url, mantisToken);

    return data;
  }

  public mapNotes(reporterName: string, notes?: string[]) {
    if (!notes) {
      return undefined;
    }
    if (notes.length <= 0) {
      return undefined;
    }
    return notes.map(note => ({
      reporter: {
        name: reporterName,
      },
      text: note,
      view_state: {
        name: 'public',
      },
      type: 'note',
    }));
  }

  public async fixIssue(mantisToken: string, issue_id: number, reporterName: string, dto: FixIssueDto) {
    const url = `/issues/${issue_id}`;

    const noteMantis = this.mapNotes(reporterName, dto.notes);

    const payload = {
      fixed_in_version: {
        name: dto.fixed_in_version.name,
      },
      status: {
        name: 'resolved',
      },
      resolution: {
        name: 'fixed',
      },
      notes: noteMantis,
    };

    const data = await mantisPATCH<{ issues: IssueMantis[] }>(url, payload, mantisToken);

    const issues = data.issues.map(issue => formatIssue(issue));

    if (issues.length <= 0) return null;

    return issues[0];
  }

  public async updateMinimal(mantisToken: string, issue_id: number, reporterName: string, dto: UpdateIssueDto) {
    const url = `/issues/${issue_id}`;

    const noteMantis = this.mapNotes(reporterName, dto.notes);

    const payload = {
      target_version: dto.target_version
        ? {
            name: dto.target_version.name,
          }
        : undefined,
      status: dto.status
        ? {
            id: dto.status.id,
          }
        : undefined,
      resolution: dto.status
        ? {
            name: 'open',
          }
        : undefined,
      notes: noteMantis,
    };

    const data = await mantisPATCH<{ issues: IssueMantis[] }>(url, payload, mantisToken);

    const issues = data.issues.map(issue => formatIssue(issue));

    if (issues.length <= 0) return null;

    return issues[0];
  }

  public async attachTags(mantisToken: string, issue_id: number, dto: AttachTagsDto) {
    const url = `/issues/${issue_id}/tags`;

    const data = await mantisPOST<{ issues: IssueMantis[] }>(url, dto, mantisToken);

    const issues = data.issues.map(issue => formatIssue(issue));

    if (issues.length <= 0) return null;

    return issues[0];
  }

  public async createIssue(user: UserRequest, dto: CreateIssueDto) {
    const timestampSubmit = dateToTimestamp(new Date());

    const bug_text = await this.bug_text.create({
      include: {
        issue: true,
      },
      data: {
        description: dto.description,
        additional_information: dto.additional_information ? dto.additional_information : '',
        steps_to_reproduce: dto.steps ? dto.steps : '',
        issue: {
          create: {
            project_id: dto.project_id,
            reporter_id: user.mantis.user.id,
            handler_id: dto.handler_id ? dto.handler_id : 0,
            duplicate_id: 0,
            priority: dto.priority_id,
            severity: dto.severity_id,
            status: dto.status_id,
            resolution: dto.version.fixed ? 20 : 10,
            projection: 10,
            eta: 10,
            reproducibility: dto.reproducibility_id,
            category_id: dto.category_id,
            date_submitted: timestampSubmit,
            last_updated: timestampSubmit,
            os: '',
            os_build: '',
            platform: 'PC',
            version: dto.version.current ? dto.version.current : '',
            fixed_in_version: dto.version.fixed ? dto.version.fixed : '',
            build: '',
            view_state: 10, // public
            summary: dto.summary,
            sponsorship_total: 0,
            sticky: 0,
            target_version: dto.version.target,
            due_date: 1,
            sequence: 0,
            profile_id: 0,
            tags: dto.tags
              ? {
                  create: dto.tags.map(tag => ({
                    date_attached: timestampSubmit,
                    user_id: user.mantis.user.id,
                    tag_id: tag.id,
                  })),
                }
              : undefined,
          },
        },
      },
    });

    if (dto.relations) {
      await this.relationship.createMany({
        data: dto.relations
          .filter(r => r.is_source) // ne prendre que celle marquée comme source
          .map(r => ({
            source_bug_id: r.issue_id,
            destination_bug_id: bug_text.issue.id,
            relationship_type: r.relationship_type,
          })),
      });

      await this.relationship.createMany({
        data: dto.relations
          .filter(r => !r.is_source) // prendre les destinations
          .map(r => ({
            source_bug_id: bug_text.issue.id,
            destination_bug_id: r.issue_id, // ici on inverse les deux id
            relationship_type: r.relationship_type,
          })),
      });
    }

    try {
      if (dto.files && dto.files.length > 0) {
        const url = `/issues/${bug_text.issue.id}/files`;
        await mantisPOST_Bis(
          url,
          {
            files: dto.files,
          },
          user.token,
        );
      }
    } catch (error) {
      logger.error('erreur ajout des fichiers au ticket mantis');
      logger.error(error);
    }

    return await this.findIssue(bug_text.issue.id);
  }

  public async attachNotes(user: UserRequest, issue_id: number, dto: AttachNoteDto) {
    const timestampCreated = dateToTimestamp(new Date());

    const createdNotes = await Promise.all(
      dto.notes.map(note =>
        this.bugnote_text.create({
          data: {
            note: note,
            bug_notes: {
              create: {
                bug_id: issue_id,
                reporter_id: user.mantis.user.id,
                view_state: 10,
                note_type: 0,
                note_attr: '',
                time_tracking: 0,
                last_modified: timestampCreated,
                date_submitted: timestampCreated,
              },
            },
          },
        }),
      ),
    );

    // update la date de modification
    await this.issue.update({
      data: {
        last_updated: timestampCreated,
      },
      where: {
        id: issue_id,
      },
    });

    // en soit j'ai remarqué qu'il manque aussi la gestion de l'historique du ticket mais je ne vais pas la faire de suite

    return createdNotes;
  }
}
