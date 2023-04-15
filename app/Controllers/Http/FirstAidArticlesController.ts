import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema, validator } from "@ioc:Adonis/Core/Validator";
import FirstAidArticle from "App/Models/FirstAidArticle";
import { DateTime } from "luxon";
import slugify from "slugify";
import Response from "App/Helpers/Response";
import { generateRandom } from "@poppinss/utils/build/src/Helpers/string";

export default class FirstAidArticlesController {
    public async index({ response }: HttpContextContract) {
        const articles = await FirstAidArticle.query().orderBy("published_at", "desc");

        return response.status(200).json(Response.createResponse(articles.map((article) => article.serialize({
            fields: { pick: ["title", "slug", "description", "published_at"] },
        })), "Articles fetched successfully"));
    }

    public async create({ request, response }: HttpContextContract) {
        const { title, description, content } = request.only(["title", "description", "content"]);

        // validate the data
        let validatedData: { title: string; description: string | undefined; content: string; };
        try {
            validatedData = await validator.validate({
                schema: schema.create({
                    title: schema.string({ trim: true }, [rules.minLength(3)]),
                    description: schema.string.optional({ trim: true }, [rules.minLength(3)]),
                    content: schema.string({ trim: true }, [rules.minLength(3)]),
                }),
                data: { title, description, content },
                reporter: validator.reporters.jsonapi,
            });
        } catch (e) {
            return response.status(400).json({
                message: "Validation failed",
                errors: e.messages,
            });
        }

        // create the article
        const article = await FirstAidArticle.create({
            title: validatedData.title,
            slug: slugify(`${validatedData.title} ${generateRandom(5)}`, { lower: true }),
            description: validatedData.description,
            content: validatedData.content,
            publishedAt: DateTime.now(),
        });

        return response.status(200).json(Response.createResponse(article, "Article created successfully"));
    }

    public async show({ params, response }: HttpContextContract) {
        const { slug } = params;

        // validate the data
        let validatedData: { slug: string; };
        try {
            validatedData = await validator.validate({
                schema: schema.create({
                    slug: schema.string({ trim: true }, [rules.exists({
                        table: "first_aid_articles",
                        column: "slug",
                    })]),
                }),
                data: { slug },
                reporter: validator.reporters.jsonapi,
            });
        } catch (e) {
            return response.status(400).json({
                message: "Validation failed",
                errors: e.messages,
            });
        }

        return response.status(200).json(Response.createResponse((await FirstAidArticle.findByOrFail("slug", validatedData.slug)).serialize({
            fields: { pick: ["title", "slug", "description", "content", "published_at"] },
        }), "Article fetched successfully"));
    }

    public async update({ params, request, response }: HttpContextContract) {
        const { slug } = params;
        const { title, description, content } = request.only(["title", "description", "content"]);

        // validate the data
        let validatedData: {
            slug: string;
            title: string | undefined;
            description: string | undefined;
            content: string | undefined;
        };
        try {
            validatedData = await validator.validate({
                schema: schema.create({
                    slug: schema.string({ trim: true }, [rules.exists({
                        table: "first_aid_articles",
                        column: "slug",
                    })]),
                    title: schema.string.optional({ trim: true }, [rules.minLength(3)]),
                    description: schema.string.optional({ trim: true }, [rules.minLength(3)]),
                    content: schema.string.optional({ trim: true }, [rules.minLength(3)]),
                }),
                data: { slug, title, description, content },
                reporter: validator.reporters.jsonapi,
            });
        } catch (e) {
            return response.status(400).json({
                message: "Validation failed",
                errors: e.messages,
            });
        }

        // get the article
        const article = await FirstAidArticle.findByOrFail("slug", validatedData.slug);

        // update the article
        article.merge({
            title: validatedData.title,
            description: validatedData.description,
            content: validatedData.content,
        });
        await article.save();

        return response.status(200).json(Response.createResponse(article, "Article updated successfully"));
    }

    public async archive({ params, response, request }: HttpContextContract) {
        const { slug } = params;
        const { archive } = request.qs();

        // validate the data
        let validatedData: { slug: string; archive: boolean; };
        try {
            validatedData = await validator.validate({
                schema: schema.create({
                    slug: schema.string({ trim: true }),
                    archive: schema.boolean(),
                }),
                data: { slug, archive },
                reporter: validator.reporters.jsonapi,
            });
        } catch (e) {
            return response.status(400).json({
                message: "Validation failed",
                errors: e.messages,
            });
        }

        // get the article
        let message = "Article archived successfully";
        const article = await FirstAidArticle.withTrashed().where("slug", validatedData.slug).first();

        if (!article) {
            return response.status(404).json(Response.createResponse(null, "Article not found"));
        }

        if (validatedData.archive) {
            article.delete();
        } else {
            article.merge({ deletedAt: null });
            message = "Article restored successfully";
        }

        await article.save();

        return response.status(200).json(Response.createResponse(article, message));
    }
}

