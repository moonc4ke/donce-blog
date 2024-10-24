# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

- Ruby version

- System dependencies

- Configuration

- Database creation

- Database initialization

- How to run the test suite

- Services (job queues, cache servers, search engines, etc.)

## Deployment instructions

config/deploy.yml:

```
proxy:
  ssl: false
  host: donce.dev
```

Also, you need to tell kamal which port its proxy should run, so type on your terminal and run

```
kamal proxy boot_config set --http-port 4444 --https-port 4445
```

`--https-port` seems to be required

### Configure Caddy

```sh
sudo vim /etc/caddy/Caddyfile
```

Add the following configuration:

```caddyfile
donce.dev {
        tls adom.donatas@gmail.com
        request_body {
                max_size 100MB
        }
        reverse_proxy 127.0.0.1:4444
}
```

**Restart Caddy:**

```sh
sudo systemctl restart caddy
```

Check the Caddy service status:

```sh
sudo systemctl status caddy
```

- ...
