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
    constructor(albumId, id, title, image, comment) {
        this.albumId = albumId;
        this.id = id;
        this.title = title;
        this.image = image;
        this.comment = comment;
    }

    toString() {
        return `Photo ${this.title}: ${this.image}`;
    }
}

export { Album, Photo };