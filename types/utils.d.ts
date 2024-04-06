export const keys: {
    (o: object): string[];
    (o: {}): string[];
};
export function clone(obj: any): any;
export function pick(obj: any, attrs: any): any;
export function isEqual(obj1: any, obj2: any): boolean;
export const extend: {
    <T extends {}, U>(target: T, source: U): T & U;
    <T_1 extends {}, U_1, V>(target: T_1, source1: U_1, source2: V): T_1 & U_1 & V;
    <T_2 extends {}, U_2, V_1, W>(target: T_2, source1: U_2, source2: V_1, source3: W): T_2 & U_2 & V_1 & W;
    (target: object, ...sources: any[]): any;
};
//# sourceMappingURL=utils.d.ts.map