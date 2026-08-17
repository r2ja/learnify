#!/bin/bash

# Exit on any error
set -e

echo "Setting up PostgreSQL..."

# Update package lists
sudo apt update

# Install PostgreSQL and necessary packages
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Setup the database and user
echo "Creating database and user..."
sudo -u postgres psql -c "CREATE DATABASE frontend_app_db;"
sudo -u postgres psql -c "CREATE USER postgres WITH ENCRYPTED PASSWORD 'password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE frontend_app_db TO postgres;"
sudo -u postgres psql -c "ALTER USER postgres WITH SUPERUSER;"

echo "PostgreSQL setup complete!"
echo "Connection string: postgresql://postgres:password@localhost:5432/frontend_app_db"
echo "Remember to update your .env.local file with the correct credentials for production."

# Note: In a production environment, you would want to:
# 1. Use a more secure password
# 2. Set up proper user permissions
# 3. Configure PostgreSQL for better security 