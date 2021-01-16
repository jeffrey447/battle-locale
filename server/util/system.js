const db = require('./firebase_db');
const api = {
    spells: ["some spell"],
    spellTomes: {
        "id": {
            lat: 21.738836,
            long: -97.933290,
            spell: "some spell"
        }
    },
    createError: (message, data) => {
        return {
            success: false,
            message,
            ...data
        };
    },
    createSuccess: (data) => {
        return {
            success: true,
            ...data
        };
    },
    // assume units is in miles (DEFAULT), otherwise units can be "K" (kilometers) or "N" (nautical miles)
    // https://www.geodatasource.com/developers/javascript
    calculateDistance: (lat1, long1, lat2, long2, unit) => {
        if ((lat1 == lat2) && (long1 == long2)) {
            return 0;
        } else {
            let radlat1 = Math.PI * (lat1 / 180);
            let radlat2 = Math.PI * (lat2 / 180);
            let theta = (long1 - long2);
            let radtheta = Math.PI * (theta / 180);

            let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1)
                dist = 1;
            
            dist = Math.acos(dist);
            dist *= (180 / Math.PI);
            dist *= (60 * 1.1515);

            if (unit === "K")
                dist *= 1.609344;
            else if (unit === "N")
                dist *= 0.8684;
            
            return dist;
        }
    },
    loginUser: async (username) => {
        let ref = db.ref(`users/${username}`);
        let result = await ref.once('value');
        if (result.exists()) {
            return api.createSuccess();
        } else {
            try {
                await ref.set({
                    name: username,
                    health: 0,
                    lat: 0,
                    long: 0,
                    mana: 0,
                    spells: []
                });

                return api.createSuccess();
            } catch (e) {
                return api.createError(`Error when creating a new user: ${e.message}`);
            }
        }
    },
    getUser: async (username) => {
        let ref = db.ref(`users/${username}`);
        let result = await ref.once('value');
        if (result.exists()) {
            return api.createSuccess({
                user: result.val()
            });
        } else {
            return api.createError(`User "${username}" does not exist.`);
        }
    },
    getUsers: async () => {
        let ref = db.ref(`users`);
        let result = await ref.once('value');
        if (result.exists()) {
            let users = [];
            for (let [username, data] of Object.entries(result.val()))
                users.push(data);
            
            return api.createSuccess({
                users
            });
        } else {
            // no users
            return api.createSuccess({
                users: []
            });
        }
    },
    updateUser: async (username, newData) => {
        // verify the user exists
        let data = await api.getUser(username);
        if (!data.success) return data;

        let ref = db.ref(`users/${username}`);
        try {
            await ref.update(newData);
            return api.createSuccess();
        } catch (e) {
            return api.createError(`Error when updating user "${username}" data: ${e.message}`);
        }
    },
    createGameStats: async () => {
        let ref = db.ref('gameStats');
        let result = await ref.once('value');
        if (result.exists()) {
            return api.createError('Game has already started.');
        } else {
            try {
                let users = await api.getUsers();
                await ref.set({
                    players: (() => {
                        // convert users object array to string array
                        let list = [];
                        users.forEach(u => list.push(u.name));

                        return list;
                    })(), // to-do: get array of users
                    timeStamp: Date.now(), // in milliseconds!
                    circle: {
                        radius: 0,
                        lat: 0,
                        long: 0
                    }
                });
                
                return api.createSuccess();
            } catch (e) {
                return api.createError(`Error when creating new game stats: ${e.message}`);
            }
        }
    },
    getGameStats: async() => {
        let ref = db.ref('gameStats');
        try {
            let result = await ref.once('value');
            if (!result.exists()) {
                // create the game stats if it doesn't exist already
                let data = await api.createGameStats();
                if (!data.success) return data;
            }

            let data = result.val();
            data.timeStamp = Date.now();

            await ref.update({
                timeStamp: Date.now()
            });

            return api.createSuccess({
                stats: data
            });
        } catch (e) {
            return api.createError(`Error when getting game stats: ${e.message}`);
        }
    }
};

module.exports = api;