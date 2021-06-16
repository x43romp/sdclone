module.exports = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  bracketSpacing: true,
  printWidth: 120,
  overrides: [
    {
      files: '*.js',
      options: {
        tabWidth: 2,
        semicolons: true,
      },
    },
    {
      files: '*.ts',
      options: {
        tabWidth: 4,
        semicolons: false,
      },
    },
  ],
}
