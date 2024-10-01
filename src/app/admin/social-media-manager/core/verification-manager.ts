// verification-manager.js
class VerificationManager {
  verifyAISelectors(selectors, requiredFields) {
    for (const field of requiredFields) {
      if (!selectors[field]) return false;
    }
    return true;
  }

  verifyPageHTML(html, requiredElements) {
    for (const element of requiredElements) {
      if (!html.includes(element)) return false;
    }
    return true;
  }

  verifyActionResult(html, successIndicator) {
    return html.includes(successIndicator);
  }
}

export default VerificationManager;