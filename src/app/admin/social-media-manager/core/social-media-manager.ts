// social-media-manager.js
import AIManager from './ai-manager';
import ActionManager from './action-manager';
import Manager from './manager'; // Base class for handling each platform

class SocialMediaManager {
  platforms: any[];
  schedule: any[];
  aiManager: any;
  constructor() {
    this.platforms = []; // List of active platforms
    this.schedule = [];  // List of scheduled posts
    this.aiManager = new AIManager(process.env.OPENAI_API_KEY); // OpenAI instance
  }

  addPlatform(platformManager) {
    this.platforms.push(platformManager);
  }

  schedulePost(post, platformName, time) {
    this.schedule.push({ post, platformName, time });
  }

  async runSchedule() {
    for (const postItem of this.schedule) {
      const platform = this.platforms.find((p) => p.platform === postItem.platformName);
    //   if (platform) {
    //     const actionManager = new ActionManager(platform, this.aiManager, platform.verificationManager);
    //     try {
    //       await actionManager.executeAction('login');
    //       await actionManager.executeAction('createPost');
    //     } catch (err) {
    //       console.error(`Failed on ${postItem.platformName}:`, err);
    //     }
    //   }
    }
  }
}

export default SocialMediaManager;