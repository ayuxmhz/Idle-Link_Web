import { describe, it, expect, vi } from "vitest";
import { submitToEsewa } from "@/lib/esewaRedirect";

describe("submitToEsewa", () => {
    it("builds and submits a hidden form with the given fields", () => {
        const submitSpy = vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(() => {});

        submitToEsewa("https://esewa.example/pay", {
            amount: "500",
            tax_amount: "0",
            total_amount: "500",
            transaction_uuid: "uuid-1",
            product_code: "EPAYTEST",
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: "https://app.example/success",
            failure_url: "https://app.example/failure",
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature: "sig",
        });

        const form = document.querySelector("form");
        expect(form).toBeTruthy();
        expect(form?.method).toBe("post");
        expect(form?.action).toBe("https://esewa.example/pay");
        expect(form?.querySelector('input[name="transaction_uuid"]')).toHaveAttribute("value", "uuid-1");
        expect(submitSpy).toHaveBeenCalled();

        submitSpy.mockRestore();
        form?.remove();
    });
});
