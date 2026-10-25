# hello-js

A lightweight JavaScript/Node.js web app for displaying information about a running container. This is the JavaScript counterpart to hello-py and hello-go.

The app uses the Node.js built-in HTTP server with **no third-party runtime dependencies**.

## Features

- JavaScript-themed HTML landing page at GET /
- JSON metadata endpoint at GET /api
- Hostname, start time (UTC), process uptime, and image version
- Configurable port via PORT, defaulting to 8000
- IMAGE_TAG exposed as the version, defaulting to unknown
- Docker image running as a non-root user
- GitHub Actions for tests, Docker build validation, and publishing to GHCR and Docker Hub

## Local development

Requires Node.js 22 or newer. No dependencies need installing.

Run the server:

    npm start

Visit http://localhost:8000 or call the API:

    curl http://localhost:8000/api

To change the port and version:

    PORT=8080 IMAGE_TAG=local npm start

## API

GET /api returns:

    {
      "hostname": "container-hostname",
      "start_time": "2026-10-24 12:34:56 UTC",
      "uptime": "00h 01m 23s",
      "version": "1.0.0"
    }

The start time is expressed in UTC. Uptime reflects the process lifetime, and version is read from IMAGE_TAG.

## Docker

Build an image with a version tag:

    docker build --build-arg IMAGE_TAG=1.0.0 -t hello-js:1.0.0 .

Run it:

    docker run --rm -p 8000:8000 hello-js:1.0.0

Map another host port with -p 8080:8000.

## Tests

    npm run check
    npm test

Tests use Node.js's built-in test runner.

## GitHub Actions and releases

The Test JavaScript App workflow runs on PRs, pushes to main, and manual dispatch. It checks syntax, runs the test suite, and builds a Docker image.

The Build and Push Docker Image workflow mirrors the Python repository's publishing behavior. It runs for GitHub releases, manual dispatch, and semantic-version tags including 1.0.0, 1.0.0-dev, 1.0.0-dev.1, 1.0.0-rc, and 1.0.0-rc.1.

Images are pushed to GHCR (ghcr.io/davidslusser/hello-js) and to the configured Docker Hub username's hello-js repository. Stable tags also update latest. Development tags also update dev. Release candidates do not update either alias.

Configure these GitHub repository secrets for Docker Hub publishing:

- DOCKERHUB_USERNAME — Docker Hub username
- DOCKERHUB_TOKEN — Docker Hub access token permitted to publish

GHCR uses the automatically supplied GITHUB_TOKEN with package write permission.

Manual dispatch publishes the latest tag, matching hello-py.
