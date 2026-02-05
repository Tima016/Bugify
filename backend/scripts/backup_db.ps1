$ErrorActionPreference = "Stop"

$DB_CONTAINER_NAME = "postgres" # Adjust if running in docker, or use pg_dump directly
$DB_USER = "postgres"
$DB_NAME = "uzsecure"
$BACKUP_DIR = "C:\Users\r3dd1t\Desktop\backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
if (!(Test-Path -Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    Write-Host "Created backup directory: $BACKUP_DIR"
}

# Check if pg_dump is available
if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
    Write-Host "Starting backup for database '$DB_NAME'..."
    try {
        # Modify this line based on your connection string or environment
        # Example using simple pg_dump (assumes .pgpass or environment variables set for password)
        # $env:PGPASSWORD = "your_password" 
        pg_dump -U $DB_USER -h localhost -d $DB_NAME -f $BACKUP_FILE
        
        if (Test-Path $BACKUP_FILE) {
            Write-Host "Backup completed successfully: $BACKUP_FILE"
        } else {
            Write-Error "Backup file was not created."
        }
    } catch {
        Write-Error "Backup failed: $_"
    }
} else {
    Write-Warning "pg_dump command not found. Please ensure PostgreSQL tools are in your PATH."
}
