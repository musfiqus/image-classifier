# Use the official Python image as the base image
FROM python:3.11

# Set environment variables for Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install postgresql client
RUN apt-get update && apt-get install -y postgresql-client

# Install cpu specific pytorch
RUN pip install --upgrade pip
RUN pip install --extra-index-url https://download.pytorch.org/whl/cpu/ torch torchvision torchaudio torchtext

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

# Copy the Django app source code
COPY . /app/

# Expose the Django development server port
EXPOSE 8000

# Grant execute permission to the start.sh script
RUN sed -i 's/\r$//' start.sh  && \  
        chmod +x start.sh

# Run Django development server
CMD ["./start.sh"]
