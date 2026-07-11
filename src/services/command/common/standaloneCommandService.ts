import { CommandsRegistry, ICommandEvent, ICommandService } from '@hamsterbase/foundation/commands';

import { IInstantiationService } from '@hamsterbase/foundation/instantiation';
import { Emitter, Event } from '@hamsterbase/foundation/event';

export class StandaloneCommandService implements ICommandService {
  readonly _serviceBrand: undefined;

  private readonly _onWillExecuteCommand = new Emitter<ICommandEvent>();
  private readonly _onDidExecuteCommand = new Emitter<ICommandEvent>();
  public readonly onWillExecuteCommand: Event<ICommandEvent> = this._onWillExecuteCommand.event;
  public readonly onDidExecuteCommand: Event<ICommandEvent> = this._onDidExecuteCommand.event;

  constructor(
    @IInstantiationService
    private readonly _instantiationService: IInstantiationService
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public executeCommand<T>(id: string, ...args: any[]): Promise<T> {
    const command = CommandsRegistry.getCommand(id);
    if (!command) {
      return Promise.reject(new Error(`command '${id}' not found`));
    }

    try {
      this._onWillExecuteCommand.fire({ commandId: id, args });
      const result = this._instantiationService.invokeFunction.apply(this._instantiationService, [
        command.handler,
        ...args,
      ]) as T;

      this._onDidExecuteCommand.fire({ commandId: id, args });
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
