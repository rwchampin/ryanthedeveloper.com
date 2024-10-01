class ActionManager {
  platform: any;
  manager: any;
  aiManager: any;
  verificationManager: any;
  actions: {};
  constructor(platform, manager, aiManager, verificationManager) {
    this.platform = platform;
    this.manager = manager;
    this.aiManager = aiManager;
    this.verificationManager = verificationManager;
    this.actions = {}; 
  }

  // Define the action timeline
  defineAction(actionName, steps) {
    this.actions[actionName] = {
      steps,
      current: 0, // Keep track of the current step
    };
  }

  // Helper function to log actions
  log(message) {
    console.log(`[${this.platform}] - ${message}`);
  }

  // Navigation step handler
  async handleNavigationStep(step) {
    this.log(`Navigating: ${step.htmlDescription}`);
    await this.manager[step.fn](...step.args);
  }

  // Verification step handler
  async handleVerificationStep(step) {
    this.log(`Verifying: ${step.htmlDescription}`);
    const html = await this.manager.puppeteer.getPageHtml();
    const isVerified = this.verificationManager.verifyPageHTML(html, step.requiredSelectors);
    
    if (!isVerified) {
      throw new Error(`Verification failed for: "${step.htmlDescription}"`);
    }
  }

  // Action step handler
  async handleActionStep(actionName, step) {
    this.log(`Performing action: ${step.htmlDescription}`);
    const selectors = await this.fetchRequiredHtmlForStep(actionName, step);
    await this.manager[step.fn](actionName, selectors);
  }

  // Post-action verification handler
  async handlePostActionVerificationStep(step) {
    this.log(`Verifying action result: ${step.htmlDescription}`);
    const html = await this.manager.puppeteer.getPageHtml();
    const success = this.verificationManager.verifyActionResult(html, step.successIndicator);

    if (!success) {
      throw new Error(`Post-action verification failed for: "${step.htmlDescription}"`);
    }
  }

  // Fetch required HTML selectors for current step
  async fetchRequiredHtmlForStep(actionName, step) {
    const html = await this.manager.puppeteer.getPageHtml();
    const initialPrompt = this.generateInitialPrompt(actionName);
    const taskPrompt = this.generateTaskPrompt(actionName, step.htmlDescription);

    const response = await this.aiManager.fetchSelectors(html, taskPrompt, initialPrompt);
    const selectors = JSON.parse(response);

    const isVerified = this.verificationManager.verifyAISelectors(selectors, step.requiredSelectors);

    if (!isVerified) {
      throw new Error(`AI verification failed for: "${step.htmlDescription}"`);
    }

    return selectors;
  }

  // Execute the next step in the action timeline
  async executeNextStep(actionName) {
    const actionTimeline = this.actions[actionName];
    const currentStepIndex = actionTimeline.current;
    const currentStep = actionTimeline.steps[currentStepIndex];

    if (!currentStep) {
      this.log(`Action "${actionName}" completed successfully.`);
      return;
    }

    try {
      switch (currentStep.type) {
        case 'navigation':
          await this.handleNavigationStep(currentStep);
          break;

        case 'verification':
          await this.handleVerificationStep(currentStep);
          break;

        case 'action':
          await this.handleActionStep(actionName, currentStep);
          break;

        case 'postActionVerification':
          await this.handlePostActionVerificationStep(currentStep);
          break;

        default:
          throw new Error(`Unknown step type: ${currentStep.type}`);
      }

      // Move to the next step after successful execution
      actionTimeline.current += 1;
      await this.executeNextStep(actionName); // Recursively call to execute the next step

    } catch (error) {
      console.error(`Error in step "${currentStep.htmlDescription}" of action "${actionName}":`, error.message);
    }
  }

  // Start execution of an action timeline
  async startAction(actionName) {
    this.actions[actionName].current = 0; // Reset to the first step
    await this.executeNextStep(actionName);
  }

  // Prompt generators for AI
  generateInitialPrompt(actionName) {
    const steps = this.actions[actionName].steps.map(step => step.htmlDescription).join(' -> ');
    return `The goal is to perform the following action on ${this.platform}: ${actionName}.
    The full workflow consists of the following steps: ${steps}.`;
  }

  generateTaskPrompt(actionName, currentStepDescription) {
    return `We are currently on step "${currentStepDescription}" for the ${actionName} task.
    Please provide the necessary HTML selectors for this step and suggest how to handle any potential skipped steps, persistent logins, or modal windows.`;
  }
}

export default ActionManager;