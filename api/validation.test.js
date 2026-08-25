'use strict';

const { albumSchema, preferencesSchema } = require('./validation');

const validAlbum = {
    albumName: 'OK Computer',
    artist: 'Radiohead',
    releaseDate: '1997-05-21',
    genre: 'Alternative Rock',
    label: 'Parlophone',
    bandMembers: ['Thom Yorke'],
    isBandTogether: true,
    rollingStoneReview: 'A landmark record.',
    albumsSold: 4500000,
    youTubeAlbumURL: 'https://www.youtube.com/watch?v=8IPixyStmQg',
    imgURL: 'https://example.com/cover.jpg',
};

describe('albumSchema', () => {
    test('accepts a fully valid album with a single genre string', () => {
        expect(albumSchema.safeParse(validAlbum).success).toBe(true);
    });

    test('accepts a valid album using genres[] instead of genre', () => {
        const { genre: _genre, ...rest } = validAlbum;
        const album = { ...rest, genres: ['Alternative Rock', 'Art Rock'] };
        expect(albumSchema.safeParse(album).success).toBe(true);
    });

    test('rejects an album with neither genre nor genres', () => {
        const { genre: _genre, ...rest } = validAlbum;
        const result = albumSchema.safeParse(rest);
        expect(result.success).toBe(false);
    });

    test('rejects a non-YouTube video URL', () => {
        const album = { ...validAlbum, youTubeAlbumURL: 'https://vimeo.com/12345' };
        expect(albumSchema.safeParse(album).success).toBe(false);
    });

    test('rejects a non-http(s) imgURL', () => {
        const album = { ...validAlbum, imgURL: 'ftp://example.com/cover.jpg' };
        expect(albumSchema.safeParse(album).success).toBe(false);
    });

    test('rejects a negative albumsSold', () => {
        const album = { ...validAlbum, albumsSold: -1 };
        expect(albumSchema.safeParse(album).success).toBe(false);
    });

    test('rejects an empty bandMembers array', () => {
        const album = { ...validAlbum, bandMembers: [] };
        expect(albumSchema.safeParse(album).success).toBe(false);
    });
});

describe('preferencesSchema', () => {
    test('accepts a plain object', () => {
        expect(preferencesSchema.safeParse({ sortBy: 'artist', viewMode: 'grid' }).success).toBe(true);
    });

    test('rejects an array', () => {
        expect(preferencesSchema.safeParse(['sortBy', 'artist']).success).toBe(false);
    });

    test('rejects a non-object value', () => {
        expect(preferencesSchema.safeParse('not an object').success).toBe(false);
    });

    test('rejects a payload larger than 10KB', () => {
        const oversized = { blob: 'x'.repeat(10_001) };
        expect(preferencesSchema.safeParse(oversized).success).toBe(false);
    });
});
