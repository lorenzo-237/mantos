import { App } from '@/app';
import { ValidateEnv } from '@utils/validateEnv';
import { TestRoute } from '@/routes/tests.route';
import { IssueRoute } from './routes/issues.route';
import { ProjectRoute } from './routes/projects.route';
import { ChangelogRoute } from './routes/changelogs.route';
import { AuthRoute } from './routes/auth.route';
import { UserRoute } from './routes/users.route';
import { TagRoute } from './routes/tags.route';
import { AssemblyRoute } from './routes/assembly.route';

ValidateEnv();

const app = new App([
  new AuthRoute(),
  new TestRoute(),
  new IssueRoute(),
  new ProjectRoute(),
  new ChangelogRoute(),
  new UserRoute(),
  new TagRoute(),
  new AssemblyRoute(),
]);

app.listen();
export const socketInstance = app.getSocketInstance();
