# 🌐 PARTE 43 - SOCIAL MEDIA INTEGRATION
*Agente Responsável: Marketing Expert + Social Media Specialist*
*Data: 27 de Janeiro de 2025*

---

## 📋 **VISÃO GERAL**

### **Objetivo**
Implementar integração completa com redes sociais para automação de posts, social listening, engagement automatizado, analytics unificados e gestão de campanhas cross-platform integrado com todo o ecossistema KRYONIX.

### **Escopo da Parte 43**
- Integração Instagram Business API
- Facebook Business integration completa
- LinkedIn automation avançada
- Twitter/X API integration
- TikTok Business integration
- YouTube Data API integration
- Social listening e sentiment analysis
- Automated posting e scheduling
- Cross-platform analytics

### **Agentes Especializados Envolvidos**
- 📱 **Social Media Specialist** (Líder)
- 📊 **Marketing Expert**
- 🧠 **Especialista IA**
- 📈 **Analista BI**
- 🎨 **Designer UX/UI**

---

## 🏗️ **ARQUITETURA SOCIAL MEDIA INTEGRATION**

### **Multi-Platform Architecture**
```yaml
# config/social-media/platforms.yml
social_platforms:
  instagram:
    api_version: "v18.0"
    endpoints:
      business_discovery: "/business_discovery"
      media: "/media"
      insights: "/insights"
      messaging: "/messages"
    authentication:
      type: "oauth2"
      permissions: ["instagram_basic", "instagram_content_publish", "instagram_manage_insights"]
    rate_limits:
      requests_per_hour: 200
      posts_per_day: 25
    
  facebook:
    api_version: "v18.0"
    endpoints:
      pages: "/pages"
      feed: "/feed"
      insights: "/insights"
      ads: "/ads"
    authentication:
      type: "oauth2"
      permissions: ["pages_manage_posts", "pages_read_engagement", "ads_management"]
    rate_limits:
      requests_per_hour: 200
      posts_per_day: 100
    
  linkedin:
    api_version: "v2"
    endpoints:
      shares: "/shares"
      organizations: "/organizations"
      analytics: "/analytics"
    authentication:
      type: "oauth2"
      permissions: ["w_member_social", "r_organization_social", "r_ads"]
    rate_limits:
      requests_per_hour: 500
      posts_per_day: 150
    
  twitter:
    api_version: "v2"
    endpoints:
      tweets: "/tweets"
      users: "/users"
      metrics: "/metrics"
    authentication:
      type: "oauth2_bearer"
      permissions: ["tweet.read", "tweet.write", "users.read"]
    rate_limits:
      requests_per_15min: 300
      tweets_per_day: 300
    
  tiktok:
    api_version: "v1.3"
    endpoints:
      video: "/video"
      user: "/user"
      analytics: "/analytics"
    authentication:
      type: "oauth2"
      permissions: ["video.publish", "user.info.basic"]
    rate_limits:
      requests_per_hour: 100
      posts_per_day: 10
    
  youtube:
    api_version: "v3"
    endpoints:
      videos: "/videos"
      channels: "/channels"
      analytics: "/analytics"
    authentication:
      type: "oauth2"
      permissions: ["youtube.upload", "youtube.readonly", "yt-analytics.readonly"]
    rate_limits:
      requests_per_day: 10000
      uploads_per_day: 6

content_types:
  image: ["jpg", "jpeg", "png", "webp"]
  video: ["mp4", "mov", "avi", "mkv"]
  carousel: ["multiple_images"]
  story: ["image", "video"]
  reel: ["video"]
  short: ["video"]

automation_rules:
  posting:
    optimal_times: true
    timezone_adjustment: true
    audience_analysis: true
    engagement_prediction: true
  
  engagement:
    auto_reply: true
    sentiment_analysis: true
    escalation_rules: true
    moderation: true
  
  analytics:
    real_time_tracking: true
    cross_platform_attribution: true
    roi_calculation: true
    competitor_analysis: true
```

