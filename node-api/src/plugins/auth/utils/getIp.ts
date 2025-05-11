import { Request } from "express";
import { getClientIp } from "request-ip";

export const realIpRequest = (req: Request) => {
    let ip: string;
    if (req.headers["cf-connecting-ip"]) {
        if (Array.isArray(req.headers["cf-connecting-ip"])) {
            ip = req.headers["cf-connecting-ip"][0]
        } else {
            ip = req.headers["cf-connecting-ip"]
        }
    } else if (req.headers["x-next-ip"]) {
        if (Array.isArray(req.headers["x-next-ip"])) {
            ip = req.headers["x-next-ip"][0]
        } else {
            ip = req.headers["x-next-ip"]
        }
    } else {
        ip = getClientIp(req) || ''
    }
    return ip
}