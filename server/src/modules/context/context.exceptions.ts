export class ContextVarNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContextVarNotFound';
  }
}
