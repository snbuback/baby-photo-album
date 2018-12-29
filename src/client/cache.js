/* global Map */
import Promise from "promise";

class Cache {
    STORAGE_KEY = 'storageCache';
    CACHE_EXPIRED = 1*60;

    constructor() {
        this._map = new Map();
        this._load();
        this._clearIfStaled();
    }

    get _lastUpdateKey() {
        return `${this.STORAGE_KEY}_lastUpdate`;
    }

    _clearIfStaled() {
        const lastUpdate = Number.parseInt(window.localStorage.getItem(this._lastUpdateKey), 10);
        const elapsedTimeSinceUpdateSeconds = Math.trunc((new Date().getTime() - new Date(lastUpdate)) / 1000);
        if (elapsedTimeSinceUpdateSeconds > this.CACHE_EXPIRED) {
            this.clear(false);
        }
    }

    _load() {
        let raw_content = window.localStorage.getItem(this.STORAGE_KEY);
        if (raw_content) {
            this._map = new Map(JSON.parse(raw_content));
        }
    }

    _persist() {
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this._map]));
        window.localStorage.setItem(this._lastUpdateKey, new Date().getTime());
    }

    clear(private_keys) {
        if (private_keys === false) {
            // avoid clear the authentication key
            for (let k of this._map.keys()) {
                if (!k.startsWith('__')) {
                    this._map.delete(k);
                }
            }
        } else {
            this._map.clear();
        }
        this._persist();
    }

    get(key) {
        return this._map.get(key);
    }

    getOrSet(key, func) {
        let value = this.get(key);
        if (value === undefined) {
            value = func();
            this.set(key, value);
        }
        return value;
    }

    async asyncGetOrSet(key, func) {
        let value = this.get(key);
        if (value === undefined) {
            value = func().then((result) => {
                this.set(key, result);
                return result;
            });
        } else {
            value = new Promise.resolve(value);
        }
        return value;
    }

    set(key, value) {
        if (value === null || value == undefined) {
            this.del(key);
        } else {
            this._map.set(key, value);
        }
        this._persist();
        return value;
    }

    del(key) {
        this._map.delete(key);
        this._persist();
        return this;
    }
}
export default Cache;