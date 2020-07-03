import { Router } from 'express';
import { AppError } from '../model/errors';
import { PostRepository, UserRepository } from '../dao/mongo-repository';
import * as indicative from 'indicative';

const router = Router();

router.get('/', (req, res, next) =>
    (<PostRepository>req.app.locals.postRepo).findAll()
        .then(posts => res.json(posts))
        .catch(next));

router.get('/:id', async (req, res, next) => {
    // validate id
    try {
        const id = req.params.id;
        await indicative.validator.validate({ id }, {
            id: 'required|regex:^[0-9a-fA-F]{24}$'
        });
    } catch (err) {
        next(new AppError(400, err.message, err));
        return;
    }
    // find post
    try {
        const found = await (<PostRepository>req.app.locals.postRepo).findById(req.params.id)
        res.json(found); //200 OK with deleted post in the body
    } catch (err) {
        next(err);
    }

});

router.post('/', async (req, res, next) => {
     // validate new post
    const newPost = req.body;
    try {
        await indicative.validator.validate(newPost, {
            _id: 'regex:^[0-9a-fA-F]{24}$',
            title: 'required|string|min:3|max:30',
            text: 'required|string|min:3|max:1024',
            // authorId: 'required|regex:^[0-9a-fA-F]{24}$',s
            imageUrl: 'url',
            categories: 'array',
            'categories.*': 'string',
            keywords: 'array',
            'keywords.*': 'string',
        });
    } catch (err) {
        next(new AppError(400, err.message, err));
        return;
    }
    // create post in db
    try {

        //TODO set correct author
        const defaultUser = await (<UserRepository>req.app.locals.userRepo).findByUsername("trayan");
        newPost.authorId = defaultUser._id;

        // Create new User
        const created = await (<PostRepository>req.app.locals.postRepo).add(newPost);

        res.status(201).location(`/api/posts/${newPost.id}`).json(newPost);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', async function (req, res, next) {
    try {
        const postId = req.params.id;
        const post = req.body;
        if (postId !== post._id) {
            next(new AppError(400, `IDs in the URL and message body are different.`));
            return;
        }
        const found = await (<PostRepository>req.app.locals.postRepo).findById(req.params.id);
        if (post.authorId && post.authorId.length > 0 && found.authorId !== post.authorId) {
            throw new AppError(400, `Can not change Post's author.`);
        }
        // _id and authorId are unmodifiable
        post._id = found._id;
        post.authorId = found.authorId;
        const updated = await (<PostRepository>req.app.locals.postRepo).edit(post);
        res.json(updated); //200 OK with post in the body
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async function (req, res, next) {
    try {
        const postId = req.params.id;
        const deleted = await (<PostRepository>req.app.locals.postRepo).deleteById(postId);
        res.json(deleted); //200 OK with deleted post in the body
    } catch (err) {
        next(err);
    }
});

export default router;
