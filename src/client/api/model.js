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
    constructor(id, name, image, comment) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.comment = comment;
    }

    toString() {
        return `Photo ${this.name}: ${this.image}`;
    }
}

export { Album, Photo };