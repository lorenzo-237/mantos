import { TagService } from '@/services/tags.service';
import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';

export class TagController {
  public tag = Container.get(TagService);

  public getTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tags = await this.tag.findAllTags();

      res.status(200).json(tags);
    } catch (error) {
      next(error);
    }
  };
}
