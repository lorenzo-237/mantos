export class UserSocketIoWindev {
  public username: string;
  public fullname: string;
}

export class UpdateIssueSocket {
  public User: UserSocketIoWindev;
  public issueId: number | null;
  public target_version: string | null;
  public status: string | null;
  public fixed_in_version: string | null;
}

export class AddVersionSocket {
  public User: UserSocketIoWindev;
  public name: string;
}
export class UpdateVuesSocket {
  public User: UserSocketIoWindev;
  public issuesIds: number[];
}
