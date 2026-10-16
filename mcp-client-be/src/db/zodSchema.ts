import { z } from "zod";

export const McpServerSchema = z.object({
  name: z.string().min(1),
  command: z.string().min(1),
  args: z.array(z.string()).optional(),
  cwd: z.string().optional(),
});

export const ModelNetwork = z.object({
  modelNetwork: z
    .string()
    .trim()
    .refine(
      (value) => {
        const url = new URL(value);

        const validProtocol =
          url.protocol === "http:" || url.protocol === "https:";

        const validPort = url.port === "" || url.port === "11434";

        return validProtocol && validPort;
      },
      {
        message: "Use an HTTP/HTTPS URL with port 11434",
      },
    ),
});

export const ModelOnNetwork = z.object({
  modelNetwork: z
    .string()
    .trim()
    .refine(
      (value) => {
        const url = new URL(value);

        const validProtocol =
          url.protocol === "http:" || url.protocol === "https:";

        const validPort = url.port === "" || url.port === "11434";

        return validProtocol && validPort;
      },
      {
        message: "Use an HTTP/HTTPS URL with port 11434",
      },
    ),
  modelName: z.string().min(1),
});
