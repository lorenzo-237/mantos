import { PrismaBlaster } from '@/config/prisma';
import { NewAssemblyInfoDto } from '@/dtos/assembly_info.dto';
import { Service } from 'typedi';

@Service()
export class AssemblyService {
  public assemblyInfo = PrismaBlaster.assemblyInfo;
  public projectVersion = PrismaBlaster.projectVersion;

  public async findAllVersionsAvailable(project_id: number) {
    const rows = await this.projectVersion.findMany({
      select: {
        version: true,
      },
      where: {
        mantisProjectId: project_id,
      },
      orderBy: {
        version: 'desc',
      },
    });

    return rows.map(row => row.version);
  }

  public async findAssembly(project_id: number, version: string) {
    const items = await this.assemblyInfo.findMany({
      where: {
        projectVersion: {
          mantisProjectId: project_id,
          version: version,
        },
      },
      orderBy: [
        {
          extension: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });

    return items;
  }

  public async createAssemblyInfo(dto: NewAssemblyInfoDto) {
    const projectVersion = await this.projectVersion.upsert({
      create: {
        mantisProjectId: dto.project.id,
        version: dto.project.version,
        obsolete: false,
      },
      update: {
        obsolete: false,
      },
      where: {
        mantisProjectId_version: {
          mantisProjectId: dto.project.id,
          version: dto.project.version,
        },
      },
    });

    const result = await this.assemblyInfo.createMany({
      data: dto.assemblies.map(assembly => ({
        projectVersionId: projectVersion.id,
        extension: assembly.extension,
        checksum: assembly.checksum,
        fdate: new Date(assembly.date),
        path: assembly.path,
        name: assembly.name,
        version: assembly.version,
      })),
      skipDuplicates: true,
    });

    return result;
  }
}