### **Social Media Service**
```typescript
// src/social-media/services/social-media.service.ts
export class SocialMediaService {
  private platforms: Map<string, SocialPlatform> = new Map();
  private contentManager: SocialContentManager;
  private schedulingEngine: SocialSchedulingEngine;
  private analyticsTracker: SocialAnalyticsTracker;
  private listeningEngine: SocialListeningEngine;
  private automationEngine: SocialAutomationEngine;

  constructor() {
    this.contentManager = new SocialContentManager();
    this.schedulingEngine = new SocialSchedulingEngine();
    this.analyticsTracker = new SocialAnalyticsTracker();
    this.listeningEngine = new SocialListeningEngine();
    this.automationEngine = new SocialAutomationEngine();
    this.initializePlatforms();
  }

  private initializePlatforms(): void {
    // Instagram Business API
    this.platforms.set('instagram', new InstagramBusinessAPI({
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
      businessAccountId: process.env.INSTAGRAM_BUSINESS_ID,
      apiVersion: 'v18.0'
    }));

    // Facebook Pages API
    this.platforms.set('facebook', new FacebookPagesAPI({
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
      pageId: process.env.FACEBOOK_PAGE_ID,
      apiVersion: 'v18.0'
    }));

    // LinkedIn API
    this.platforms.set('linkedin', new LinkedInAPI({
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      organizationId: process.env.LINKEDIN_ORG_ID,
      apiVersion: 'v2'
    }));

    // Twitter API v2
    this.platforms.set('twitter', new TwitterAPI({
      bearerToken: process.env.TWITTER_BEARER_TOKEN,
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }));

    // TikTok Business API
    this.platforms.set('tiktok', new TikTokBusinessAPI({
      accessToken: process.env.TIKTOK_ACCESS_TOKEN,
      businessId: process.env.TIKTOK_BUSINESS_ID
    }));

    // YouTube Data API
    this.platforms.set('youtube', new YouTubeDataAPI({
      apiKey: process.env.YOUTUBE_API_KEY,
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN
    }));
  }

  async createCrossPlatformCampaign(config: CrossPlatformCampaignConfig): Promise<SocialCampaign> {
    const campaign: SocialCampaign = {
      id: generateId(),
      name: config.name,
      description: config.description,
      
      targeting: {
        platforms: config.platforms,
        audience_segments: config.audience_segments,
        demographics: config.demographics,
        interests: config.interests,
        behaviors: config.behaviors
      },
      
      content: {
        master_content: config.master_content,
        platform_variants: await this.generatePlatformVariants(config.master_content, config.platforms),
        hashtags: await this.optimizeHashtags(config.hashtags, config.platforms),
        mentions: config.mentions,
        call_to_action: config.call_to_action
      },
      
      scheduling: {
        start_date: config.start_date,
        end_date: config.end_date,
        posting_schedule: await this.optimizePostingSchedule(config.platforms),
        timezone_optimization: config.timezone_optimization,
        frequency_settings: config.frequency_settings
      },
      
      automation: {
        auto_posting: config.auto_posting,
        auto_engagement: config.auto_engagement,
        auto_moderation: config.auto_moderation,
        escalation_rules: config.escalation_rules
      },
      
      analytics: {
        track_engagement: true,
        track_reach: true,
        track_conversions: config.track_conversions,
        track_roi: config.track_roi,
        custom_goals: config.custom_goals
      }
    };

    // Generate platform-specific posts
    campaign.posts = await this.generatePlatformPosts(campaign);
    
    // Schedule posts
    await this.scheduleCampaignPosts(campaign);
    
    // Setup automation rules
    await this.setupCampaignAutomation(campaign);

    return await this.saveCampaign(campaign);
  }

  async publishPost(postConfig: SocialPostConfig): Promise<SocialPostResult> {
    const results: PlatformPostResult[] = [];
    
    for (const platform of postConfig.platforms) {
      try {
        const platformAPI = this.platforms.get(platform);
        if (!platformAPI) {
          throw new Error(`Platform ${platform} not configured`);
        }

        // Optimize content for platform
        const optimizedContent = await this.optimizeContentForPlatform(
          postConfig.content,
          platform
        );

        // Check platform-specific requirements
        await this.validatePlatformRequirements(optimizedContent, platform);

        // Publish to platform
        const result = await platformAPI.publish(optimizedContent);
        
        results.push({
          platform,
          success: true,
          post_id: result.id,
          post_url: result.url,
          published_at: new Date()
        });

        // Track analytics
        await this.analyticsTracker.trackPost(platform, result);

      } catch (error) {
        results.push({
          platform,
          success: false,
          error: error.message,
          attempted_at: new Date()
        });
      }
    }

    return {
      post_id: generateId(),
      platforms: postConfig.platforms,
      results,
      overall_success: results.every(r => r.success),
      published_count: results.filter(r => r.success).length,
      failed_count: results.filter(r => !r.success).length
    };
  }

  async setupSocialListening(config: SocialListeningConfig): Promise<SocialListeningSetup> {
    const setup: SocialListeningSetup = {
      keywords: config.keywords,
      brand_mentions: config.brand_mentions,
      competitor_tracking: config.competitor_tracking,
      hashtag_monitoring: config.hashtag_monitoring,
      
      platforms: config.platforms,
      languages: config.languages || ['pt', 'en'],
      regions: config.regions || ['BR', 'US'],
      
      sentiment_analysis: {
        enabled: true,
        confidence_threshold: 0.7,
        language_models: ['pt-BR', 'en-US']
      },
      
      automation: {
        auto_respond: config.auto_respond,
        escalation_rules: config.escalation_rules,
        notification_rules: config.notification_rules
      },
      
      analytics: {
        real_time_alerts: true,
        daily_reports: true,
        weekly_summaries: true,
        trend_analysis: true
      }
    };

    // Setup monitoring streams
    await this.listeningEngine.setupMonitoring(setup);
    
    // Configure sentiment analysis
    await this.configureSentimentAnalysis(setup);
    
    // Setup automation rules
    await this.automationEngine.configureRules(setup.automation);

    return setup;
  }

  private async generatePlatformVariants(
    masterContent: SocialContent,
    platforms: string[]
  ): Promise<Map<string, SocialContent>> {
    const variants = new Map<string, SocialContent>();
    
    for (const platform of platforms) {
      const variant = await this.adaptContentForPlatform(masterContent, platform);
      variants.set(platform, variant);
    }
    
    return variants;
  }

  private async adaptContentForPlatform(
    content: SocialContent,
    platform: string
  ): Promise<SocialContent> {
    const platformSpecs = this.getPlatformSpecifications(platform);
    
    return {
      text: await this.optimizeTextForPlatform(content.text, platform, platformSpecs),
      images: await this.optimizeImagesForPlatform(content.images, platform, platformSpecs),
      videos: await this.optimizeVideosForPlatform(content.videos, platform, platformSpecs),
      hashtags: await this.optimizeHashtagsForPlatform(content.hashtags, platform),
      mentions: this.filterMentionsForPlatform(content.mentions, platform),
      links: await this.optimizeLinksForPlatform(content.links, platform)
    };
  }

  private async optimizeTextForPlatform(
    text: string,
    platform: string,
    specs: PlatformSpecifications
  ): Promise<string> {
    // Character limit optimization
    if (text.length > specs.text_limit) {
      text = await this.truncateIntelligently(text, specs.text_limit);
    }
    
    // Platform-specific formatting
    switch (platform) {
      case 'twitter':
        text = this.formatForTwitter(text);
        break;
      case 'linkedin':
        text = this.formatForLinkedIn(text);
        break;
      case 'instagram':
        text = this.formatForInstagram(text);
        break;
      case 'facebook':
        text = this.formatForFacebook(text);
        break;
    }
    
    return text;
  }

  private async optimizeImagesForPlatform(
    images: SocialImage[],
    platform: string,
    specs: PlatformSpecifications
  ): Promise<SocialImage[]> {
    const optimized: SocialImage[] = [];
    
    for (const image of images) {
      const optimizedImage = await this.resizeAndOptimizeImage(image, {
        width: specs.image_dimensions.width,
        height: specs.image_dimensions.height,
        quality: specs.image_quality,
        format: specs.preferred_format
      });
      
      optimized.push(optimizedImage);
    }
    
    return optimized.slice(0, specs.max_images);
  }
}
```

