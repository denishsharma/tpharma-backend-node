import Route from "@ioc:Adonis/Core/Route";

export default function firstAidArticleRoutes() {
    Route.group(() => {
        Route.get("/", "FirstAidArticlesController.index");
        Route.post("/", "FirstAidArticlesController.create");

        Route.group(() => {
            Route.get("/", "FirstAidArticlesController.show");
            Route.post("/update", "FirstAidArticlesController.update");
            Route.post("/archive", "FirstAidArticlesController.archive");
        }).prefix("/:slug");
    }).prefix("first-aid-articles");
}
