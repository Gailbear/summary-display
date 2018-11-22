# PAX Tabletop Library Data Display

To be used for the 10 ft display at TTHQ.

## Development

1. Install node (https://nodejs.org/en/) version 10.X is fine.
2. Install yarn (https://yarnpkg.com/en/docs/install)
3. cd to this directory
4. `yarn install`
5. `yarn start`
6. open a browser
7. navigate to `http://localhost:3001`

### Configuration

In order to run against the library (as opposed to the test data), open `config.js`, and change `use_test_data` to `false`. Set the path for the stats api call in `library_endpoint`.

### Packaging

1. `yarn scss`
2. `pkg .`
