const allowedPattern = /(?:https?:\/\/)?(?:\w+\.)?discord(?:(?:app)?\.com\/invite|\.gg)\/(?<code>[a-z\d-]+)?(?:\?\S*)?(?:#\S*)?/gi;

function containsInvalidUrl(content) {
    const urls = content.match(allowedPattern) || [];
    
    for (const url of urls) {
        allowedPattern.lastIndex = 0;
        const isAllowed = allowedPattern.test(url);
        if (!isAllowed) {
            return true;
        }
    }
    return false;
}

function extractInviteCodes(content) {
    const inviteCodes = [];
    const urls = content.match(allowedPattern) || [];
    
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