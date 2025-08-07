# 📁 PARTE 19 - GESTÃO DE DOCUMENTOS E ARQUIVOS
*Agentes Responsáveis: CMS Expert + Storage Architect + Security Expert*

## 🎯 **OBJETIVO**
Implementar sistema completo de gestão de documentos e arquivos utilizando NextCloud (`cloud.kryonix.com.br`), MinIO (`storage.kryonix.com.br`) e Stirling PDF (`pdf.kryonix.com.br`) para upload, organização, processamento e compartilhamento seguro de arquivos.

## 🏗️ **ARQUITETURA DE DOCUMENTOS**
```yaml
Document Management Stack:
  Cloud Storage: NextCloud (cloud.kryonix.com.br)
  Object Storage: MinIO (storage.kryonix.com.br)
  PDF Processing: Stirling PDF (pdf.kryonix.com.br)
  Digital Signature: Docuseal (docuseal.kryonix.com.br)
  Database: PostgreSQL (metadata)
  Search Engine: Full-text search
  
File Processing:
  - Images: Thumbnail generation, compression
  - Videos: Transcoding, preview
  - Documents: Text extraction, preview
  - PDFs: Manipulation, digital signature
  
Security:
  - Encryption at rest (AES-256)
  - Access control (RBAC)
  - Audit logs
  - Virus scanning
  - DLP (Data Loss Prevention)
```

