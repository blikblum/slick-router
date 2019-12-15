module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: [
            'ie 11'
          ]
        },
        modules: false
      }
    ]
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: [
                'ie 11'
              ]
            }
          }
        ]
      ]
    }
  }
}
