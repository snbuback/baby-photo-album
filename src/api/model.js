class Album {
    constructor(id, name, coverPhoto) {
        this.id = id;
        this.name = name;
        this.coverPhoto = coverPhoto;
    }

    get image() {
        return this.coverPhoto.image;
    }
}

class Photo {
    constructor(id, name, image, comment) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.comment = comment;
    }
}

export { Album, Photo };