## 📊 **MODELO DE DADOS DOCUMENTOS**
```sql
-- Schema para gestão de documentos
CREATE SCHEMA IF NOT EXISTS documents;

-- Tipos de arquivo e categoria
CREATE TYPE documents.file_type AS ENUM ('image', 'video', 'audio', 'document', 'pdf', 'archive', 'other');
CREATE TYPE documents.access_level AS ENUM ('private', 'company', 'public', 'restricted');
CREATE TYPE documents.processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Pastas/Diretórios
CREATE TABLE documents.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Estrutura hierárquica
    parent_id UUID REFERENCES documents.folders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Localização
    full_path TEXT NOT NULL, -- caminho completo "/company/dept/project"
    level INTEGER DEFAULT 0, -- nível na hierarquia
    
    -- Permissões
    access_level documents.access_level DEFAULT 'company',
    company_id UUID REFERENCES auth.companies(id) ON DELETE CASCADE,
    
    -- Configurações
    is_system BOOLEAN DEFAULT false, -- pasta do sistema
    allow_upload BOOLEAN DEFAULT true,
    auto_organize BOOLEAN DEFAULT false, -- organização automática por IA
    
    -- Metadados
    color VARCHAR(7), -- cor hex para identificação visual
    icon VARCHAR(50), -- ícone personalizado
    tags JSONB DEFAULT '[]',
    
    -- Auditoria
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(company_id, full_path)
);

-- Arquivos
CREATE TABLE documents.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    original_name VARCHAR(500) NOT NULL,
    internal_name VARCHAR(255) NOT NULL, -- nome interno único
    slug VARCHAR(255), -- URL-friendly name
    
    -- Localização
    folder_id UUID REFERENCES documents.folders(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL, -- caminho no MinIO/NextCloud
    
    -- Propriedades do arquivo
    file_type documents.file_type NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL, -- em bytes
    checksum_md5 VARCHAR(32),
    checksum_sha256 VARCHAR(64),
    
    -- Metadados
    title VARCHAR(500),
    description TEXT,
    tags JSONB DEFAULT '[]',
    custom_metadata JSONB DEFAULT '{}',
    
    -- Processamento
    processing_status documents.processing_status DEFAULT 'pending',
    processing_error TEXT,
    
    -- Visualização
    thumbnail_path TEXT, -- caminho do thumbnail
    preview_path TEXT, -- caminho do preview
    
    -- Conteúdo (para busca)
    extracted_text TEXT,
    searchable_content TSVECTOR,
    
    -- Segurança
    access_level documents.access_level DEFAULT 'company',
    is_encrypted BOOLEAN DEFAULT false,
    encryption_key_id VARCHAR(255),
    
    -- Versionamento
    version INTEGER DEFAULT 1,
    parent_file_id UUID REFERENCES documents.files(id), -- arquivo original
    is_current_version BOOLEAN DEFAULT true,
    
    -- Analytics
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    
    -- Relacionamentos
    company_id UUID REFERENCES auth.companies(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- para arquivos temporários
    
    UNIQUE(company_id, internal_name)
);

-- Permissões de arquivo
CREATE TABLE documents.file_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    file_id UUID REFERENCES documents.files(id) ON DELETE CASCADE,
    
    -- Destinatário da permissão
    user_id UUID REFERENCES auth.users(id), -- usuário específico
    role_name VARCHAR(100), -- ou role (admin, editor, viewer)
    
    -- Permissões específicas
    can_read BOOLEAN DEFAULT true,
    can_write BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_share BOOLEAN DEFAULT false,
    can_download BOOLEAN DEFAULT true,
    
    -- Configurações
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Links de compartilhamento
CREATE TABLE documents.share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    file_id UUID REFERENCES documents.files(id) ON DELETE CASCADE,
    
    -- Link
    token VARCHAR(255) UNIQUE NOT NULL, -- token único para acesso
    url_slug VARCHAR(255) UNIQUE, -- slug personalizado opcional
    
    -- Configurações de acesso
    requires_password BOOLEAN DEFAULT false,
    password_hash VARCHAR(255),
    max_downloads INTEGER, -- limite de downloads
    download_count INTEGER DEFAULT 0,
    
    -- Permissões
    allow_preview BOOLEAN DEFAULT true,
    allow_download BOOLEAN DEFAULT true,
    require_login BOOLEAN DEFAULT false,
    
    -- Validade
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    -- Analytics
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    access_log JSONB DEFAULT '[]', -- log de acessos
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Histórico de atividades
CREATE TABLE documents.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamentos
    file_id UUID REFERENCES documents.files(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES documents.folders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    -- Atividade
    action VARCHAR(100) NOT NULL, -- 'upload', 'download', 'view', 'edit', 'delete', 'share'
    details JSONB DEFAULT '{}',
    
    -- Contexto
    ip_address INET,
    user_agent TEXT,
    
    occurred_at TIMESTAMP DEFAULT NOW()
);

-- Processamento de arquivos (fila)
CREATE TABLE documents.processing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    file_id UUID REFERENCES documents.files(id) ON DELETE CASCADE,
    
    -- Processamento
    task_type VARCHAR(100) NOT NULL, -- 'thumbnail', 'preview', 'text_extraction', 'virus_scan'
    priority INTEGER DEFAULT 0, -- maior = mais prioritário
    status documents.processing_status DEFAULT 'pending',
    
    -- Configuração da tarefa
    task_config JSONB DEFAULT '{}',
    
    -- Resultado
    result JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_files_folder_id ON documents.files(folder_id);
CREATE INDEX idx_files_company_type ON documents.files(company_id, file_type);
CREATE INDEX idx_files_search ON documents.files USING gin(searchable_content);
CREATE INDEX idx_files_created_at ON documents.files(created_at DESC);
CREATE INDEX idx_folders_parent_id ON documents.folders(parent_id);
CREATE INDEX idx_folders_full_path ON documents.folders(full_path);
CREATE INDEX idx_activity_log_file_occurred ON documents.activity_log(file_id, occurred_at);
CREATE INDEX idx_share_links_token ON documents.share_links(token);
CREATE INDEX idx_processing_queue_status_priority ON documents.processing_queue(status, priority DESC);
```

