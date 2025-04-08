// @ts-nocheck
export {
  IPCServer,
  ProxyChannel,
  IPCClient,
} from "vs/base/parts/ipc/common/ipc";

export type {
  ClientConnectionEvent,
  IChannel,
  IServerChannel,
} from "vs/base/parts/ipc/common/ipc";

export {
  Protocol,
  SocketDiagnosticsEventType,
  SocketCloseEventType,
  SocketDiagnostics,
} from "vs/base/parts/ipc/common/ipc.net";

export type {
  ISocket,
  SocketCloseEvent,
} from "vs/base/parts/ipc/common/ipc.net";
