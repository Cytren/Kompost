
# Getting Started

To show you how to get started with KomPOST, we'll create a basic resource called a Post.
A post will be a very simple resource that has a message and an icon. To interface
with the resource, we will create the following endpoints.

```
 GET      /api/posts/
 GET      /api/posts/{id}
 POST     /api/posts
 PUT      /api/posts/{id}
 DELETE   /api/posts/{id}
```

### Creating The Project

To begin, we'll create the project using the KomPOST CLI. Install the CLI globally with.

```
npm install -g kompost-cli
```

Now create the project with the CLI and cd into it.

```
kompost create message-api-example
cd message-api-example
```

### Endpoints

The endpoints in KomPOST are all async functions in a controller. To register the endpoint,
simply register the controller that it belongs to.

Let's build a simple controller with a single endpoint to demonstrate how this works.

```
// controller/post-controller.ts
 
import { controller, get, Controller } from "kompost";
 
@controller("posts")
export default class PostController extends Controller {
    
    @get
    async index () {
        return {
            message: "MY MESSAGE",
            icon: 14
        };
    }
}
```

Let's break down whats happening here. The controller is contained within the class.
In this case, the class extends Controller, this is optional but provides helper methods.

The controller route is marked as "/posts" with the @controller decorator. This is
mandatory and must be placed above the class definition. This path is applied as a 
prefix to all the endpoints in the controller.

The endpoint is created by making an async function (any name) in the class and registered 
with any of the http decorators. In this case it's @get as it's a GET request, but others
are supported, @post, @put, @del, etc.

The http decorator accepts an optional path parameter. This allows for sub resources and
path parameters. For example

```
 @get                   GET /posts
 @get("sub")            GET /posts/sub
 @get(":id")            GET /posts/{id}
 @get("test/:id/sub")   GET /posts/test/{id}/sub
```

To return the result of the endpoint to the user, simply return the result. In order for
endpoint to work, we need to register it. Make the following changes to app.ts.

```
// app.ts
 
import "reflect-metadata";
import "./config/providers";
 
import {bootstrap, provideSingleton} from "kompost";
 
import Environment from "./config/environment";
import PostController from "./controller/post-controller";
 
const environment: Environment = require("../../environment.json");
provideSingleton(Environment, () => environment);
 
const config = {
    environment,
    controllers: [ PostController ],
    models: [],
    middleware: [],
    jobs: []
};
 
bootstrap(config)
    .then(() => {
        console.log(`localhost:${environment.port}`);
        console.log("Server running...");
    })
    .catch(error => {
        console.log("Unable to bootstrap server!");
        console.log(error);
    });
```

Now, the API is ready to test. Run the following command to compile and bootstrap the
server.

```
npm run dev
```

To test the endpoint is working correctly, make a GET request to /api/posts, we should 
get the following response.

```
STATUS: 200
 
BODY:
{
    "message": "MY MESSAGE",
    "icon": 14
}
```

### Models

In order to persist changes, we need to be able to read / write to the database.
KomPOST uses TypeORM for this, we can start by creating a model for a Post.

```
// model/post.ts
 
import {Model} from "kompost";
import {Entity, Column} from "typeorm";
 
@Entity()
export default class Post extends Model {
    @Column()
    public message: string;
    
    @Column("integer")
    public icon: number;
}
```

The model requires registering in the app config

```
// app.ts
 
...
 
import Post from "./model/post";
 
const config = {
    ...
    models: [ Post ],
    ...
};
 
...
```

We can now update the controller to use this model for creating / retrieving the resource.

```
// controller/post-controller.ts
 
... 
 
@post
async create ({ body }: BodyProvider) {
    const post = new Post();

    post.message = body.message;
    post.icon = body.icon;

    await post.save;
    return 201;
}
 
@get(":id")
async show (id: string) {
    return await Post.findOneById(id);
}
 
@get
async index () {
    return await Post.find();
}
 
...
```

In the create function, we take a parameter of type BodyProvider. This injects the request 
body into the endpoint, we'll discuss how injection works later on.

We create a new post instance, set the properties from the request body, then save it to
the database. Finally, we return 201, this simply returns the status code 201 without any
response body.

An example request that can be made is shown below.

```
BODY:
{
    "message": "MY MESSAGE",
    "icon": 14
}
``` 

In the show function, we take a parameter called id. Again, this is handled by injection,
and in this case is the id from the path. We use this id to load the given post, and
return it. Making the request GET /api/posts/1 will result in the following response.

```
STATUS: 200
 
BODY:
{
    "id": 0,
    "createdAt": "2018/03/14 22:09",
    "updatedAt": "2018/03/14 22:09",
    "message": "MY MESSAGE",
    "icon": 14
}
```

