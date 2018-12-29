class Album {
    constructor(id, name, coverPhoto) {
        this.id = id;
        this.name = name;
        this.coverPhoto = coverPhoto;
    }

    get image() {
        return this.coverPhoto ? this.coverPhoto.image : null;
    }

    toString() {
        return `Album ${this.name}`;
    }
}

class Photo {
    constructor({albumId, id, title, image, mimeType, comment, width, height, taken}) {
        this.albumId = albumId;
        this.id = id;
        this.title = title;
        this.image = image;
        this.mimeType = mimeType;
        this.comment = comment;
        this.width = width;
        this.height = height;
        this.taken = taken;
    }

    toString() {
        return `Photo ${this.title}: ${this.image}`;
    }
}

class Video extends Photo {
    constructor({albumId, id, title, image, mimeType, play, comment, width, height, taken}) {
        super({albumId, id, title, image, mimeType, comment, width, height, taken});
        this.play = play;
    }

    toString() {
        return `Video ${this.title}: ${this.play}`;
    }
}

export { Album, Photo, Video };