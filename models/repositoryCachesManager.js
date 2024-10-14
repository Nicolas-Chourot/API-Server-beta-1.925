import * as utilities from "../utilities.js";
import * as serverVariables from "../serverVariables.js";

let repositoryCachesExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");

// Repository file data models cache
globalThis.repositoryCaches = [];

export default class RepositoryCachesManager {
    static add(model, data) {
        if (model != "") {
            RepositoryCachesManager.clear(model);
            repositoryCaches.push({
                model,
                data,
                Expire_Time: utilities.nowInSeconds() + repositoryCachesExpirationTime
            });
            console.log(BgWhite+FgBlue, `[Data of ${model} repository has been cached]`);
        }
    }
    static clear(model) {
        if (model != "") {
            let indexToDelete = [];
            let index = 0;
            for (let cache of repositoryCaches) {
                if (cache.model == model) indexToDelete.push(index);
                index++;
            }
            utilities.deleteByIndex(repositoryCaches, indexToDelete);
        }
    }
    static find(model) {
        try {
            if (model != "") {
                for (let cache of repositoryCaches) {
                    if (cache.model == model) {
                        // renew cache
                        cache.Expire_Time = utilities.nowInSeconds() + repositoryCachesExpirationTime;
                        console.log(BgWhite+FgBlue, `[${cache.model} data retreived from cache]`);
                        return cache.data;
                    }
                }
            }
        } catch (error) {
            console.log(BgWhite+FgRed, "[repository cache error!]", error);
        }
        return null;
    }
    static flushExpired() {
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for (let cache of repositoryCaches) {
            if (cache.Expire_Time < now) {
                console.log(BgWhite+FgBlue, `[Cached ${cache.model} data expired]`);
                indexToDelete.push(index);
            }
            index++;
        }
        utilities.deleteByIndex(repositoryCaches, indexToDelete);
    }
}
// periodic cleaning of expired cached repository data
setInterval(RepositoryCachesManager.flushExpired, repositoryCachesExpirationTime * 1000);
console.log(BgWhite+FgBlack, "[Periodic repositories data caches cleaning process started...]");
