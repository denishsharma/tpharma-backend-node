import Route from "@ioc:Adonis/Core/Route";

export default function authRoutes() {
    Route.group(() => {
        Route.post("login", "AuthController.login");
        Route.post("verify", "AuthController.verify");
        Route.post("resend", "AuthController.resend");

        Route.group(() => {
            Route.post("logout", "AuthController.logout")
            Route.post("me", "AuthController.me")
            Route.post("password", "AuthController.updatePassword")
        }).middleware("auth:api");

    }).prefix("auth");
}
