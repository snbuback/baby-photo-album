import { Photo, Album } from "../model";

const imageList = [
    'http://demo.bloompixel.com/storyblog/wp-content/uploads/sites/23/2015/04/photo-1421930451953-73c5c9ae9abf.jpg',
    'http://demo.bloompixel.com/storyblog/wp-content/uploads/sites/23/2015/05/1d8ef901.jpg',
    'http://demo.bloompixel.com/storyblog/wp-content/uploads/sites/23/2015/04/photo-1425136738262-212551713a58.jpg',
    'http://demo.bloompixel.com/storyblog/wp-content/uploads/sites/23/2015/04/photo-1420819453217-57b6badd9e19.jpg'
];

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function getRandomImage() {
    return imageList[getRandomInt(imageList.length)];
}

const data = [
    'First steps',
    'A story to tell in a very long title',
    'Mfkd fkfddfdf',
    'd fsfds fsd fsdf sdf',
    'sfdfsdfs fsd fsd fs',
    'sfdfdsfsdfs dfs fs s fsd s',
    '2gdsar4hds sf sdf sfwef4',
    'jd3yk vsdwy3 bsdi3gn',
    'hddb 83d 9sbr93d',
    'dj39g sv393 jd',
    'dhs 83b 9sb3',
    'sjds 83hd df93b'
].map((title, index) => (
    {
        album: new Album(index, title, new Photo(`cover-${index}`, `My cover ${index}`, getRandomImage(), null)),
        photos: [...Array(getRandomInt(10)).keys()].map((i) => 
            new Photo(`${index}-${i}`, `My photo number ${i}`, getRandomImage(), null))
    }
));

class FakeAlbumStorage {

    getAll() {
        return data.map(({album}) => album);
    }

    getPhotos(album) {
        return data[album.id].photos;
    }
}

export default FakeAlbumStorage;