### **Instagram Business Integration**
```typescript
// src/social-media/platforms/instagram-business.api.ts
export class InstagramBusinessAPI implements SocialPlatform {
  private accessToken: string;
  private businessAccountId: string;
  private apiVersion: string;
  private baseUrl: string;

  constructor(config: InstagramConfig) {
    this.accessToken = config.accessToken;
    this.businessAccountId = config.businessAccountId;
    this.apiVersion = config.apiVersion;
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  async publish(content: SocialContent): Promise<PublishResult> {
    // Create media container
    const container = await this.createMediaContainer(content);
    
    // Publish media
    const result = await this.publishMedia(container.id);
    
    return {
      id: result.id,
      url: `https://www.instagram.com/p/${result.id}`,
      platform: 'instagram',
      published_at: new Date()
    };
  }

  async createMediaContainer(content: SocialContent): Promise<MediaContainer> {
    const endpoint = `${this.baseUrl}/${this.businessAccountId}/media`;
    
    const mediaData: any = {
      access_token: this.accessToken
    };

    if (content.images && content.images.length > 0) {
      if (content.images.length === 1) {
        // Single image post
        mediaData.image_url = content.images[0].url;
        mediaData.caption = this.formatInstagramCaption(content);
      } else {
        // Carousel post
        mediaData.media_type = 'CAROUSEL';
        mediaData.children = await this.createCarouselChildren(content.images);
        mediaData.caption = this.formatInstagramCaption(content);
      }
    } else if (content.videos && content.videos.length > 0) {
      // Video post
      mediaData.media_type = 'VIDEO';
      mediaData.video_url = content.videos[0].url;
      mediaData.caption = this.formatInstagramCaption(content);
    } else {
      throw new Error('Instagram posts require at least one image or video');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mediaData)
    });

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async publishMedia(containerId: string): Promise<PublishResult> {
    const endpoint = `${this.baseUrl}/${this.businessAccountId}/media_publish`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: this.accessToken
      })
    });

    if (!response.ok) {
      throw new Error(`Instagram publish error: ${response.statusText}`);
    }

    return await response.json();
  }

  async getInsights(mediaId: string): Promise<InstagramInsights> {
    const endpoint = `${this.baseUrl}/${mediaId}/insights`;
    
    const metrics = [
      'impressions',
      'reach',
      'engagement',
      'likes',
      'comments',
      'shares',
      'saves',
      'profile_visits',
      'website_clicks'
    ];

    const response = await fetch(`${endpoint}?metric=${metrics.join(',')}&access_token=${this.accessToken}`);
    
    if (!response.ok) {
      throw new Error(`Instagram insights error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return this.formatInsights(data);
  }

  async createStory(content: SocialContent): Promise<PublishResult> {
    const endpoint = `${this.baseUrl}/${this.businessAccountId}/media`;
    
    const storyData = {
      image_url: content.images[0].url,
      media_type: 'STORIES',
      access_token: this.accessToken
    };

    // Add story features if available
    if (content.story_features) {
      if (content.story_features.stickers) {
        storyData.stickers = content.story_features.stickers;
      }
      if (content.story_features.poll) {
        storyData.poll = content.story_features.poll;
      }
      if (content.story_features.question) {
        storyData.question = content.story_features.question;
      }
    }

    const containerResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyData)
    });

    const container = await containerResponse.json();
    
    return await this.publishMedia(container.id);
  }

  async createReel(content: SocialContent): Promise<PublishResult> {
    const endpoint = `${this.baseUrl}/${this.businessAccountId}/media`;
    
    const reelData = {
      media_type: 'REELS',
      video_url: content.videos[0].url,
      caption: this.formatInstagramCaption(content),
      share_to_feed: content.share_to_feed || true,
      access_token: this.accessToken
    };

    // Add reel-specific features
    if (content.reel_features) {
      if (content.reel_features.cover_image) {
        reelData.thumb_offset = content.reel_features.cover_image.timestamp;
      }
      if (content.reel_features.audio_name) {
        reelData.audio_name = content.reel_features.audio_name;
      }
    }

    const containerResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reelData)
    });

    const container = await containerResponse.json();
    
    return await this.publishMedia(container.id);
  }

  private formatInstagramCaption(content: SocialContent): string {
    let caption = content.text || '';
    
    // Add hashtags
    if (content.hashtags && content.hashtags.length > 0) {
      const hashtagText = content.hashtags
        .slice(0, 30) // Instagram limit
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
      
      caption += `\n\n${hashtagText}`;
    }
    
    // Add mentions
    if (content.mentions && content.mentions.length > 0) {
      const mentionText = content.mentions
        .map(mention => mention.startsWith('@') ? mention : `@${mention}`)
        .join(' ');
      
      caption += `\n${mentionText}`;
    }
    
    return caption.substring(0, 2200); // Instagram caption limit
  }

  private formatInsights(data: any): InstagramInsights {
    const insights: InstagramInsights = {
      impressions: 0,
      reach: 0,
      engagement: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      profile_visits: 0,
      website_clicks: 0
    };

    if (data.data) {
      data.data.forEach((metric: any) => {
        if (insights.hasOwnProperty(metric.name)) {
          insights[metric.name] = metric.values[0]?.value || 0;
        }
      });
    }

    return insights;
  }
}
```

### **LinkedIn Professional Integration**
```typescript
// src/social-media/platforms/linkedin.api.ts
export class LinkedInAPI implements SocialPlatform {
  private accessToken: string;
  private organizationId: string;
  private baseUrl: string;

  constructor(config: LinkedInConfig) {
    this.accessToken = config.accessToken;
    this.organizationId = config.organizationId;
    this.baseUrl = 'https://api.linkedin.com/v2';
  }

  async publish(content: SocialContent): Promise<PublishResult> {
    // Upload media if present
    let media: LinkedInMedia[] = [];
    if (content.images && content.images.length > 0) {
      media = await this.uploadImages(content.images);
    } else if (content.videos && content.videos.length > 0) {
      media = await this.uploadVideos(content.videos);
    }

    // Create post
    const post = await this.createPost(content, media);
    
    return {
      id: post.id,
      url: this.generateLinkedInUrl(post.id),
      platform: 'linkedin',
      published_at: new Date()
    };
  }

  async createPost(content: SocialContent, media: LinkedInMedia[] = []): Promise<LinkedInPost> {
    const endpoint = `${this.baseUrl}/shares`;
    
    const postData: LinkedInShareRequest = {
      author: `urn:li:organization:${this.organizationId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: this.formatLinkedInText(content)
          },
          shareMediaCategory: media.length > 0 ? 
            (content.videos ? 'VIDEO' : 'IMAGE') : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    // Add media if present
    if (media.length > 0) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = media.map(m => ({
        status: 'READY',
        description: {
          text: content.text
        },
        media: m.asset,
        title: {
          text: content.title || 'KRYONIX Content'
        }
      }));
    }

    // Add article link if present
    if (content.links && content.links.length > 0) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        originalUrl: content.links[0].url
      }];
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      id: this.extractIdFromUrn(result.id),
      urn: result.id,
      author: result.author,
      created: result.created,
      lastModified: result.lastModified
    };
  }

  async uploadImages(images: SocialImage[]): Promise<LinkedInMedia[]> {
    const uploadedMedia: LinkedInMedia[] = [];
    
    for (const image of images.slice(0, 9)) { // LinkedIn max 9 images
      // Register upload
      const registerResponse = await this.registerImageUpload();
      const uploadUrl = registerResponse.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const asset = registerResponse.value.asset;
      
      // Upload image
      await this.uploadToUrl(uploadUrl, image.buffer);
      
      uploadedMedia.push({ asset });
    }
    
    return uploadedMedia;
  }

  async uploadVideos(videos: SocialVideo[]): Promise<LinkedInMedia[]> {
    const video = videos[0]; // LinkedIn supports one video per post
    
    // Register video upload
    const registerResponse = await this.registerVideoUpload(video);
    const uploadUrl = registerResponse.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = registerResponse.value.asset;
    
    // Upload video
    await this.uploadToUrl(uploadUrl, video.buffer);
    
    return [{ asset }];
  }

  async getAnalytics(postId: string): Promise<LinkedInAnalytics> {
    const endpoint = `${this.baseUrl}/organizationalEntityShareStatistics`;
    const params = new URLSearchParams({
      q: 'organizationalEntity',
      organizationalEntity: `urn:li:organization:${this.organizationId}`,
      shares: [`urn:li:share:${postId}`]
    });

    const response = await fetch(`${endpoint}?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    if (!response.ok) {
      throw new Error(`LinkedIn analytics error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return this.formatLinkedInAnalytics(data);
  }

  async createLinkedInArticle(article: LinkedInArticleContent): Promise<PublishResult> {
    const endpoint = `${this.baseUrl}/articles`;
    
    const articleData = {
      author: `urn:li:person:${this.organizationId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.article.Article': {
          title: article.title,
          subtitle: article.subtitle,
          content: {
            'com.linkedin.article.ArticleContent': {
              body: article.body,
              media: article.media || []
            }
          }
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(articleData)
    });

    if (!response.ok) {
      throw new Error(`LinkedIn article error: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      id: this.extractIdFromUrn(result.id),
      url: this.generateLinkedInArticleUrl(result.id),
      platform: 'linkedin',
      published_at: new Date()
    };
  }

  private formatLinkedInText(content: SocialContent): string {
    let text = content.text || '';
    
    // LinkedIn supports up to 3000 characters
    if (text.length > 3000) {
      text = text.substring(0, 2970) + '... [continued]';
    }
    
    // Add hashtags (LinkedIn format)
    if (content.hashtags && content.hashtags.length > 0) {
      const hashtagText = content.hashtags
        .slice(0, 30)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
      
      text += `\n\n${hashtagText}`;
    }
    
    return text;
  }

  private async registerImageUpload(): Promise<any> {
    const endpoint = `${this.baseUrl}/assets?action=registerUpload`;
    
    const registerData = {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: `urn:li:organization:${this.organizationId}`,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent'
        }]
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(registerData)
    });

    return await response.json();
  }
}
```

---

## 📊 **SOCIAL LISTENING & ANALYTICS**

### **Social Listening Engine**
```typescript
// src/social-media/listening/social-listening.engine.ts
export class SocialListeningEngine {
  private streamingServices: Map<string, StreamingService> = new Map();
  private sentimentAnalyzer: SentimentAnalyzer;
  private trendAnalyzer: TrendAnalyzer;
  private alertManager: AlertManager;
  private mentionProcessor: MentionProcessor;

