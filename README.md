# RosterManagementSystem

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

```
roster-management-system
├─ .angular
├─ .editorconfig
├─ .nx
│  ├─ cache
│  │  └─ terminalOutputs
│  └─ workspace-data
│     └─ d
├─ angular.json
├─ package-lock.json
├─ package.json
├─ public
│  └─ favicon.ico
├─ README.md
├─ src
│  ├─ app
│  │  ├─ app.component.html
│  │  ├─ app.component.scss
│  │  ├─ app.component.ts
│  │  ├─ app.config.ts
│  │  ├─ app.routes.ts
│  │  ├─ auth
│  │  │  ├─ auth.routes.ts
│  │  │  ├─ callback
│  │  │  │  └─ callback.component.ts
│  │  │  └─ login
│  │  │     └─ login.component.ts
│  │  ├─ core
│  │  │  ├─ guards
│  │  │  │  └─ auth.guard.ts
│  │  │  ├─ models
│  │  │  │  ├─ player.model.ts
│  │  │  │  ├─ team.model.ts
│  │  │  │  └─ user.model.ts
│  │  │  └─ services
│  │  │     ├─ auth.service.ts
│  │  │     ├─ players.service.ts
│  │  │     ├─ supabase.service.ts
│  │  │     └─ teams.service.ts
│  │  ├─ features
│  │  │  ├─ admin
│  │  │  │  ├─ admin-dashboard
│  │  │  │  │  └─ admin-dashboard.component.ts
│  │  │  │  ├─ admin.routes.ts
│  │  │  │  ├─ user-detail
│  │  │  │  │  └─ user-detail.component.ts
│  │  │  │  ├─ user-form
│  │  │  │  │  └─ user-form.component.ts
│  │  │  │  └─ user-management
│  │  │  │     └─ user-management.component.ts
│  │  │  ├─ dashboard
│  │  │  │  └─ dashboard.component.ts
│  │  │  ├─ players
│  │  │  │  ├─ player-detail
│  │  │  │  │  └─ player-detail.component.ts
│  │  │  │  ├─ player-form
│  │  │  │  │  └─ player-form.component.ts
│  │  │  │  ├─ player-list
│  │  │  │  │  └─ player-list.component.ts
│  │  │  │  └─ players.routes.ts
│  │  │  └─ teams
│  │  │     ├─ team-detail
│  │  │     │  └─ team-detail.component.ts
│  │  │     ├─ team-form
│  │  │     │  └─ team-form.component.ts
│  │  │     ├─ team-list
│  │  │     │  └─ team-list.component.ts
│  │  │     ├─ team-roster
│  │  │     │  └─ team-roster.component.ts
│  │  │     └─ teams.routes.ts
│  │  └─ shared
│  │     └─ components
│  │        ├─ layout
│  │        │  └─ main-layout.component.ts
│  │        ├─ photo-upload
│  │        │  └─ photo-upload.component.ts
│  │        └─ player-card
│  │           └─ player-card.component.ts
│  ├─ environments
│  │  └─ environment.ts
│  ├─ index.html
│  ├─ main.ts
│  └─ styles.scss
├─ tsconfig.app.json
├─ tsconfig.json
└─ tsconfig.spec.json

```