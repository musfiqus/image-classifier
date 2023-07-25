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
RUN pip install torch==2.0.1+cpu torchaudio==2.0.2+cpu torchvision==0.15.2+cpu -f https://download.pytorch.org/whl/torch_stable.html

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

# Copy the Django app source code
COPY . /app/

# Expose the Django development server port
EXPOSE 8000

# Run Django development server
CMD ["./start.sh"]
