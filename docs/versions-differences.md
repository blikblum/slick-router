## Differences between slick-router (v1) and cherrytree

* API changes:
  * Published package as cherrytreex (and later as slick-router)
  * Export router constructor instead of factory function
  * Add possibility to register middleware with a object containing next/done/error hooks
  * Drop ability to customize Promise implementation. To run in browsers without native Promise is necessary a polyfill
  * Do not use active state to generate links
* Infrastructure changes  
  * Update build system simplifying it and producing smaller bundle
  * Incorporated location-bar dependency removing shared code
  * Upgraded dev dependencies
