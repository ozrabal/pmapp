import { ActionError, defineAction } from "astro:actions";
import { Resend } from "resend";
import { RESEND_API_KEY } from "astro:env/server";

const resend = new Resend(RESEND_API_KEY);

export const server = {
  send: defineAction({
    accept: "form",
    handler: async (d: FormData) => {
      const { data, error } = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: ["ozrabal@gmail.com"],
        subject: "Plan My App - New Subscriber",
        html: `<p>New subscriber to Plan My App</p>${d.get("email") ? `<p>Email: ${d.get("email")}</p>` : ""}`,
      });

      if (error) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return data;
    },
  }),
};
