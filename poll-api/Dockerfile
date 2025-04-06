# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any needed dependencies specified in requirements.txt
# --no-cache-dir reduces image size
# --trusted-host pypi.python.org handles potential network issues in some environments
RUN pip install --no-cache-dir --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variables (can be overridden at runtime)
ENV FLASK_APP=app.py
# Ensure Flask runs in production mode
ENV FLASK_ENV=production 
# DB credentials should be injected via K8s Secrets/ConfigMaps, not hardcoded here.
# These are just placeholder comments for documentation:
# DB_HOST=db_service_name_or_ip
# DB_PORT=5432
# DB_NAME=poll_db
# DB_USER=poll_user
# DB_PASSWORD=placeholder_password

# Run app.py when the container launches using Gunicorn
# Use 0.0.0.0 to bind to all interfaces
# Use a reasonable number of workers (e.g., based on CPU cores)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]