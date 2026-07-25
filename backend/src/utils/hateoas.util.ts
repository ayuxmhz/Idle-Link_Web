// Lightweight HATEOAS helpers — every response carries the links for the
// actions actually valid from its current state (e.g. a "cancel" link only
// appears on a running booking), so a client can drive the API by following
// links instead of hardcoding URL structure.

export interface Link {
    href: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
}

// Mongoose documents type _id/owner/etc. as ObjectId, plain enriched
// objects (from .toObject() spreads) type them as string — both expose
// .toString(), which is all these helpers need.
type Stringable = { toString(): string };

export function buildDeviceLinks(
    device: { _id: Stringable; owner: Stringable; status: string; hasActiveBooking?: boolean },
    requesterId?: string
): Record<string, Link> {
    const id = device._id.toString();
    const isOwner = requesterId && device.owner.toString() === requesterId;

    const links: Record<string, Link> = {
        self: { href: `/api/v1/devices/${id}`, method: "GET" },
        ratings: { href: `/api/v1/ratings/device/${id}`, method: "GET" }
    };

    if (isOwner) {
        links.update = { href: `/api/v1/devices/${id}`, method: "PUT" };
        links.delete = { href: `/api/v1/devices/${id}`, method: "DELETE" };
    } else if (device.status === "live" && !device.hasActiveBooking) {
        links.book = { href: "/api/v1/bookings", method: "POST" };
    }

    return links;
}

export function buildBookingLinks(
    booking: { _id: Stringable; device: Stringable; buyer: Stringable; seller: Stringable; status: string; rating?: unknown },
    requesterId?: string
): Record<string, Link> {
    const id = booking._id.toString();
    const isBuyer = requesterId && booking.buyer.toString() === requesterId;

    const links: Record<string, Link> = {
        self: { href: `/api/v1/bookings/${id}`, method: "GET" },
        device: { href: `/api/v1/devices/${booking.device}`, method: "GET" }
    };

    if (isBuyer && booking.status === "running") {
        links.cancel = { href: `/api/v1/bookings/${id}`, method: "PATCH" };
        links.complete = { href: `/api/v1/bookings/${id}`, method: "PATCH" };
    }

    if (isBuyer && booking.status === "completed" && !booking.rating) {
        links.rate = { href: "/api/v1/ratings", method: "POST" };
    }

    return links;
}
