# Donce Blog

Personal Rails app for [donce.dev](https://donce.dev/). It hosts blog posts,
profile/about pages, project links, tools, and a small public portfolio section
for current Breezit and AI-assisted development work.

The app is intentionally simple: Rails, SQLite, import maps, Stimulus, local
Active Storage, and Kamal deployment to a self-hosted server.

## Stack

- Rails 8
- Ruby from `.tool-versions` for local development
- SQLite with Solid Cache, Solid Queue, and Solid Cable
- Importmap + Stimulus
- Redcarpet and Rouge for Markdown/code rendering
- Octokit for GitHub-backed project cards
- Kamal for Docker deployment

## Local Setup

```sh
cp .env.example .env
$EDITOR .env
bin/setup
```

`bin/setup` installs gems, prepares the database, clears old temp files, and
starts the Rails server. Use this if you only want setup without starting the
server:

```sh
bin/setup --skip-server
```

Start the app later with:

```sh
bin/dev
```

The app runs at `http://127.0.0.1:3000` by default.

## Environment

The root `.env` file is gitignored and is used for local development plus Kamal
deploy secrets.

Required keys:

```env
KAMAL_REGISTRY_PASSWORD=docker-hub-access-token
GITHUB_ACCESS_TOKEN=github-token
```

`GITHUB_ACCESS_TOKEN` is used by the Projects page to fetch public GitHub
repository metadata and topics for `moonc4ke`.

## Useful Commands

```sh
bin/rails test
bin/rubocop
bin/rails console
bin/rails db:prepare
bin/rails db:seed
```

## Content

- Home: `app/views/home/index.html.erb`
- About: `app/views/about/index.html.erb`
- Projects: `app/views/projects/index.html.erb`
- Public profile copy: `docs/profile-copy.md`
- Public wording glossary: `CONTEXT.md`

Blog posts are stored in SQLite and can be managed through the Rails app. Images
use Active Storage and are stored under the mounted `storage/` directory.

## Deployment

Deploy secrets are read from the local gitignored `.env` file through
`.kamal/secrets`. No Bitwarden step is required.

Check deploy secrets locally:

```sh
bin/kamal secrets print
```

Deploy:

```sh
bin/kamal deploy
```

Main Kamal settings:

```yml
proxy:
  ssl: false
  host: donce.dev
```

If the Kamal proxy needs to be bootstrapped on the shared server:

```sh
bin/kamal proxy boot_config set --http-port 4444 --https-port 4445
```

Production SQLite and Active Storage files are mounted through:

```yml
volumes:
  - "~/rails-db-storage/donce_blog_storage:/rails/storage"
```

## Caddy

The host Caddy config proxies `donce.dev` to Kamal's local proxy port:

```caddyfile
donce.dev {
        tls adom.donatas@gmail.com
        request_body {
                max_size 100MB
        }
        reverse_proxy 127.0.0.1:4444
}
```

Restart Caddy after editing:

```sh
sudo systemctl restart caddy
sudo systemctl status caddy
```

## Notes

- Keep real `.env` values out of git.
- Keep `config/credentials/production.key` out of git. Kamal reads it locally as
  `RAILS_MASTER_KEY` during deploy.
- If GitHub project cards fail locally, check `GITHUB_ACCESS_TOKEN`; the static
  Featured Work section still renders without GitHub.
