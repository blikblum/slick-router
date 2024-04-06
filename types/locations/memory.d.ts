export default MemoryLocation;
declare class MemoryLocation {
    constructor({ path }: {
        path: any;
    });
    path: any;
    getURL(): any;
    setURL(path: any, options: any): void;
    replaceURL(path: any, options: any): void;
    onChange(callback: any): void;
    changeCallback: any;
    handleURL(url: any, options?: {}): void;
    removeRoot(url: any): any;
    formatURL(url: any): any;
}
//# sourceMappingURL=memory.d.ts.map