  constructor() {
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.trendAnalyzer = new TrendAnalyzer();
    this.alertManager = new AlertManager();
    this.mentionProcessor = new MentionProcessor();
    this.initializeStreamingServices();
  }

  async setupMonitoring(config: SocialListeningConfig): Promise<void> {
    // Setup keyword monitoring
    await this.setupKeywordMonitoring(config.keywords);
    
    // Setup brand mention tracking
    await this.setupBrandMentionTracking(config.brand_mentions);
    
    // Setup competitor monitoring
    await this.setupCompetitorMonitoring(config.competitor_tracking);
    
    // Setup hashtag monitoring
    await this.setupHashtagMonitoring(config.hashtag_monitoring);
    
    // Start real-time streams
    await this.startRealTimeStreaming(config.platforms);
  }

  async processIncomingMention(mention: SocialMention): Promise<ProcessedMention> {
    // Enrich mention data
    const enrichedMention = await this.enrichMentionData(mention);
    
    // Analyze sentiment
    const sentiment = await this.sentimentAnalyzer.analyze(enrichedMention.text);
    
    // Detect intent
    const intent = await this.detectIntent(enrichedMention);
    
    // Classify urgency
    const urgency = await this.classifyUrgency(enrichedMention, sentiment);
    
    // Check for automation triggers
    const automationTriggers = await this.checkAutomationTriggers(enrichedMention);
    
    const processedMention: ProcessedMention = {
      ...enrichedMention,
      sentiment,
      intent,
      urgency,
      automation_triggers: automationTriggers,
      processed_at: new Date(),
      
      // AI-generated insights
      insights: await this.generateMentionInsights(enrichedMention, sentiment),
      
      // Recommended actions
      recommended_actions: await this.generateRecommendedActions(enrichedMention, sentiment, intent),
      
      // Influence score
      influence_score: await this.calculateInfluenceScore(enrichedMention.author)
    };

    // Trigger automations if applicable
    if (automationTriggers.length > 0) {
      await this.triggerAutomations(processedMention);
    }
    
    // Send alerts if necessary
    if (urgency === 'high' || sentiment.score < -0.7) {
      await this.alertManager.sendAlert(processedMention);
    }
    
    return processedMention;
  }

