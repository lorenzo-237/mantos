import { PrismaMantis } from '@/config/prisma';
import { VersionSimple } from '@/interfaces/versions.interface';
import { Service } from 'typedi';
import { compareByTimestampDesc } from '@/utils/versions.utils';
import { NewVersionDto, UpdateVersionDto } from '@/dtos/projects.dto';
import { dateToTimestamp } from '@/utils/functions/dateToTimestamp';

@Service()
export class VersionService {
  public version = PrismaMantis.version;

  public async findAllVersions(project_id: number, obsolete: boolean | undefined): Promise<VersionSimple[]> {
    const versionsMysql = await this.version.findMany({
      where: {
        project_id,
        obsolete: obsolete,
      },
      orderBy: {
        version: 'desc',
      },
    });
    const versions = versionsMysql.map(v => ({
      description: v.description,
      id: v.id,
      name: v.version,
      released: v.released,
      obsolete: v.obsolete,
      timestamp: new Date(v.date_order * 1000),
    }));

    return versions.sort(compareByTimestampDesc);
  }

  public async createVersion(mantisToken: string, project_id: number, dto: NewVersionDto) {
    const findVersion = await this.version.findFirst({
      where: {
        project_id,
        version: dto.name,
      },
    });

    if (findVersion) {
      return findVersion;
    }

    const timestampCreated = dateToTimestamp(new Date());

    const version = await this.version.create({
      data: {
        project_id,
        description: dto.description,
        obsolete: false,
        released: false,
        date_order: timestampCreated,
        version: dto.name,
      },
    });

    return version;
  }

  public async updateVersion(project_id: number, version_id: number, dto: UpdateVersionDto) {
    const version = await this.version.update({
      where: {
        id: version_id,
        project_id,
      },
      data: {
        obsolete: dto.obsolete !== undefined ? dto.obsolete : undefined,
        released: dto.released !== undefined ? dto.released : undefined,
        date_order: dto.timestamp !== undefined ? dto.timestamp : undefined,
      },
    });

    return version;
  }
}
