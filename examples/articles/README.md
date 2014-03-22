This is a basic API that supports CRUD operations on an Article resource.

API endpoinds:
* GET /articles - List all articles
* POST /articles - Create an article
* GET /articles/:id - View specific article
* PUT /articles/:id - Update specific article
* DELETE /articles/:id - Delete specific article

POST and PUT article expect the data send to have this format:
{
    "title": "Some title",
    "body": "Article body"
}
