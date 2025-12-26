export const keys: {
    (o: object): string[];
    (o: {}): string[];
};
export function clone(obj: any): any;
export function pick(obj: any, attrs: any): any;
export function isEqual(obj1: any, obj2: any): boolean;
export const extend: {
    <T extends {}, U>(target: T, source: U): T & U;
    <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
    <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    (target: object, ...sources: any[]): any;
};
//# sourceMappingURL=utils.d.ts.map