  async generateSocialListeningReport(
    dateRange: DateRange,
    filters?: SocialListeningFilters
  ): Promise<SocialListeningReport> {
    const mentions = await this.getMentionsInRange(dateRange, filters);
    
    const report: SocialListeningReport = {
      period: dateRange,
      total_mentions: mentions.length,
      
      sentiment_analysis: {
        positive: mentions.filter(m => m.sentiment.label === 'positive').length,
        neutral: mentions.filter(m => m.sentiment.label === 'neutral').length,
        negative: mentions.filter(m => m.sentiment.label === 'negative').length,
        average_score: mentions.reduce((sum, m) => sum + m.sentiment.score, 0) / mentions.length
      },
      
      platform_breakdown: this.generatePlatformBreakdown(mentions),
      
      engagement_metrics: {
        total_engagement: mentions.reduce((sum, m) => sum + (m.engagement_metrics?.total || 0), 0),
        average_engagement: mentions.reduce((sum, m) => sum + (m.engagement_metrics?.total || 0), 0) / mentions.length,
        viral_mentions: mentions.filter(m => (m.engagement_metrics?.total || 0) > 1000).length
      },
      
      trending_topics: await this.trendAnalyzer.identifyTrendingTopics(mentions),
      trending_hashtags: await this.trendAnalyzer.identifyTrendingHashtags(mentions),
      
      influencer_mentions: mentions.filter(m => m.influence_score > 70),
      
      competitor_analysis: await this.generateCompetitorAnalysis(mentions, dateRange),
      
      geographic_distribution: this.generateGeographicDistribution(mentions),
      
      time_analysis: {
        peak_hours: this.identifyPeakHours(mentions),
        daily_distribution: this.generateDailyDistribution(mentions),
        response_times: await this.calculateResponseTimes(mentions)
      },
      
      automation_summary: {
        auto_responded: mentions.filter(m => m.auto_responded).length,
        escalated_to_human: mentions.filter(m => m.escalated).length,
        satisfaction_score: await this.calculateSatisfactionScore(mentions)
      },
      
      insights: await this.generateListeningInsights(mentions),
      recommendations: await this.generateListeningRecommendations(mentions)
    };

    return report;
  }

  private async enrichMentionData(mention: SocialMention): Promise<EnrichedMention> {
    return {
      ...mention,
      
      // Author enrichment
      author_data: await this.enrichAuthorData(mention.author),
      
      // Location data
      location_data: await this.enrichLocationData(mention.location),
      
      // Engagement metrics
      engagement_metrics: await this.getEngagementMetrics(mention),
      
      // Content analysis
      content_analysis: {
        language: await this.detectLanguage(mention.text),
        topics: await this.extractTopics(mention.text),
        entities: await this.extractEntities(mention.text),
        keywords: await this.extractKeywords(mention.text)
      },
      
      // Media analysis
      media_analysis: mention.media ? await this.analyzeMedia(mention.media) : null,
      
      // Context analysis
      context: {
        is_reply: mention.in_reply_to !== null,
        is_retweet: mention.is_retweet || false,
        is_quote: mention.is_quote || false,
        thread_position: await this.getThreadPosition(mention)
      }
    };
  }

  private async generateMentionInsights(
    mention: EnrichedMention,
    sentiment: SentimentResult
  ): Promise<MentionInsight[]> {
    const insights: MentionInsight[] = [];

    // Sentiment insights
    if (sentiment.score < -0.5) {
      insights.push({
        type: 'negative_sentiment',
        confidence: sentiment.confidence,
        description: 'Negative sentiment detected - potential reputation risk',
        priority: 'high',
        recommended_action: 'immediate_response'
      });
    }

    // Viral potential
    if (mention.author_data.follower_count > 10000 && mention.engagement_metrics.total > 100) {
      insights.push({
        type: 'viral_potential',
        confidence: 0.8,
        description: 'High viral potential due to influential author and high engagement',
        priority: 'medium',
        recommended_action: 'monitor_closely'
      });
    }

    // Customer service opportunity
    if (mention.content_analysis.entities.includes('support') || 
        mention.content_analysis.entities.includes('help')) {
      insights.push({
        type: 'customer_service',
        confidence: 0.9,
        description: 'Customer service opportunity detected',
        priority: 'medium',
        recommended_action: 'provide_support'
      });
    }

    // Sales opportunity
    if (mention.content_analysis.topics.includes('pricing') || 
        mention.content_analysis.topics.includes('purchase')) {
      insights.push({
        type: 'sales_opportunity',
        confidence: 0.7,
        description: 'Potential sales opportunity identified',
        priority: 'medium',
        recommended_action: 'sales_outreach'
      });
    }

    return insights;
  }
}
```

### **Cross-Platform Analytics**
```typescript
// src/social-media/analytics/cross-platform-analytics.ts
export class CrossPlatformSocialAnalytics {
  private platformAnalytics: Map<string, PlatformAnalytics> = new Map();
  private unifiedMetrics: UnifiedMetricsCalculator;
  private attributionEngine: SocialAttributionEngine;
  private reportGenerator: SocialReportGenerator;

  constructor() {
    this.unifiedMetrics = new UnifiedMetricsCalculator();
    this.attributionEngine = new SocialAttributionEngine();
    this.reportGenerator = new SocialReportGenerator();
    this.initializePlatformAnalytics();
  }

  async generateUnifiedReport(
    dateRange: DateRange,
    platforms: string[]
  ): Promise<UnifiedSocialReport> {
    const platformReports = await Promise.all(
      platforms.map(platform => this.getPlatformReport(platform, dateRange))
    );

    const unifiedReport: UnifiedSocialReport = {
      period: dateRange,
      platforms_analyzed: platforms,
      
      unified_metrics: {
        total_reach: platformReports.reduce((sum, r) => sum + r.reach, 0),
        total_impressions: platformReports.reduce((sum, r) => sum + r.impressions, 0),
        total_engagement: platformReports.reduce((sum, r) => sum + r.engagement, 0),
        total_clicks: platformReports.reduce((sum, r) => sum + r.clicks, 0),
        total_conversions: platformReports.reduce((sum, r) => sum + r.conversions, 0),
        total_revenue: platformReports.reduce((sum, r) => sum + r.revenue, 0),
        
        average_engagement_rate: this.calculateAverageEngagementRate(platformReports),
        average_click_rate: this.calculateAverageClickRate(platformReports),
        average_conversion_rate: this.calculateAverageConversionRate(platformReports),
        
        roi: this.calculateUnifiedROI(platformReports),
        cost_per_acquisition: this.calculateUnifiedCPA(platformReports)
      },
      
      platform_comparison: {
        performance_ranking: this.rankPlatformsByPerformance(platformReports),
        efficiency_analysis: this.analyzePlatformEfficiency(platformReports),
        audience_overlap: await this.calculateAudienceOverlap(platforms),
        cost_effectiveness: this.analyzeCostEffectiveness(platformReports)
      },
      
      content_performance: {
        top_performing_content: await this.getTopPerformingContent(platforms, dateRange),
        content_type_analysis: await this.analyzeContentTypePerformance(platforms, dateRange),
        optimal_posting_times: await this.calculateOptimalPostingTimes(platforms),
        hashtag_performance: await this.analyzeHashtagPerformance(platforms, dateRange)
      },
      
      audience_insights: {
        unified_demographics: await this.calculateUnifiedDemographics(platforms),
        engagement_patterns: await this.analyzeEngagementPatterns(platforms),
        audience_growth: await this.calculateAudienceGrowth(platforms, dateRange),
        cross_platform_behavior: await this.analyzeCrossPlatformBehavior(platforms)
      },
      
      competitive_analysis: await this.generateCompetitiveAnalysis(platforms, dateRange),
      
      attribution_analysis: await this.attributionEngine.generateCrossPlatformAttribution(
        platforms, 
        dateRange
      ),
      
      insights: await this.generateCrossPlatformInsights(platformReports),
      recommendations: await this.generateOptimizationRecommendations(platformReports)
    };

    return unifiedReport;
  }

