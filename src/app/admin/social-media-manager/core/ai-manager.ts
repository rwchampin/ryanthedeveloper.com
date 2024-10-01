// ai-manager.js
import { openai } from '@/lib/utils/openai';

class AIManager {
  apiKey: any;
  openAI: any;
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.openAI = openai;
  }

  async fetchSelectors(html, taskDescription) {
    const prompt = `Here is the HTML:\n${html}\n\nTask: ${taskDescription}\n\nPlease extract the necessary HTML selectors for this task.`;
    const response = await this.openAI.complete({
      engine: 'davinci-codex',
      prompt: prompt,
      maxTokens: 200,
    });
    return response.data.choices[0].text.trim();
  }
}

export default AIManager;