All models that extend the Model class from KomPOST receive three additional properties.
An id, which is an auto-incremented integer, and two timestamps for created and updated.


In the index function, we use the helper function find to load all the post entities 
as an array. We simply return this, which will give the following response.

```
STATUS: 200
 
BODY:
[
    {
        "id": 0,
        "createdAt": "2018/03/14 22:09",
        "updatedAt": "2018/03/14 22:09",
        "message": "MY MESSAGE",
        "icon": 14
    }
]
```

### Injection

Injection is used to help remove some of the boilerplate of passing parameters around.
In KomPOST, injections are handled in multiple areas of the framework.

Services are nice way to keep controllers / class free of unnecessary code. Services are
simply classes.

```
import { inject } from "kompost";
import { RemoteLoggingService } from "./remote-logging-service";
 
export default class LogService {
    @inject remoteLog: RemoteLoggingService;
    
    log (message: string) {
        console.log(message);
        remoteLog.log(message);
    }
}
```

A service can inject another service, this helps with breaking up complex services. In 
order for the service to be successfully injected, it must be provided.

The @inject decorator is used to inject the service into the class, this can be used in 
any class.

Two types of providers exists, singleton providers and dynamic providers. Singletons are
services where only a single instance will exist. Dynamic services are built every time
the service is referenced.

It's best to use singleton services where possible, and use dynamic services only where 
necessary. It's usually best to register these providers in app.ts. The registration 
looks like this

```
// app.ts
 
import { provideSingleton, provideDynamic } from "kompost";
import SingletonService from "./service/singleton";
import DynamicService from "./service/dynamic";
 
...
 
const singleton = new SingletonService("Parameter");
provideSingleton(SingletonService, () => singleton);
 
provideDynamic(DynamicService, () => new DynamicService);
 
...
```

One place where injection is heavily used is in the endpoints functions. A service can be 
injected into an endpoint simply by adding it as a parameter. The type of the service must 
be the type registered in the provider.

An example of an endpoint with an injected service, is shown as follows.

```
...
 
@get
async index (logger: LogService) {
    logger.log("MESSAGE");
    return 204;
}
 
...
```

In endpoints, services aren't the only thing that can be injected. Various providers exist 
which allow access to the elements of the request.

```
BodyProvider      Inject the request body
HeaderProvider    Inject the request headers
QueryProvider     Inject the request query parameters
ContextProvider   Inject the full Koa.js context object
```

Finally, a request can be processed and the resulting model injected into the endpoint.
We'll see more of this in the next section.

### Requests

In the earlier models example, we create the post model from the request body by manually 
setting the post instance fields. This approach works fine, but has a few issues.

On larger models, manually setting the fields in the controller is tedious and pollutes 
the function. No validation of the request is performed, this could be done manually in 
the endpoint, but this again would pollute the function.

A better approach is to use a request. A request takes the http request from the context, 
checks the entity is valid and builds a model of it. The model can then be injected into 
the endpoint.

```
// request/create-post-request.ts
 
import { Request, Validation } from "kompost";
import Post from "../model/post";
 
export default class CreatePostRequest extends Request<Post> {
    public type = Post;
  
    protected validation: Validation = {
        message: "string",
        icon: "integer"
    };
 
    protected async validate (model: any) {
        const post = new Post();
 
        post.message = model.message;
        post.icon = model.icon;
 
        if (!isValidIcon(post.icon)) {
            this.fail(`Invalid icon ${post.icon}`);
        }
 
        return post;
    }
}
```

A request contains a validation object, this defines expected the structure of the
request. This includes types, whether its required, etc.

The validate function is called if the request passes the initial validation. At the 
point it's called, you can expect the properties to exist with the correct type.

Any other validation can be handled here, in this example, the icon id is checked to 
see if it's a valid id. To fail the validation, call this.fail() with an error message.
This message is returned in the response to the client.

Using the request in an endpoint is easy using the @request decorator. Let's update the 
create post endpoint using this request

```
// controller/post-controller.ts
 
import { request } from "kompost";
import CreatePostRequest from "../request/create-post-request";
 
... 
 
@post
@request(CreatePostRequest)
async create (post: Post) {
    await post.save;
    return 201;
}
 
...
```

The @request decorator takes the request type as an argument. To inject the model created 
from the request, it's as simple as adding the post as a parameter and it will be injected 
into the endpoint. The name of the parameter doesn't matter, only the type has to match.

### Transformers

When sending a model as a response, not all properties of the model will be applicable 
depending on the request. A nice way to change how the model is returned is a transformer.

