const Pusher = require("pusher");

let pusherInstance = null;

const initializePusher = () => {
    if (!pusherInstance) {
        pusherInstance = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.PUSHER_CLUSTER,
            useTLS: true
        });
        console.log("✅ Pusher initialized");
    }
    return pusherInstance;
};

const getPusherInstance = () => {
    if (!pusherInstance) {
        return initializePusher();
    }
    return pusherInstance;
};

module.exports = {
    initializePusher,
    getPusherInstance
};