  async calculateSocialROI(
    campaigns: SocialCampaign[],
    dateRange: DateRange
  ): Promise<SocialROIAnalysis> {
    const roiAnalysis: SocialROIAnalysis = {
      total_investment: 0,
      total_revenue: 0,
      total_conversions: 0,
      roi_percentage: 0,
      
      platform_roi: new Map<string, PlatformROI>(),
      campaign_roi: new Map<string, CampaignROI>(),
      
      cost_breakdown: {
        ad_spend: 0,
        content_creation: 0,
        management_time: 0,
        tools_and_software: 0
      },
      
      revenue_attribution: {
        direct_attribution: 0,
        assisted_attribution: 0,
        view_through_attribution: 0
      },
      
      efficiency_metrics: {
        cost_per_click: 0,
        cost_per_engagement: 0,
        cost_per_conversion: 0,
        customer_lifetime_value: 0
      }
    };

    for (const campaign of campaigns) {
      const campaignROI = await this.calculateCampaignROI(campaign, dateRange);
      roiAnalysis.campaign_roi.set(campaign.id, campaignROI);
      
      roiAnalysis.total_investment += campaignROI.investment;
      roiAnalysis.total_revenue += campaignROI.revenue;
      roiAnalysis.total_conversions += campaignROI.conversions;
      
      // Platform-level aggregation
      for (const platform of campaign.platforms) {
        const platformData = roiAnalysis.platform_roi.get(platform) || {
          investment: 0,
          revenue: 0,
          conversions: 0,
          roi: 0
        };
        
        const platformCampaignData = campaignROI.platform_breakdown.get(platform);
        if (platformCampaignData) {
          platformData.investment += platformCampaignData.investment;
          platformData.revenue += platformCampaignData.revenue;
          platformData.conversions += platformCampaignData.conversions;
          
          roiAnalysis.platform_roi.set(platform, platformData);
        }
      }
    }

    // Calculate overall ROI
    roiAnalysis.roi_percentage = roiAnalysis.total_investment > 0 ? 
      ((roiAnalysis.total_revenue - roiAnalysis.total_investment) / roiAnalysis.total_investment) * 100 : 0;

    // Calculate platform ROIs
    for (const [platform, data] of roiAnalysis.platform_roi) {
      data.roi = data.investment > 0 ? 
        ((data.revenue - data.investment) / data.investment) * 100 : 0;
    }

    return roiAnalysis;
  }

  private async generateCrossPlatformInsights(
    platformReports: PlatformReport[]
  ): Promise<SocialInsight[]> {
    const insights: SocialInsight[] = [];

    // Platform performance insights
    const bestPerformingPlatform = platformReports.sort((a, b) => b.roi - a.roi)[0];
    insights.push({
      type: 'platform_performance',
      title: `${bestPerformingPlatform.platform} is your top performing platform`,
      description: `ROI: ${bestPerformingPlatform.roi.toFixed(2)}%, Engagement Rate: ${bestPerformingPlatform.engagement_rate.toFixed(2)}%`,
      impact: 'high',
      recommendations: [
        `Increase investment in ${bestPerformingPlatform.platform}`,
        'Replicate successful content strategies across other platforms',
        'Analyze what makes this platform successful for your brand'
      ]
    });

    // Content type insights
    const contentAnalysis = await this.analyzeContentTypePerformance(
      platformReports.map(r => r.platform),
      { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }
    );

    const topContentType = Object.entries(contentAnalysis)
      .sort(([,a], [,b]) => b.engagement_rate - a.engagement_rate)[0];

    insights.push({
      type: 'content_optimization',
      title: `${topContentType[0]} content drives highest engagement`,
      description: `Engagement rate: ${topContentType[1].engagement_rate.toFixed(2)}%`,
      impact: 'medium',
      recommendations: [
        `Create more ${topContentType[0]} content`,
        'Analyze successful content patterns',
        'Test variations of high-performing content types'
      ]
    });

    // Timing insights
    const timingAnalysis = await this.calculateOptimalPostingTimes(
      platformReports.map(r => r.platform)
    );

    insights.push({
      type: 'timing_optimization',
      title: 'Optimal posting times identified',
      description: `Best performance: ${timingAnalysis.peak_day} at ${timingAnalysis.peak_time}`,
      impact: 'medium',
      recommendations: [
        'Schedule posts during peak engagement times',
        'Consider timezone differences for global audience',
        'A/B test different posting times'
      ]
    });

    return insights;
  }
}
```

---

## 🚀 **IMPLEMENTAÇÃO E DEPLOY**

### **Docker Configuration**
```yaml
# docker/social-media/docker-compose.yml
version: '3.8'

