# CIS4592 Team 6

## Development Checkpoint Video

[View on YouTube](https://youtu.be/H0FDIOFNcqQ)

## Docker Setup

Please ensure that docker is installed on your device.

Docker Engine: [Install Docker Engine](https://docs.docker.com/engine/install/)  
Docker Desktop: [Docker Desktop Next Steps](https://docs.docker.com/desktop/#next-steps)

## Environment Files

There are a number of environment files that need to be created to manage the configuration of FALAFEL.

### `.db.env`

In `server/db`, create a `.db.env` file. It should look like this:

```
POSTGRES_USER=example_admin
POSTGRES_PASSWORD=example_password
POSTGRES_DB=example_db
```

### `.py.env`

In `server/python`, create a `.py.env` file. It should look like this:

```
FLASK_ENV=development
FLASK_APP=app.py
PYTHONBUFFERED=1
LOG_LEVEL=debug
```

### `.auth.env`

In `server/python/auth`, create an `.auth.env` file. It should look like this:

```
JWT_SECRET_KEY=somealphanumericstring12345
```

### `.env.local`

In `client/`, create an `.env.local` file. It should look like this:

```env
API_URL="http://server:5000"
```

## Setting up the project

To get the project ready to run, run `docker compose build` in the **root directory** of the project. This process may take a while.


## Running the project

Once Docker has built the project, you can start it up using `docker compose up -d` in the root directory of the project. This will start all containers in "detached" mode.  
### Running over HTTPS  
If you are running the application locally (as shipped) and accessing over HTTPS, and you would like to suppress security warnings within your browser, please export the certificate issued by Caddy and import it into your trusted store.  
`docker compose exec caddy cat /data/caddy/pki/authorities/local/root.crt > <desired location>/caddy-root.crt`  

**Windows (Command Prompt):**  
```certutil -addstore "Root" "<desired location>/caddy-root.crt"```  
**MacOS (Terminal):**  
```sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ~/Desktop/caddy-root.crt```  
**Linux (Shell):** 
```
sudo mkdir -p /usr/local/share/caddy
sudo cp <desired location>/caddy-root.crt /usr/local/share/ca-certificates/caddy/caddy-root.crt
sudo update-ca-certificates
```

If you want to watch logs for any container, use `docker compose logs -f <container_name>`, or `docker compose logs -f` to follow all logs.

Here is where you can access each container:

| Container name | Exposed port | URL (if applicable)   | URL (https)               | Description                        |
| -------------- | ------------ | --------------------- | ------------------------- | ---------------------------------- |
| app            | 3000         | http://localhost:3000 | https://app.localhost     | Access the FALAFEL web app         |
| adminer        | 8080         | http://localhost:8080 | https://adminer.localhost | Access and modify database records |
| server         | 8000         | http://localhost:8000 | https://server.localhost  | Test the Python/Flask server       |
| db             | 5432         |                       |                           | PostgreSQL database                |
| caddy          | 80, 443      |                       |                           | Caddy reverse proxy                |

> Isaac Maddox, Trenten Reed, Sarah Wallis, Kyle Rushing
# Capstone-Project
