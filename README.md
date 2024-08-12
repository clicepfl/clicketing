# Clicketing

## Developpment

### Initial setup

Two tools are required:

- [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [`docker`](https://docs.docker.com/get-docker/)

Install the git hooks to enforce code formatting and commit names:

```sh
npm i -D
npx husky
```

### Run the stack locally

First, get the directus token and put it in a `.env` file at the root of the repository (see [`.env.example`](.env.example)). Then boot up the full service stack locally, using the `docker compose up` command, from the root of the project. You will be able to access:

- The webapp on [localhost:3000](http://localhost:3000)
- The database view on [localhost:5555](http://localhost:5555)

The admin password is `1234`.

### Configuration

The configuration is done through environment variables:

- `JWT_SECRET`: private key used to sign sessions. Required.
- `ADMIN_TOKEN`: Admin panel password. Required.
- `DIRECTUS_TOKEN`: Token to access the directus instance. Required.
- `SESSION_LIFE`: The duration of a session, in milliseconds. Defaults to 1 day.
- `MAIL_USER`: Username used for authentication
- `MAIL_PASSWORD`: Password used for authentication
- `MAIL_HOST`: Domain of the mail server
- `MAIL_PORT`: Port to connect to on the mail server
- `MAIL_FROM`: Mail address to display as sender
