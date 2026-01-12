import { NewAssemblyInfoDto } from '@/dtos/assembly_info.dto';
import { HttpException } from '@/exceptions/httpException';
import { AssemblyService } from '@/services/assembly_info.service';
import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';

export class GetAssemblyParams {
  project_id: string;
  version: string;
}

export class AssemblyController {
  public assemblyInfo = Container.get(AssemblyService);

  public getAssemblyInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { project_id, version } = req.query as unknown as GetAssemblyParams;

      if (!project_id) {
        throw new HttpException(400, 'You must set <project_id>');
      }

      if (!version) {
        throw new HttpException(400, 'You must set <version>');
      }

      const rows = await this.assemblyInfo.findAssembly(+project_id, version);

      res.status(200).json(rows);
    } catch (error) {
      next(error);
    }
  };

  public getVersionsAvailable = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { project_id } = req.query as unknown as GetAssemblyParams;

      if (!project_id) {
        throw new HttpException(400, 'You must set <project_id>');
      }

      const rows = await this.assemblyInfo.findAllVersionsAvailable(+project_id);

      res.status(200).json(rows);
    } catch (error) {
      next(error);
    }
  };

  public createAssembly = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as unknown as NewAssemblyInfoDto;

      const result = await this.assemblyInfo.createAssemblyInfo(dto);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
