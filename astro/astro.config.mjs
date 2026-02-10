import { defineConfig } from "astro/config";

import react from "@astrojs/react";

export default defineConfig({
  image: {
    domains: ["mir-s3-cdn-cf.behance.net"],
  },

  integrations: [react()],
});