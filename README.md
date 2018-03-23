**KomPOST is currently a work in progress, do not use in a
production API just yet.**

# KomPOST

KomPOST is a simple and elegant Node.js web API framework.
It is designed to make building a RESTful API as enjoyable and easy as possible.

# What does it look like?

An example of a typical controller in KomPOST looks like the following.

```
import ...
 
@controller("posts")
export default class PostController extends Controller {
 
    @get
    @transform(PostTransformer)
    public async index () {
        return await Post.find();
    }
 
    @get(":id")
    @transform(PostTransformer)
    public async show (id: string) {
        return await Post.findOneById(id);
    }
 
    @post
    @request(PostRequest)
    public async create (post: Post) {
        await post.save();
        return 201;
    }
 
    @put(":id")
    @request(PostRequest)
    public async update (id: string, request: Post) {
        const post = await Post.findOneById(id);
 
        Object
            .entries(request)
            .forEach(([key, value]) => post[key] = value);
 
        await post.save();
        return 204;
    }
 
    @del(":id")
    public async destroy (id: string) {
        const post = await Post.findOneById(id);
        await post.remove();
        return 204;
    }
}
```
