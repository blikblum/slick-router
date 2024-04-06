export default History;
declare class History {
    handlers: any[];
    checkUrl(): boolean;
    location: Location;
    history: globalThis.History;
    atRoot(): boolean;
    getHash(): string;
    getFragment(fragment: any, forcePushState: any): any;
    start(options?: {}): boolean;
    started: boolean;
    options: {
        root: string;
    };
    root: any;
    _wantsHashChange: boolean;
    _wantsPushState: boolean;
    _hasPushState: boolean;
    fragment: any;
    stop(): void;
    route(route: any, callback: any): void;
    loadUrl(fragment: any): boolean;
    update(fragment: any, options: any): boolean | void;
    _updateHash(location: any, fragment: any, replace: any): void;
    onChange(callback: any): void;
    hasPushState(): boolean;
}
//# sourceMappingURL=location-bar.d.ts.map