export default MemoryLocation;
declare class MemoryLocation {
    path: string;
    getURL(): string;
    setURL(path: any, options: any): void;
    replaceURL(path: any, options: any): void;
    onChange(callback: any): void;
    callback: any;
    handleURL(url: any, options: any): void;
    removeRoot(url: any): any;
    formatURL(url: any): any;
    start(path: any): void;
}
//# sourceMappingURL=memory.d.ts.map