# Backend

### Environment Variables

Name | Description | Default
---|---|---
TZ | Timezone for the running process | `GMT`
SERVER_HOST | Host that will be used by the server | `localhost`
SERVER_PORT | Port where the server will be listening | `3000`
INITIAL_HOURS | Number of hours where the rates will not be applied | `3`
GRACE_PERIOD_IN_HOURS | Number of hours before the `FLAT_RATE` can be re-applied | `1`
FLAT_RATE | Amount that will be applied for the `INITIAL_HOURS` | `40`
FULL_DAY_RATE | Rate for parking that exceeds 24 hours | `5000`
SMALL_RATE | Rate for small parking slot | `20`
MEDIUM_RATE | Rate for medium parking slot | `60`
LARGE_RATE | Rate for large parking slot | `100`
POSTGRES_PORT | Port where the Postgres server is running | `5444`
POSTGRES_DATABASE | Name of database where the data will be stored |
POSTGRES_USERNAME | Username for the Postgres client |
POSTGRES_PASSWORD | Password for the Postgres client |
