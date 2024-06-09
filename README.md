# Clicketing

## Developpment

### Initial setup

Two tools are required:

- [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [`docker`](https://docs.docker.com/get-docker/)

Install the git hooks to enforce code formatting and commit names:

```sh
npm i -D
npm run prepare
```

### Run the stack locally

To boot up the full service stack locally, you can use the `docker compose up` command, from the root of the project. Then, you will be able to access:

- The webapp on [localhost:3000](http://localhost:3000)
- The database view on [localhost:5555](http://localhost:5555)
