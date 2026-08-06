# Privacy

The Museum of Almost is designed to collect as little information as possible.

## The application

The Museum itself:

- does not require an account or login;
- does not contain forms or free-form text entry;
- does not use analytics, advertising, tracking pixels or behavioural telemetry;
- does not use cookies;
- does not contact external APIs;
- does not load third-party scripts, fonts or media;
- does not collect names, email addresses, locations or device identifiers.

The pocket catalogue stores only generated fictional fragment labels, progress counters and a random seed in the visitor's browser storage.

The Listening Room stores no additional visitor state. It retains ten fixed numeric entropy values in the application source; the source seed identifiers are not stored. Its receiver reads the existing fictional catalogue locally to choose an echo and does not transmit that catalogue.

Optional ambient sound is synthesised locally by the browser and remains silent until explicitly enabled.

The **Save postcard** feature generates an image locally. The image leaves the visitor's device only when the visitor deliberately moves, uploads or shares it.

The service worker handles same-origin static files only so the Museum can work offline.

## Hosting

When GitHub Pages is enabled, GitHub provides the public website hosting.

Although the Museum application does not collect or transmit visitor information, GitHub may process technical connection information, including visitors' IP addresses, for security and operational purposes. GitHub's own privacy terms apply to its repository and hosting services.

## Repository visibility

When the repository is public, its source code, commit history, pull requests and automated workflow results are publicly visible through GitHub.

Do not add personal information about any person to this repository. This prohibition applies to:

- source code;
- documentation;
- examples and fixtures;
- screenshots and generated artifacts;
- commit messages;
- issues and pull requests;
- review comments;
- workflow output.

Do not add credentials, tokens, private keys, private URLs, personal correspondence, real addresses, real phone numbers or identifying sample data. Use fictional and generic material only.

## Scope

Statements that the Museum does not collect personal information refer to the application itself. They do not override data processing performed independently by GitHub as the repository and website hosting provider.
