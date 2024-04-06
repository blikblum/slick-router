export default BrowserLocation;
declare class BrowserLocation {
    constructor(options?: {});
    path: any;
    options: {
        pushState: boolean;
        root: string;
    };
    locationBar: LocationBar;
    /**
     * Get the current URL
     */
    getURL(): any;
    /**
     * Set the current URL without triggering any events
     * back to the router. Add a new entry in browser's history.
     */
    setURL(path: any, options?: {}): void;
    /**
     * Set the current URL without triggering any events
     * back to the router. Replace the latest entry in broser's history.
     */
    replaceURL(path: any, options?: {}): void;
    /**
     * Setup a URL change handler
     * @param  {Function} callback
     */
    onChange(callback: Function): void;
    changeCallback: Function;
    /**
     * Given a path, generate a URL appending root
     * if pushState is used and # if hash state is used
     */
    formatURL(path: any): string;
    /**
     * When we use pushState with a custom root option,
     * we need to take care of removingRoot at certain points.
     * Specifically
     * - browserLocation.update() can be called with the full URL by router
     * - LocationBar expects all .update() calls to be called without root
     * - this method is public so that we could dispatch URLs without root in router
     */
    removeRoot(url: any): any;
    /**
     * Stop listening to URL changes and link clicks
     */
    destroy(): void;
    /**
      initially, the changeCallback won't be defined yet, but that's good
      because we dont' want to kick off routing right away, the router
      does that later by manually calling this handleURL method with the
      url it reads of the location. But it's important this is called
      first by Backbone, because we wanna set a correct this.path value
  
      @private
     */
    private handleURL;
}
import LocationBar from './location-bar.js';
//# sourceMappingURL=browser.d.ts.map