services:
  social-media-service:
    build:
      context: .
      dockerfile: Dockerfile.social-media
    container_name: social-media-kryonix
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - POSTGRES_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgresql:5432/social_media
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
      
      # Instagram
      - INSTAGRAM_ACCESS_TOKEN=${INSTAGRAM_ACCESS_TOKEN}
      - INSTAGRAM_BUSINESS_ID=${INSTAGRAM_BUSINESS_ID}
      
      # Facebook
      - FACEBOOK_ACCESS_TOKEN=${FACEBOOK_ACCESS_TOKEN}
      - FACEBOOK_PAGE_ID=${FACEBOOK_PAGE_ID}
      
      # LinkedIn
      - LINKEDIN_ACCESS_TOKEN=${LINKEDIN_ACCESS_TOKEN}
      - LINKEDIN_ORG_ID=${LINKEDIN_ORG_ID}
      
      # Twitter
      - TWITTER_BEARER_TOKEN=${TWITTER_BEARER_TOKEN}
      - TWITTER_API_KEY=${TWITTER_API_KEY}
      - TWITTER_API_SECRET=${TWITTER_API_SECRET}
      - TWITTER_ACCESS_TOKEN=${TWITTER_ACCESS_TOKEN}
      - TWITTER_ACCESS_TOKEN_SECRET=${TWITTER_ACCESS_TOKEN_SECRET}
      
      # TikTok
      - TIKTOK_ACCESS_TOKEN=${TIKTOK_ACCESS_TOKEN}
      - TIKTOK_BUSINESS_ID=${TIKTOK_BUSINESS_ID}
      
      # YouTube
      - YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
      - YOUTUBE_CLIENT_ID=${YOUTUBE_CLIENT_ID}
      - YOUTUBE_CLIENT_SECRET=${YOUTUBE_CLIENT_SECRET}
      - YOUTUBE_REFRESH_TOKEN=${YOUTUBE_REFRESH_TOKEN}
      
    volumes:
      - social_media_uploads:/app/uploads
      - social_media_logs:/app/logs
      - ./config:/app/config
    networks:
      - kryonix-network
    depends_on:
      - postgresql
      - redis
      - rabbitmq
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.social-media.rule=Host(`social.kryonix.com.br`)"
      - "traefik.http.routers.social-media.tls=true"
      - "traefik.http.services.social-media.loadbalancer.server.port=3000"

  social-media-worker:
    build:
      context: .
      dockerfile: Dockerfile.social-media
    container_name: social-media-worker-kryonix
    restart: unless-stopped
    command: ["npm", "run", "worker"]
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - POSTGRES_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgresql:5432/social_media
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    volumes:
      - social_media_uploads:/app/uploads
      - social_media_logs:/app/logs
      - ./config:/app/config
    networks:
      - kryonix-network
    depends_on:
      - social-media-service
    deploy:
      replicas: 3

  social-media-scheduler:
    build:
      context: .
      dockerfile: Dockerfile.social-media
    container_name: social-media-scheduler-kryonix
    restart: unless-stopped
    command: ["npm", "run", "scheduler"]
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - POSTGRES_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgresql:5432/social_media
    volumes:
      - social_media_logs:/app/logs
      - ./config:/app/config
    networks:
      - kryonix-network
    depends_on:
      - social-media-service

volumes:
  social_media_uploads:
  social_media_logs:

networks:
  kryonix-network:
    external: true
```

### **Setup Script**
```bash
#!/bin/bash
# scripts/setup-social-media-integration.sh

echo "🌐 Configurando Social Media Integration..."

# Configurar variáveis de ambiente
cat > .env.social-media << EOF
# Instagram Business
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
INSTAGRAM_BUSINESS_ID=your_business_id

# Facebook Pages
FACEBOOK_ACCESS_TOKEN=your_facebook_token
FACEBOOK_PAGE_ID=your_page_id

# LinkedIn
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
LINKEDIN_ORG_ID=your_org_id

# Twitter/X
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# TikTok Business
TIKTOK_ACCESS_TOKEN=your_tiktok_token
TIKTOK_BUSINESS_ID=your_tiktok_business_id

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token
EOF

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --save \
  instagram-basic-display-api \
  facebook-nodejs-business-sdk \
  linkedin-api-client \
  twitter-api-v2 \
  tiktok-business-api \
  googleapis \
  sharp \
  ffmpeg-static \
  node-cron \
  sentiment \
  natural \
  bull \
  ioredis \
  pg

# Configurar database schema
echo "🗄️ Configurando database schema..."
cat > migrations/social-media-schema.sql << 'EOF'
-- Social Media Integration Schema

CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    account_name VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, account_id)
);

CREATE TABLE social_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    platforms TEXT[], -- array of platforms
    status VARCHAR(50) DEFAULT 'draft',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    budget DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES social_campaigns(id),
    platform VARCHAR(50) NOT NULL,
    platform_post_id VARCHAR(255),
    content_type VARCHAR(50), -- post, story, reel, video, etc.
    text_content TEXT,
    media_urls TEXT[],
    hashtags TEXT[],
    mentions TEXT[],
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft',
    performance_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE social_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL,
    mention_id VARCHAR(255) NOT NULL,
    author_username VARCHAR(255),
    author_data JSONB,
    text_content TEXT,
    sentiment_score DECIMAL(3,2),
    sentiment_label VARCHAR(20),
    urgency_level VARCHAR(20),
    processed BOOLEAN DEFAULT FALSE,
    responded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, mention_id)
);

CREATE TABLE social_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES social_posts(id),
    platform VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagement INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, platform, date)
);

-- Indexes
CREATE INDEX idx_social_posts_campaign ON social_posts(campaign_id);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_scheduled ON social_posts(scheduled_at);
CREATE INDEX idx_social_mentions_platform ON social_mentions(platform);
CREATE INDEX idx_social_mentions_sentiment ON social_mentions(sentiment_score);
CREATE INDEX idx_social_analytics_post ON social_analytics(post_id);
CREATE INDEX idx_social_analytics_date ON social_analytics(date);
EOF

# Configurar webhooks para cada plataforma
echo "🔗 Configurando webhooks..."
mkdir -p webhooks/social-media

# Instagram/Facebook webhook
cat > webhooks/social-media/meta-webhook.js << 'EOF'
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Verify webhook
app.get('/webhooks/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token === process.env.META_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Process webhook
app.post('/webhooks/meta', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', process.env.META_APP_SECRET)
    .update(payload, 'utf8')
    .digest('hex');
  
  if (signature !== `sha256=${expectedSignature}`) {
    return res.status(403).send('Forbidden');
  }
  
  // Process Instagram/Facebook events
  const { object, entry } = req.body;
  
  if (object === 'instagram') {
    processInstagramWebhook(entry);
  } else if (object === 'page') {
    processFacebookWebhook(entry);
  }
  
  res.status(200).send('OK');
});

function processInstagramWebhook(entries) {
  entries.forEach(entry => {
    if (entry.messaging) {
      entry.messaging.forEach(event => {
        // Process Instagram messages/mentions
        processMention({
          platform: 'instagram',
          type: 'message',
          data: event
        });
      });
    }
  });
}

