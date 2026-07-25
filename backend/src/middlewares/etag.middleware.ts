import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// Adds conditional-GET support (RFC 7232) to any route it's mounted on: every
// 200 GET response gets an ETag computed from its body, and a request whose
// If-None-Match header matches gets a bodyless 304 instead of the full
// payload — the standard "did this change since I last asked" pattern.
export function etagMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.method !== "GET") {
        return next();
    }

    const originalJson = res.json.bind(res);

    res.json = ((body: unknown) => {
        if (res.statusCode === 200) {
            const hash = crypto.createHash("sha1").update(JSON.stringify(body)).digest("hex");
            const etag = `"${hash}"`;
            res.setHeader("ETag", etag);

            const clientETag = req.headers["if-none-match"];
            if (clientETag === etag) {
                res.status(304);
                return res.end();
            }
        }
        return originalJson(body);
    }) as Response["json"];

    next();
}
