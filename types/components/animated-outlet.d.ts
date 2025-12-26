export function registerAnimation(name: any, AnimationHookClass: any, options?: {}): void;
export function setDefaultAnimation(AnimationHookClass: any, options?: {}): void;
export class AnimationHook {
    constructor(options?: {});
    options: {};
    getOption(outlet: any, name: any): any;
    hasOption(outlet: any, name: any): any;
    runParallel(outlet: any): any;
    beforeEnter(outlet: any, el: any): void;
    enter(outlet: any, el: any): void;
    leave(outlet: any, el: any, done: any): void;
}
export class GenericCSS extends AnimationHook {
}
export class AnimateCSS extends AnimationHook {
}
export class AnimatedOutlet extends HTMLElement {
    appending: T;
    removing: any;
}
//# sourceMappingURL=animated-outlet.d.ts.map