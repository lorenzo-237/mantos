import { PrismaMantis } from '@/config/prisma';
import { TagPrisma } from '@/interfaces/tags.interface';
import { Service } from 'typedi';

@Service()
export class TagService {
  public tags = PrismaMantis.tag;

  public async findAllTags(): Promise<TagPrisma[]> {
    const findTags = await this.tags.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return findTags;
  }
}
