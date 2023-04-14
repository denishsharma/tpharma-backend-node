export default class Response {
    public static createResponse(data: any = {}, message: string = "") {
        return {
            ...(data && { data }),
            ...(message && { message }),
        };
    }
}
