const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { getPusherInstance } = require("../utility/pusher");

// Pusher authentication endpoint
router.post("/pusher/auth", auth, (req, res) => {
    const socketId = req.body.socket_id;
    const channelName = req.body.channel_name;
    
    // Get the authenticated user from the auth middleware
    const user = req.user;
    
    // Check if user has permission to access the channel
    if (channelName.startsWith('private-user-')) {
        const userId = channelName.split('-')[2];
        if (parseInt(userId) !== user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }
    } else if (channelName.startsWith('private-org-')) {
        const orgId = channelName.split('-')[2];
        if (parseInt(orgId) !== user.org_id) {
            return res.status(403).json({ message: "Forbidden" });
        }
    }
    
    try {
        const pusher = getPusherInstance();
        const authResponse = pusher.authorizeChannel(socketId, channelName);
        res.send(authResponse);
    } catch (error) {
        console.error("Pusher auth error:", error);
        res.status(500).json({ message: "Authentication failed" });
    }
});

module.exports = router;