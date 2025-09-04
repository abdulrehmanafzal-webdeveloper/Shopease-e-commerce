# Deployment Guide for Smart E-commerce Backend

This guide will help you deploy your FastAPI e-commerce backend to various platforms.

## Prerequisites

- Make sure all imports use absolute paths (`App.DB.connection` instead of `DB.connection`)
- Python 3.11+ installed
- MySQL database accessible from your deployment platform

## Deployment Steps

### 1. Local Testing

Before deploying, test locally:

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python server.py
```

### 2. Railway Deployment

1. Push your code to a GitHub repository
2. Create a new project in Railway
3. Connect to your GitHub repo
4. Set the start command to:
   ```
   uvicorn App.main:app --host=0.0.0.0 --port=$PORT
   ```
5. Add the following environment variables:
   - `DB_HOST`: Your database host
   - `DB_USER`: Database username
   - `DB_PASSWORD`: Database password
   - `DB_NAME`: Database name
   - `DB_PORT`: Database port
   - `SECRET_KEY`: JWT secret key
   - `ALGORITHM`: JWT algorithm (usually HS256)

### 3. Heroku Deployment

1. Make sure you have the Heroku CLI installed
2. Login to Heroku:
   ```
   heroku login
   ```
3. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```
4. Push to Heroku:
   ```
   git push heroku main
   ```
5. Set environment variables:
   ```
   heroku config:set DB_HOST=your_db_host
   heroku config:set DB_USER=your_db_user
   ...etc
   ```

### 4. Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "App.main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]
```

Build and run:
```bash
docker build -t ecommerce-api .
docker run -p 8000:8000 -e DB_HOST=your_host -e DB_USER=your_user ... ecommerce-api
```

## Database Configuration

For production, consider:

1. Using connection pooling
2. Setting up database replication
3. Implementing proper error handling and retries

## File Upload Handling

Your app stores files in the `uploads` folder. For cloud deployments:

1. Set up cloud storage (AWS S3, Google Cloud Storage)
2. Update your code to use cloud storage instead of local storage
3. Or ensure your deployment platform has persistent storage

## Troubleshooting

Common errors:

1. **Import errors**: Make sure all imports use absolute paths (App.DB.connection)
2. **Database connection errors**: Check your environment variables
3. **File permissions**: Ensure upload directory is writable

## Monitoring & Scaling

1. Set up logging with a service like Sentry
2. Add health check endpoints
3. Implement rate limiting for public endpoints
