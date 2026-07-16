import mongoose from 'mongoose';

export type DatabaseConnectionState = 'connected' | 'connecting' | 'disconnected' | 'disconnecting';

export const getDatabaseConnectionState = (): DatabaseConnectionState => {
  switch (mongoose.connection.readyState) {
    case mongoose.STATES.disconnected:
      return 'disconnected';
    case mongoose.STATES.connected:
      return 'connected';
    case mongoose.STATES.connecting:
      return 'connecting';
    case mongoose.STATES.disconnecting:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
};

export const isDatabaseConnected = (): boolean => {
  return getDatabaseConnectionState() === 'connected';
};

export const isDatabaseConnecting = (): boolean => {
  return getDatabaseConnectionState() === 'connecting';
};

export const isDatabaseDisconnected = (): boolean => {
  return getDatabaseConnectionState() === 'disconnected';
};