## 🔧 **SERVIÇO DE GESTÃO DE DOCUMENTOS**
```typescript
// services/document.service.ts
export class DocumentService {
  private minioClient: MinioClient;
  private nextcloudClient: NextCloudClient;
  private stirlingPdfClient: StirlingPdfClient;

  constructor() {
    this.minioClient = new MinioClient({
      endPoint: 'storage.kryonix.com.br',
      port: 443,
      useSSL: true,
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!
    });

    this.nextcloudClient = new NextCloudClient({
      url: 'https://cloud.kryonix.com.br',
      username: 'kryonix',
      password: 'Vitor@123456'
    });

    this.stirlingPdfClient = new StirlingPdfClient({
      baseUrl: 'https://pdf.kryonix.com.br'
    });
  }

  // ========== UPLOAD DE ARQUIVOS ==========

  async uploadFile(uploadData: FileUploadData): Promise<FileDocument> {
    try {
      // 1. Validar arquivo
      await this.validateFile(uploadData);

      // 2. Gerar nome interno único
      const internalName = this.generateInternalName(uploadData.originalName);
      const storagePath = `${uploadData.companyId}/${uploadData.folderId}/${internalName}`;

      // 3. Upload para MinIO
      const uploadResult = await this.minioClient.putObject(
        'documents',
        storagePath,
        uploadData.buffer,
        uploadData.size,
        {
          'Content-Type': uploadData.mimeType,
          'Original-Name': uploadData.originalName,
          'Uploaded-By': uploadData.uploadedBy
        }
      );

      // 4. Calcular checksums
      const md5Hash = crypto.createHash('md5').update(uploadData.buffer).digest('hex');
      const sha256Hash = crypto.createHash('sha256').update(uploadData.buffer).digest('hex');

      // 5. Detectar tipo de arquivo
      const fileType = this.detectFileType(uploadData.mimeType);

      // 6. Salvar metadados no banco
      const fileRecord = await this.db.query(`
        INSERT INTO documents.files 
          (original_name, internal_name, folder_id, storage_path, file_type, mime_type, file_size,
           checksum_md5, checksum_sha256, title, description, tags, access_level, company_id, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        uploadData.originalName,
        internalName,
        uploadData.folderId,
        storagePath,
        fileType,
        uploadData.mimeType,
        uploadData.size,
        md5Hash,
        sha256Hash,
        uploadData.title || uploadData.originalName,
        uploadData.description,
        JSON.stringify(uploadData.tags || []),
        uploadData.accessLevel || 'company',
        uploadData.companyId,
        uploadData.uploadedBy
      ]);

      const file = fileRecord.rows[0];

      // 7. Adicionar à fila de processamento
      await this.queueProcessing(file.id, [
        'virus_scan',
        'thumbnail',
        'text_extraction'
      ]);

      // 8. Registrar atividade
      await this.logActivity({
        fileId: file.id,
        userId: uploadData.uploadedBy,
        action: 'upload',
        details: {
          originalName: uploadData.originalName,
          fileSize: uploadData.size,
          mimeType: uploadData.mimeType
        }
      });

      // 9. Sync com NextCloud (opcional)
      if (uploadData.syncToNextCloud) {
        await this.syncToNextCloud(file);
      }

      return file;

    } catch (error) {
      console.error('Erro no upload:', error);
      throw new Error(`Falha no upload: ${error.message}`);
    }
  }

  async uploadMultiple(files: FileUploadData[]): Promise<FileDocument[]> {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(file);
        results.push(result);
      } catch (error) {
        results.push({ error: error.message, originalName: file.originalName });
      }
    }

    return results;
  }

  // ========== PROCESSAMENTO DE ARQUIVOS ==========

  async processFile(fileId: string, taskType: ProcessingTaskType): Promise<ProcessingResult> {
    const file = await this.getFileById(fileId);
    
    try {
      await this.updateProcessingStatus(fileId, taskType, 'processing');

      let result: ProcessingResult;

      switch (taskType) {
        case 'thumbnail':
          result = await this.generateThumbnail(file);
          break;
        case 'preview':
          result = await this.generatePreview(file);
          break;
        case 'text_extraction':
          result = await this.extractText(file);
          break;
        case 'virus_scan':
          result = await this.scanForVirus(file);
          break;
        case 'pdf_process':
          result = await this.processPdf(file);
          break;
        default:
          throw new Error(`Tipo de processamento não suportado: ${taskType}`);
      }

      await this.updateProcessingStatus(fileId, taskType, 'completed', result);
      return result;

    } catch (error) {
      await this.updateProcessingStatus(fileId, taskType, 'failed', { error: error.message });
      throw error;
    }
  }

  private async generateThumbnail(file: FileDocument): Promise<ProcessingResult> {
    if (!['image', 'video', 'pdf'].includes(file.file_type)) {
      return { skipped: true, reason: 'Tipo de arquivo não suporta thumbnail' };
    }

    const fileBuffer = await this.getFileBuffer(file);
    let thumbnailBuffer: Buffer;

    if (file.file_type === 'image') {
      // Usar Sharp para imagens
      const sharp = require('sharp');
      thumbnailBuffer = await sharp(fileBuffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

    } else if (file.file_type === 'video') {
      // Usar FFmpeg para vídeos
      thumbnailBuffer = await this.generateVideoThumbnail(fileBuffer);

    } else if (file.file_type === 'pdf') {
      // Usar PDF2pic para PDFs
      thumbnailBuffer = await this.generatePdfThumbnail(fileBuffer);
    }

    // Salvar thumbnail no MinIO
    const thumbnailPath = `${file.storage_path}_thumb.jpg`;
    await this.minioClient.putObject('thumbnails', thumbnailPath, thumbnailBuffer);

    // Atualizar registro do arquivo
    await this.db.query(`
      UPDATE documents.files 
      SET thumbnail_path = $1, updated_at = NOW()
      WHERE id = $2
    `, [thumbnailPath, file.id]);

    return { 
      success: true, 
      thumbnailPath,
      size: thumbnailBuffer.length
    };
  }

  private async extractText(file: FileDocument): Promise<ProcessingResult> {
    const fileBuffer = await this.getFileBuffer(file);
    let extractedText = '';

    try {
      switch (file.file_type) {
        case 'pdf':
          extractedText = await this.extractTextFromPdf(fileBuffer);
          break;
        case 'document':
          if (file.mime_type.includes('word')) {
            extractedText = await this.extractTextFromWord(fileBuffer);
          } else if (file.mime_type.includes('spreadsheet')) {
            extractedText = await this.extractTextFromSpreadsheet(fileBuffer);
          }
          break;
        case 'image':
          extractedText = await this.extractTextFromImage(fileBuffer); // OCR
          break;
      }

      if (extractedText) {
        // Atualizar campo de busca
        await this.db.query(`
          UPDATE documents.files 
          SET extracted_text = $1, 
              searchable_content = to_tsvector('portuguese', $1),
              updated_at = NOW()
          WHERE id = $2
        `, [extractedText, file.id]);
      }

      return { 
        success: true, 
        extractedText,
        charactersExtracted: extractedText.length
      };

    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // ========== GESTÃO DE PASTAS ==========

  async createFolder(folderData: FolderData): Promise<Folder> {
    // Verificar se pasta pai existe
    if (folderData.parentId) {
      const parent = await this.getFolderById(folderData.parentId);
      if (!parent) {
        throw new Error('Pasta pai não encontrada');
      }
    }

    // Calcular caminho completo
    const fullPath = await this.calculateFullPath(folderData.parentId, folderData.name);
    
    // Verificar se já existe pasta com mesmo nome
    const existing = await this.db.query(`
      SELECT id FROM documents.folders 
      WHERE company_id = $1 AND full_path = $2
    `, [folderData.companyId, fullPath]);

    if (existing.rows.length > 0) {
      throw new Error('Já existe uma pasta com este nome neste local');
    }

    const result = await this.db.query(`
      INSERT INTO documents.folders 
        (parent_id, name, description, full_path, level, access_level, company_id, created_by, color, icon, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      folderData.parentId,
      folderData.name,
      folderData.description,
      fullPath,
      await this.calculateLevel(folderData.parentId),
      folderData.accessLevel || 'company',
      folderData.companyId,
      folderData.createdBy,
      folderData.color,
      folderData.icon,
      JSON.stringify(folderData.tags || [])
    ]);

    // Criar pasta correspondente no NextCloud
    await this.nextcloudClient.createFolder(fullPath);

    return result.rows[0];
  }

  async moveFile(fileId: string, targetFolderId: string, userId: string): Promise<void> {
    const file = await this.getFileById(fileId);
    const targetFolder = await this.getFolderById(targetFolderId);

    // Novo caminho de storage
    const newStoragePath = `${file.company_id}/${targetFolderId}/${file.internal_name}`;

    // Mover no MinIO
    await this.minioClient.copyObject(
      'documents',
      newStoragePath,
      `documents/${file.storage_path}`
    );
    await this.minioClient.removeObject('documents', file.storage_path);

    // Atualizar banco
    await this.db.query(`
      UPDATE documents.files 
      SET folder_id = $1, storage_path = $2, updated_at = NOW()
      WHERE id = $3
    `, [targetFolderId, newStoragePath, fileId]);

    // Log da atividade
    await this.logActivity({
      fileId,
      userId,
      action: 'move',
      details: {
        fromFolderId: file.folder_id,
        toFolderId: targetFolderId,
        newPath: newStoragePath
      }
    });
  }

  // ========== COMPARTILHAMENTO ==========

  async createShareLink(shareData: ShareLinkData): Promise<ShareLink> {
    const token = this.generateSecureToken();
    const urlSlug = shareData.customSlug || this.generateUrlSlug();

    const result = await this.db.query(`
      INSERT INTO documents.share_links 
        (file_id, token, url_slug, requires_password, password_hash, max_downloads, 
         allow_preview, allow_download, require_login, expires_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      shareData.fileId,
      token,
      urlSlug,
      shareData.requiresPassword || false,
      shareData.password ? await bcrypt.hash(shareData.password, 10) : null,
      shareData.maxDownloads,
      shareData.allowPreview !== false,
      shareData.allowDownload !== false,
      shareData.requireLogin || false,
      shareData.expiresAt,
      shareData.createdBy
    ]);

    const shareLink = result.rows[0];

    // Log da atividade
    await this.logActivity({
      fileId: shareData.fileId,
      userId: shareData.createdBy,
      action: 'share',
      details: {
        shareType: 'link',
        token,
        expiresAt: shareData.expiresAt
      }
    });

    return {
      ...shareLink,
      publicUrl: `https://app.kryonix.com.br/share/${urlSlug || token}`
    };
  }

  async accessSharedFile(token: string, password?: string): Promise<SharedFileAccess> {
    const shareLink = await this.db.query(`
      SELECT sl.*, f.original_name, f.file_size, f.mime_type, f.storage_path
      FROM documents.share_links sl
      JOIN documents.files f ON sl.file_id = f.id
      WHERE sl.token = $1 AND sl.is_active = true
    `, [token]);

    if (shareLink.rows.length === 0) {
      throw new Error('Link de compartilhamento não encontrado ou expirado');
    }

    const link = shareLink.rows[0];

    // Verificar expiração
    if (link.expires_at && new Date() > new Date(link.expires_at)) {
      throw new Error('Link de compartilhamento expirado');
    }

    // Verificar limite de downloads
    if (link.max_downloads && link.download_count >= link.max_downloads) {
      throw new Error('Limite de downloads atingido');
    }

    // Verificar senha se necessário
    if (link.requires_password) {
      if (!password) {
        throw new Error('Senha obrigatória');
      }
      
      const isValidPassword = await bcrypt.compare(password, link.password_hash);
      if (!isValidPassword) {
        throw new Error('Senha incorreta');
      }
    }

    // Incrementar contador de acesso
    await this.db.query(`
      UPDATE documents.share_links 
      SET access_count = access_count + 1, last_accessed = NOW()
      WHERE id = $1
    `, [link.id]);

    return {
      fileId: link.file_id,
      fileName: link.original_name,
      fileSize: link.file_size,
      mimeType: link.mime_type,
      allowPreview: link.allow_preview,
      allowDownload: link.allow_download,
      downloadUrl: link.allow_download ? this.generateDownloadUrl(link) : null,
      previewUrl: link.allow_preview ? this.generatePreviewUrl(link) : null
    };
  }

  // ========== BUSCA E FILTROS ==========

  async searchFiles(searchParams: FileSearchParams): Promise<SearchResult> {
    let whereConditions = ['f.company_id = $1'];
    let params = [searchParams.companyId];
    let paramCount = 1;

    // Busca por texto
    if (searchParams.query) {
      paramCount++;
      whereConditions.push(`(
        f.searchable_content @@ plainto_tsquery('portuguese', $${paramCount})
        OR f.original_name ILIKE '%' || $${paramCount} || '%'
        OR f.title ILIKE '%' || $${paramCount} || '%'
      )`);
      params.push(searchParams.query);
    }

    // Filtro por tipo
    if (searchParams.fileTypes && searchParams.fileTypes.length > 0) {
      paramCount++;
      whereConditions.push(`f.file_type = ANY($${paramCount})`);
      params.push(searchParams.fileTypes);
    }

    // Filtro por pasta
    if (searchParams.folderId) {
      paramCount++;
      whereConditions.push(`f.folder_id = $${paramCount}`);
      params.push(searchParams.folderId);
    }

    // Filtro por data
    if (searchParams.dateFrom) {
      paramCount++;
      whereConditions.push(`f.created_at >= $${paramCount}`);
      params.push(searchParams.dateFrom);
    }

    if (searchParams.dateTo) {
      paramCount++;
      whereConditions.push(`f.created_at <= $${paramCount}`);
      params.push(searchParams.dateTo);
    }

    // Filtro por tags
    if (searchParams.tags && searchParams.tags.length > 0) {
      paramCount++;
      whereConditions.push(`f.tags ?| $${paramCount}`);
      params.push(searchParams.tags);
    }

    const offset = (searchParams.page - 1) * searchParams.limit;
    const orderBy = searchParams.sortBy === 'name' ? 'f.original_name' :
                   searchParams.sortBy === 'size' ? 'f.file_size' :
                   searchParams.sortBy === 'type' ? 'f.file_type' :
                   'f.created_at';
    const orderDirection = searchParams.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        f.*,
        folder.name as folder_name,
        uploader.first_name || ' ' || uploader.last_name as uploaded_by_name,
        ts_rank(f.searchable_content, plainto_tsquery('portuguese', $2)) as search_rank
      FROM documents.files f
      LEFT JOIN documents.folders folder ON f.folder_id = folder.id
      LEFT JOIN auth.users uploader ON f.uploaded_by = uploader.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${searchParams.query ? 'search_rank DESC,' : ''} ${orderBy} ${orderDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(searchParams.limit, offset);

    const result = await this.db.query(query, params);

    // Contar total de resultados
    const countQuery = `
      SELECT COUNT(*) as total
      FROM documents.files f
      WHERE ${whereConditions.join(' AND ')}
    `;

    const countResult = await this.db.query(countQuery, params.slice(0, -2));

    return {
      files: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: searchParams.page,
      limit: searchParams.limit,
      totalPages: Math.ceil(countResult.rows[0].total / searchParams.limit)
    };
  }

  // ========== INTEGRAÇÃO COM STIRLING PDF ==========

  async processPdfDocument(fileId: string, operation: PdfOperation): Promise<ProcessingResult> {
    const file = await this.getFileById(fileId);
    
    if (file.file_type !== 'pdf') {
      throw new Error('Arquivo deve ser um PDF');
    }

    const fileBuffer = await this.getFileBuffer(file);
    
    try {
      let resultBuffer: Buffer;

      switch (operation.type) {
        case 'merge':
          resultBuffer = await this.stirlingPdfClient.merge(fileBuffer, operation.additionalFiles);
          break;
        case 'split':
          resultBuffer = await this.stirlingPdfClient.split(fileBuffer, operation.pageRanges);
          break;
        case 'compress':
          resultBuffer = await this.stirlingPdfClient.compress(fileBuffer, operation.quality);
          break;
        case 'watermark':
          resultBuffer = await this.stirlingPdfClient.addWatermark(fileBuffer, operation.watermarkText);
          break;
        case 'protect':
          resultBuffer = await this.stirlingPdfClient.protect(fileBuffer, operation.password);
          break;
        default:
          throw new Error(`Operação PDF não suportada: ${operation.type}`);
      }

      // Salvar arquivo processado
      const processedFile = await this.uploadFile({
        originalName: `${operation.type}_${file.original_name}`,
        buffer: resultBuffer,
        size: resultBuffer.length,
        mimeType: 'application/pdf',
        folderId: file.folder_id,
        companyId: file.company_id,
        uploadedBy: operation.userId,
        title: `${operation.type} - ${file.title}`,
        tags: [...(file.tags || []), 'processed', operation.type]
      });

      return {
        success: true,
        processedFileId: processedFile.id,
        originalSize: file.file_size,
        processedSize: resultBuffer.length,
        operation: operation.type
      };

    } catch (error) {
      throw new Error(`Erro no processamento PDF: ${error.message}`);
    }
  }
}
```

## 🎨 **COMPONENTES FRONTEND**
```tsx
// components/documents/FileManager.tsx
export const FileManager = () => {
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { files, folders, loading } = useDocuments(currentFolder?.id);
  const { uploadFiles, uploading } = useFileUpload();

  const breadcrumbItems = useMemo(() => {
    if (!currentFolder) return [{ name: 'Raiz', id: null }];
    
    const items = [];
    let folder = currentFolder;
    
    while (folder) {
      items.unshift({ name: folder.name, id: folder.id });
      folder = folder.parent;
    }
    
    items.unshift({ name: 'Raiz', id: null });
    return items;
  }, [currentFolder]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Breadcrumb>
              {breadcrumbItems.map((item, index) => (
                <BreadcrumbItem key={item.id || 'root'}>
                  <button
                    onClick={() => setCurrentFolder(item.id ? { id: item.id } : null)}
                    className="hover:text-blue-600"
                  >
                    {item.name}
                  </button>
                  {index < breadcrumbItems.length - 1 && (
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  )}
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          </div>

          <div className="flex items-center space-x-2">
            <FileSearch />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadModalOpen(true)}
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Novo
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCreateFolderOpen(true)}>
                  <FolderIcon className="h-4 w-4 mr-2" />
                  Nova Pasta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCreateDocumentOpen(true)}>
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  Novo Documento
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <GridIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Folders */}
              {folders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Pastas</h3>
                  <div className={cn(
                    viewMode === 'grid' 
                      ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
                      : 'space-y-2'
                  )}>
                    {folders.map(folder => (
                      <FolderItem
                        key={folder.id}
                        folder={folder}
                        viewMode={viewMode}
                        onOpen={() => setCurrentFolder(folder)}
                        onSelect={(selected) => {
                          if (selected) {
                            setSelectedFiles([...selectedFiles, folder.id]);
                          } else {
                            setSelectedFiles(selectedFiles.filter(id => id !== folder.id));
                          }
                        }}
                        isSelected={selectedFiles.includes(folder.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Arquivos</h3>
                  <div className={cn(
                    viewMode === 'grid' 
                      ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
                      : 'space-y-2'
                  )}>
                    {files.map(file => (
                      <FileItem
                        key={file.id}
                        file={file}
                        viewMode={viewMode}
                        onSelect={(selected) => {
                          if (selected) {
                            setSelectedFiles([...selectedFiles, file.id]);
                          } else {
                            setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                          }
                        }}
                        isSelected={selectedFiles.includes(file.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {folders.length === 0 && files.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <FolderOpenIcon className="h-16 w-16 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Esta pasta está vazia
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Comece fazendo upload de arquivos ou criando uma nova pasta
                  </p>
                  <Button onClick={() => setUploadModalOpen(true)}>
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Fazer Upload
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Selection Actions */}
      {selectedFiles.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedFiles.length} item(s) selecionado(s)
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <ShareIcon className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm">
                <MoveIcon className="h-4 w-4 mr-2" />
                Mover
              </Button>
              <Button variant="destructive" size="sm">
                <TrashIcon className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <FileUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        folderId={currentFolder?.id}
        onUpload={uploadFiles}
        uploading={uploading}
      />
    </div>
  );
};

// components/documents/FileItem.tsx
interface FileItemProps {
  file: FileDocument;
  viewMode: 'grid' | 'list';
  onSelect: (selected: boolean) => void;
  isSelected: boolean;
}

export const FileItem = ({ file, viewMode, onSelect, isSelected }: FileItemProps) => {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  
  const fileIcon = getFileIcon(file.file_type, file.mime_type);
  const fileSize = formatBytes(file.file_size);

  if (viewMode === 'grid') {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div className={cn(
            'group relative border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer',
            isSelected && 'ring-2 ring-blue-500 bg-blue-50'
          )}>
            <div className="flex flex-col items-center text-center">
              {/* Thumbnail/Icon */}
              <div className="w-16 h-16 mb-3 flex items-center justify-center">
                {file.thumbnail_path ? (
                  <img 
                    src={`/api/files/thumbnail/${file.id}`}
                    alt={file.original_name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {fileIcon}
                  </div>
                )}
              </div>

              {/* File Name */}
              <h4 className="text-sm font-medium text-gray-900 truncate w-full">
                {file.original_name}
              </h4>
              
              {/* File Size */}
              <p className="text-xs text-gray-500 mt-1">{fileSize}</p>
            </div>

            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <FileContextMenu file={file} />
              </DropdownMenu>
            </div>
          </div>
        </ContextMenuTrigger>
        <FileContextMenu file={file} />
      </ContextMenu>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className={cn(
          'flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer',
          isSelected && 'bg-blue-50'
        )}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mr-3"
          />
          
          <div className="w-8 h-8 mr-3 flex items-center justify-center text-gray-400">
            {fileIcon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {file.original_name}
            </h4>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(file.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
          
          <div className="text-sm text-gray-500 mr-4">
            {fileSize}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <FileContextMenu file={file} />
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <FileContextMenu file={file} />
    </ContextMenu>
  );
};
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Verificar serviços funcionando
curl -I https://cloud.kryonix.com.br
curl -I https://storage.kryonix.com.br/minio/health/live
curl -I https://pdf.kryonix.com.br

# 2. Criar schema de documentos
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f documents-schema.sql

# 3. Configurar bucket MinIO
mc alias set kryonix https://storage.kryonix.com.br kryonix Vitor@123456
mc mb kryonix/documents
mc mb kryonix/thumbnails
mc policy set public kryonix/thumbnails

# 4. Testar upload
curl -X POST https://api.kryonix.com.br/v1/documents/upload \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@test-document.pdf" \
  -F "folderId=123e4567-e89b-12d3-a456-426614174000"

# 5. Testar processamento PDF
curl -X POST https://api.kryonix.com.br/v1/documents/pdf/process \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "123e4567-e89b-12d3-a456-426614174000",
    "operation": {
      "type": "compress",
      "quality": "medium"
    }
  }'
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] Schema de documentos criado
- [ ] MinIO buckets configurados
- [ ] NextCloud integração funcionando
- [ ] Stirling PDF processamento ativo
- [ ] Upload de arquivos operacional
- [ ] Geração de thumbnails automática
- [ ] Extração de texto funcionando
- [ ] Sistema de busca implementado
- [ ] Compartilhamento de links funcionando
- [ ] Permissões de arquivo configuradas
- [ ] Interface de gestão criada
- [ ] Processamento de PDF ativo
- [ ] Logs de atividade registrando
- [ ] Integração com Docuseal

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de upload
npm run test:documents:upload

# Teste de processamento
npm run test:documents:processing

# Teste de busca
npm run test:documents:search

# Teste de compartilhamento
npm run test:documents:sharing

# Teste de permissões
npm run test:documents:permissions

# Teste de integração PDF
npm run test:documents:pdf-processing
```

---
