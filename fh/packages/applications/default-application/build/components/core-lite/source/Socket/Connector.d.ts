declare class Connector {
    private applicationLock;
    private formsManager;
    private util;
    private i18n;
    private target;
    private reconnectCallback;
    private openCallback;
    private runningCommands;
    private ws;
    private reconnecting;
    private doNotReconnect;
    private retryCount;
    private reconnectTimeoutMs;
    private reconnectDecisionDialogMs;
    private reconnectStartTime;
    private serverAlive;
    private headResponseRetry;
    private maxHeadResponseRetry;
    private runFunction;
    private pingInterval;
    private _incomingMessageCallback;
    private _outcomingMessageCallback;
    constructor(target: string, reconnectCallback: () => void, openCallback: () => void);
    incomingMessageCallback: (data: string) => void;
    outcomingMessageCallback: (data: string) => void;
    connect(runFunction: any): void;
    connectExternal(runFunction: any, socketUrl: string): void;
    run(command: any, jsonData: any, callback?: any): string;
    close(): void;
    getSubsystemMetadata(callback: any): string;
    startUseCase(useCaseId: any, callback: any, ignored: any): string;
    reconnectReset(): void;
    reconnectTry(): void;
    onOpen(event: any): void;
    onClose(event?: any): void;
    closeDialog(): void;
    onMessage(event: any): void;
    isOpen(): boolean;
}
export { Connector };