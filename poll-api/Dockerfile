# Use an official Python runtime as a parent image
FROM python:3.9-slim

# --- Add OS Package Update ---
# Update package lists, upgrade installed packages, and clean up cache
RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# --- Upgrade pip, setuptools, and wheel ---
# Upgrading these core tools helps ensure dependencies resolve correctly and patches are included
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
# --- End pip upgrade ---

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
# Copy requirements first to leverage Docker layer caching
COPY requirements.txt .

# Install any needed dependencies specified in requirements.txt
# This will now use the upgraded pip/setuptools
RUN pip install --no-cache-dir --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variables (can be overridden at runtime)
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
# DB credentials injected via K8s Secrets/ConfigMaps

# Run app.py when the container launches using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]