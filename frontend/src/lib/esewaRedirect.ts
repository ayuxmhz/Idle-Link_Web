import { EsewaFormFields } from "./api/esewa";

// eSewa has no JS SDK — integration is a redirect-based flow where the
// browser is navigated via a real form POST to eSewa's checkout page.
export function submitToEsewa(paymentUrl: string, fields: EsewaFormFields) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;

    Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
}
