FROM python:3.11-slim

WORKDIR /workspace

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python packages
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application and ml modules
COPY . ./backend
COPY ../ml ./ml

ENV PYTHONPATH=/workspace
EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
