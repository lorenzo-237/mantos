import { IssueAPI, IssueSimple, IssuePrisma } from '@/interfaces/issues.interface';
import { IssueMantis } from '@/interfaces/mantis.interface';

export function formatIssue(issue: IssueMantis): IssueAPI {
  return {
    description: issue.description,
    category: issue.category ? issue.category.name : 'no category',
    version: issue.version ? issue.version.name : 'no version',
    target_version: issue.target_version ? issue.target_version.name : 'no target version',
    fixed_in_version: issue.fixed_in_version ? issue.fixed_in_version.name : 'not fixed',
    id: issue.id,
    status: {
      color: issue.status.color,
      label: issue.status.label,
      name: issue.status.name,
    },
    project: issue.project.name,
    summary: issue.summary,
    tags: issue.tags ? issue.tags.map(tag => tag.name) : [],
    files: issue.attachments
      ? issue.attachments.map(attachment => ({
          filename: attachment.filename,
          content_type: attachment.content_type,
          id: attachment.id,
          size: attachment.size,
        }))
      : [],
  };
}

// formater l'issue depuis le schema prisma, celui du modèle Mantis vers un objet plus concis
export function formatIssueMysql(issue: IssuePrisma): IssueSimple {
  return {
    id: issue.id,
    version: issue.version,
    target_version: issue.target_version,
    fixed_in_version: issue.fixed_in_version,
    last_updated: new Date(issue.last_updated * 1000),
    status: {
      id: issue.status,
      name: translateStatusMysql(issue.status, 'fr'),
    },
    category: {
      id: issue.category.id,
      name: issue.category.name,
    },
    summary: issue.summary,
    resolution: {
      id: issue.resolution,
      name: translateResolutionMysql(issue.resolution),
    },
    priority: {
      id: issue.priority,
      name: translatePriority(issue.priority),
    },
    reproductibility: {
      id: issue.reproducibility,
      name: translateReproductibility(issue.reproducibility),
    },
    severity: {
      id: issue.severity,
      name: translateSeverity(issue.severity),
    },
    handler: issue.handler,
    reporter: issue.reporter,
    bug_text: issue.bugText,
    tags: issue.tags.map(t => t.tag),
    source_relations: issue.source_relations,
    destination_relations: issue.destination_relations,
  };
}

function translateStatusMysql(status: number, language: 'en' | 'fr') {
  switch (status) {
    case 80:
      return language === 'fr' ? 'résolu' : 'resolved';
    case 60:
      return language === 'fr' ? 'traité' : 'dealed'; // vrai valeur = 'waiting_customer_validation'
    case 50:
      return language === 'fr' ? 'assigné' : 'assigned';
    case 55:
      return language === 'fr' ? 'planifié' : 'planned';
    case 90:
      return language === 'fr' ? 'fermé' : 'closed';
    case 20:
      return language === 'fr' ? 'commentaire' : 'commentaire';
    case 10:
      return language === 'fr' ? 'nouveau' : 'new';
    default:
      return language === 'fr' ? 'inconnu' : 'unknown'; // valeur = 50
  }
}

function translateResolutionMysql(resolution: number) {
  switch (resolution) {
    case 10:
      return 'open';
    case 20:
      return 'fixed';
    case 30:
      return 'reopened';
    case 40:
      return 'unable_to_reproduce';
    case 50:
      return 'not_fixable';
    case 60:
      return 'duplicate';
    case 70:
      return 'not_a_bug';
    case 80:
      return 'suspended';
    case 90:
      return 'wont_fix';
    default:
      return 'unknown';
  }
}

function translatePriority(prio: number) {
  switch (prio) {
    case 10:
      return 'none';
    case 20:
      return 'low';
    case 30:
      return 'normal';
    case 40:
      return 'high';
    case 50:
      return 'urgent';
    case 60:
      return 'immediate';
    default:
      return 'unknown';
  }
}

function translateReproductibility(reproducibility: number) {
  switch (reproducibility) {
    case 10:
      return 'always';
    case 30:
      return 'sometimes';
    case 50:
      return 'random';
    case 70:
      return 'not tried';
    case 90:
      return 'impossible';
    case 100:
      return 'not applicable';
    default:
      return 'unknown';
  }
}

function translateSeverity(severity: number) {
  switch (severity) {
    case 10:
      return 'feature';
    case 20:
      return 'trivial';
    case 30:
      return 'text';
    case 40:
      return 'tweak';
    case 50:
      return 'minor';
    case 60:
      return 'major';
    case 70:
      return 'crash';
    case 80:
      return 'block';
    default:
      return 'unknown';
  }
}

export function compareByCategoryAndLastUpdatedAsc(a: IssueSimple, b: IssueSimple) {
  // Comparaison des catégories
  if (a.category < b.category) {
    return -1;
  }
  if (a.category > b.category) {
    return 1;
  }

  // Si les catégories sont égales, on compare par last updated
  if (a.last_updated < b.last_updated) {
    return 1;
  }
  if (a.last_updated > b.last_updated) {
    return -1;
  }

  // Si les last updated sont égaux, les éléments sont considérés comme égaux
  return 0;
}
