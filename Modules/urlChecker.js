const allowedPattern = /(?:https?:\/\/)?(?:\w+\.)?discord(?:(?:app)?\.com\/invite|\.gg)\/(?<code>[a-z\d-]+)?(?:\?\S*)?(?:#\S*)?/gi;

function containsInvalidUrl(content) {
    const urlPattern = /(?:https?:\/\/)?(?:\w+\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?|(?:https?:\/\/)?(?:\w+\.)?discord(?:(?:app)?\.com\/invite|\.gg)\/[a-z\d-]+|(?:https?:\/\/)?(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s]*)?/gi;
    const urls = content.match(urlPattern) || [];
    
    if (urls.length === 0) {
        return false;
    }
    
    for (const url of urls) {
        allowedPattern.lastIndex = 0;
        const match = allowedPattern.exec(url)
        if (!match) {
            return true;
        }

        if (match[0] !== match.input) {
            return true;
        }
    }
    return false;
}

function extractInviteCodes(content) {
    const inviteCodes = [];
    const urlPattern = /(?:https?:\/\/)?(?:\w+\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?|(?:https?:\/\/)?(?:\w+\.)?discord(?:(?:app)?\.com\/invite|\.gg)\/[a-z\d-]+|(?:https?:\/\/)?(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s]*)?/gi;
    const urls = content.match(urlPattern) || [];
    
    for (const url of urls) {
        allowedPattern.lastIndex = 0;
        const match = allowedPattern.exec(url);
        if (match && match.groups && match.groups.code) {
            inviteCodes.push(match.groups.code);
        }
    }
    return inviteCodes;
}

module.exports = { containsInvalidUrl, extractInviteCodes };