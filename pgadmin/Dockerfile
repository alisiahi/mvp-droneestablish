FROM dpage/pgadmin4

# Switch to root to set internal permissions
USER root

# Copy your config files
COPY servers.json /pgadmin4/servers.json
COPY pgpass /tmp/pgpass

# Use numeric ID 5050 (pgAdmin's internal user)
RUN chmod 600 /tmp/pgpass && \
    chown 5050:5050 /tmp/pgpass /pgadmin4/servers.json

# Switch back to the standard pgAdmin user
USER pgadmin