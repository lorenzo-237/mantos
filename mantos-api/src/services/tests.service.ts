import { Service } from 'typedi';

@Service()
export class TestService {
  public helloWorld() {
    return 'Hello World!';
  }
}