Let's create a transformer for a post that hides the createAt and updatedAt timestamps.

```
// transformer/post-transformer.ts
 
import { Transformer, include, inject } from "kompost";
import { IconLoader } from "../service/icon-loader";
import Post from "../model/post";
 
export default class PostTransformer extends Transformer<Task> {
    @inject IconLoader iconLoader;
 
    protected async transform (post: Post) {
        return {
            id: post.id,
            message: post.message,
            icon: post.icon
        };
    }
 
    @include("icon-data")
    protected async includeIconData (post: Post, result: any) {    
        result.iconData = await this.iconLoader.load(post.icon);
    }
}
```

In this example, we also added an include to load the icon data. Includes allow the 
request to specify a query parameter to insert extra data in the resulting response.

We'll update the index and show endpoints to use the transformer. 

```
// controller/post-controller.ts
 
import { transform } from "kompost";
import PostTransformer from "../transformer/post-transformer";
 
... 
 
@get(":id")
@transform(PostTransformer)
async show (id: string) {
    return await Post.findOneById(id);
}
 
@get
@transform(PostTransformer)
async index () {
    return await Post.find();
}
 
...
```

Simply adding the @transform decorator to the endpoints causes the response to be 
automatically transformed.

Making the following call GET /api/posts/1 will now result in.

```
STATUS: 200
 
BODY:
{
    "id": 0,
    "message": "MY MESSAGE",
    "icon": 14
}
```

Adding the include parameter to request, GET /api/posts/1?include=icon-data, changes 
the result to the following.

```
STATUS: 200
 
BODY:
{
    "id": 0,
    "message": "MY MESSAGE",
    "icon": 14,
    "iconData": "BINARY_BLOB_DATA"
}
```

### Pagination

When dealing with large data sets, pagination can be used to prevent lengthy query times.
Let's update the index endpoint to use pagination.

First we need to create an entity to handle the query parameters.

```
// entity/post-query.ts
 
export default class PostQuery {
    limit?: number;
    start?: number;
}
```

Next we need a request to handle the query.

```
// request/task-query.ts
 
import { Request, Validation } from "kompost"
import PostQuery from "../entity/post-query";
 
export default class TaskQueryRequest extends Request<PostQuery> {
    public type = PostQuery;
 
    protected validation: Validation = {
        start: ["integer", "optional"],
        limit: ["integer", "optional"]
    };
 
    protected async validate (model: any): Promise<PostQuery> {
        const query = new PostQuery();

        query.start = model.start;
        query.limit = model.limit;

        return query;
    }
}
```

Now we can add the request to the controller and add the pagination.

```
// controller/post-controller.ts
 
import PostQueryRequest from "../request/post-query";
import PostQuery from "../entity/post-query";
 
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
 
... 
 
@get
@request(PostQueryRequest)
@transform(PostTransformer)
async index ({ limit = DEFAULT_LIMIT, start = 0 }: PostQuery) {
 
    if (limit > MAX_LIMIT) {
        this.error(400, { error: `Maximum pagination limit is ${MAX_LIMIT}.` });
    }
 
    const [tasks, postCount] = await Post.findAndCount({
        skip: start,
        take: limit
    });
 
    return this.paginate(tasks, start, taskCount);
}
 
...
```

Using TypeORM we can offset the query by a given number of entities.
We load the data at this offset and the requested amount and return it as a paginated item.


### Finishing Up

To finish up the last of the resource, let's add the update and delete methods to the 
controller. First we'll create a request for updating a post.

```
// request/update-post-request.ts
 
import { Request, Validation } from "kompost";
import Post from "../model/post";
 
export default class UpdatePostRequest extends Request<Post> {
    public type = Post;
  
    protected validation: Validation = {
        message: ["optional", string"],
        icon: ["optional", "integer"]
    };
 
    protected async validate (model: any) {
        const post = new Post();
 
        post.message = model.message;
        post.icon = model.icon;
 
        if (post.icon && !isValidIcon(post.icon)) {
            this.fail(`Invalid icon ${post.icon}`);
        }
 
        return post;
    }
}
```

And finally add the methods.

```
// controller/post-controller.ts
 
import { transform } from "kompost";
import UpdatePostRequest from "../request/update-post-request";
 
...
 
@put(":id")
@request(UpdatePostRequest)
public async update (id: string, request: Post) {
    const post = await Post.findOneById(id);
 
    Object.entries(request).forEach(([key, value]) => post[key] = value);
 
    await post.save();
    return 204;
}

@del(":id")
public async destroy (id: string) {
    const post = await Post.findOneById(id);
 
    await post.remove();
    return 204;
}
 
...
``` 
