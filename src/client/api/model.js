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
    constructor({albumId, id, title, image, comment, width, height, taken}) {
        this.albumId = albumId;
        this.id = id;
        this.title = title;
        this.image = image;
        this.comment = comment;
        this.width = width;
        this.height = height;
        this.taken = taken;
    }

    toString() {
        return `Photo ${this.title}: ${this.image}`;
    }
}

export { Album, Photo };