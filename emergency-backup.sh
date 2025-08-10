#!/bin/bash
echo "💾 KRYONIX EMERGENCY BACKUP STARTING..."

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="kryonix_emergency_backup_$TIMESTAMP"

mkdir -p $BACKUP_DIR

# Copy all critical directories
echo "📁 Backing up critical directories..."
cp -r app/ $BACKUP_DIR/ 2>/dev/null || true
cp -r lib/ $BACKUP_DIR/ 2>/dev/null || true
cp -r backend/ $BACKUP_DIR/ 2>/dev/null || true
cp -r frontend/ $BACKUP_DIR/ 2>/dev/null || true
cp -r public/ $BACKUP_DIR/ 2>/dev/null || true
cp -r locales/ $BACKUP_DIR/ 2>/dev/null || true
cp -r deploy/ $BACKUP_DIR/ 2>/dev/null || true
cp -r Documentação/ $BACKUP_DIR/ 2>/dev/null || true

# Copy config files
echo "⚙️ Backing up configuration files..."
cp *.json $BACKUP_DIR/ 2>/dev/null || true
cp *.js $BACKUP_DIR/ 2>/dev/null || true
cp *.ts $BACKUP_DIR/ 2>/dev/null || true
cp *.md $BACKUP_DIR/ 2>/dev/null || true
cp Dockerfile* $BACKUP_DIR/ 2>/dev/null || true
cp vercel.json $BACKUP_DIR/ 2>/dev/null || true
cp render.yaml $BACKUP_DIR/ 2>/dev/null || true
cp .env* $BACKUP_DIR/ 2>/dev/null || true

# Create compressed archive
echo "🗜️ Creating compressed archive..."
tar -czf "$BACKUP_DIR.tar.gz" $BACKUP_DIR/
rm -rf $BACKUP_DIR

echo "✅ BACKUP COMPLETED: $BACKUP_DIR.tar.gz"
echo "📊 Backup size: $(du -sh $BACKUP_DIR.tar.gz | cut -f1)"
echo "🛡️ YOUR MONTHS OF WORK ARE SAFE!"
