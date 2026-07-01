FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files
COPY . .

# Create necessary folders
RUN mkdir -p static/uploads static/heatmaps models

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Start the app
CMD ["gunicorn", "run:app", "--bind", "0.0.0.0:7860", "--timeout", "300", "--workers", "1"]