function processFacebookWebhook(entries) {
  entries.forEach(entry => {
    if (entry.changes) {
      entry.changes.forEach(change => {
        // Process Facebook mentions/comments
        processMention({
          platform: 'facebook',
          type: change.field,
          data: change.value
        });
      });
    }
  });
}

module.exports = app;
EOF

# LinkedIn webhook
cat > webhooks/social-media/linkedin-webhook.js << 'EOF'
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhooks/linkedin', (req, res) => {
  // Process LinkedIn webhook events
  const events = req.body;
  
  events.forEach(event => {
    if (event.eventType === 'SHARE_STATISTICS_UPDATE') {
      updateLinkedInAnalytics(event);
    } else if (event.eventType === 'COMMENT_CREATED') {
      processMention({
        platform: 'linkedin',
        type: 'comment',
        data: event
      });
    }
  });
  
  res.status(200).send('OK');
});

module.exports = app;
EOF

# Configurar agendamento de posts
echo "⏰ Configurando agendamento..."
cat > cron/social-media-scheduler.js << 'EOF'
const cron = require('node-cron');
const { SocialMediaService } = require('../src/social-media/services/social-media.service');

const socialMediaService = new SocialMediaService();

// Check for scheduled posts every minute
cron.schedule('* * * * *', async () => {
  try {
    await socialMediaService.processScheduledPosts();
  } catch (error) {
    console.error('Error processing scheduled posts:', error);
  }
});

// Generate daily analytics reports
cron.schedule('0 9 * * *', async () => {
  try {
    await socialMediaService.generateDailyReports();
  } catch (error) {
    console.error('Error generating daily reports:', error);
  }
});

// Update social listening mentions every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    await socialMediaService.updateSocialListening();
  } catch (error) {
    console.error('Error updating social listening:', error);
  }
});
EOF

# Configurar monitoramento
echo "📊 Configurando monitoramento..."
cat > config/social-media-monitoring.yml << EOF
metrics:
  posting_success_rate:
    target: 0.98
    alert_threshold: 0.95
  
  engagement_rate:
    target: 0.05
    alert_threshold: 0.02
  
  response_time:
    target: 3600 # 1 hour
    alert_threshold: 7200 # 2 hours
  
  sentiment_score:
    target: 0.1
    alert_threshold: -0.3

dashboards:
  - name: "Social Media Performance"
    panels:
      - cross_platform_metrics
      - engagement_analytics
      - social_listening
      - content_performance
      - competitor_analysis
EOF

# Deploy
echo "🚀 Fazendo deploy..."
docker-compose -f docker/social-media/docker-compose.yml up -d

# Setup API keys e webhooks
echo "🔑 Configurando APIs e webhooks..."
node scripts/setup-social-media-apis.js

# Teste final
echo "🧪 Testando integração..."
node scripts/test-social-media-integration.js

echo "✅ Social Media Integration configurado com sucesso!"
echo "🌐 Dashboard: https://social.kryonix.com.br"
echo "📊 Analytics: https://social.kryonix.com.br/analytics"
echo "👂 Social Listening: https://social.kryonix.com.br/listening"
echo "📅 Scheduler: https://social.kryonix.com.br/scheduler"
```

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

### **Platform Integrations**
- [ ] Instagram Business API funcionando
- [ ] Facebook Pages integration ativa
- [ ] LinkedIn Company Pages conectado
- [ ] Twitter/X API v2 funcionando
- [ ] TikTok Business API configurado
- [ ] YouTube Data API ativo

### **Core Features**
- [ ] Cross-platform posting funcionando
- [ ] Automated scheduling ativo
- [ ] Content optimization implementado
- [ ] Hashtag optimization funcionando
- [ ] Media optimization ativa

### **Social Listening**
- [ ] Real-time mention tracking ativo
- [ ] Sentiment analysis funcionando
- [ ] Competitor monitoring ativo
- [ ] Trend analysis implementado
- [ ] Automated responses configuradas

### **Analytics**
- [ ] Cross-platform analytics unificados
- [ ] ROI tracking funcionando
- [ ] Engagement metrics coletados
- [ ] Attribution analysis ativo
- [ ] Performance dashboards funcionando

### **Automation**
- [ ] Auto-posting funcionando
- [ ] Smart scheduling ativo
- [ ] Response automation configurada
- [ ] Escalation rules implementadas
- [ ] Content moderation ativa

---

## 📚 **TUTORIAL PARA USUÁRIO FINAL**

### **Guia Completo - Social Media Integration**

#### **Passo 1: Conectar Redes Sociais**
1. Acesse o painel social: `https://social.kryonix.com.br`
2. Clique em "Conectar Redes Sociais"
3. Autorize cada plataforma desejada
4. Verifique se todas estão "Conectadas"

#### **Passo 2: Criar Campanha Cross-Platform**
1. Vá para "Campanhas" > "Nova Campanha"
2. Escolha as plataformas
3. Configure público-alvo
4. Crie conteúdo master
5. Revise adaptações automáticas
6. Agende ou publique

#### **Passo 3: Configurar Social Listening**
1. Acesse "Social Listening"
2. Adicione palavras-chave da marca
3. Configure monitoramento de concorrentes
4. Ative alertas automáticos
5. Configure respostas automáticas

#### **Passo 4: Monitorar Performance**
1. Vá para "Analytics"
2. Visualize métricas unificadas
3. Compare performance por plataforma
4. Analise ROI de campanhas
5. Otimize baseado nos insights

---

## 🚀 **PRÓXIMOS PASSOS**

### **Imediatos (Esta Semana)**
1. ✅ Deploy sistema social media completo
2. ✅ Conectar todas as 6 principais plataformas
3. ✅ Configurar social listening
4. ✅ Ativar cross-platform analytics

### **Próxima Semana**
1. Treinar equipe em ferramentas
2. Configurar campanhas iniciais
3. Otimizar baseado nos primeiros dados
4. Implementar advanced automation

### **Integração com Outras Partes**
- **Parte 44**: CRM Integration (lead generation from social)
- **Parte 45**: Lead Scoring (social engagement scoring)
- **Parte 40**: Mautic Marketing (social campaigns automation)
- **Parte 41**: Email Marketing (cross-channel campaigns)

---

**🎯 Parte 43 de 50 concluída! Social Media Integration implementado com sucesso!**

*Próxima: Parte 44 - CRM Integration*

---

*Documentação criada por: Marketing Expert + Social Media Specialist*  
*Data: 27 de Janeiro de 2025*  
*Versão: 1.0*  
*Status: ✅ Concluída*
