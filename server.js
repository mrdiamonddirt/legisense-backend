const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // Import the Swagger configuration
require("dotenv").config();

const app = express();
const port = 4444; // 4444 for local dev, 3000 for Docker

app.use(express.json());
app.use("/", express.static("build"));

// Serve the Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.get("/", function (req, res) {
//   res.render("build/index.html");
// });

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check the health of the server.
 *     responses:
 *       200:
 *         description: Server is healthy.
 */
app.get("/health", function (req, res) {
  res.send("OK");
});


/**
 * @swagger
 * /v1/query:
 *   post:
 *     summary: Proxy a request to an external service.
 *     description: Proxy a request to an external service with specific headers.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The request body data to be sent in the proxy request.
 *     responses:
 *       200:
 *         description: Successfully proxied the request.
 */
const proxyOptions = {
  target: `https://${process.env.endpoint}`,
  changeOrigin: true,
  pathRewrite: { '^/v1/query': '/v1/query' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader("Content-Type", "application/json");
    proxyReq.setHeader("Accept", "application/json");
    proxyReq.setHeader("customer-id", process.env.customer_id);
    proxyReq.setHeader("x-api-key", process.env.api_key);
    proxyReq.setHeader("grpc-timeout", "60S");

    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
};
app.use('/v1/query', createProxyMiddleware(proxyOptions));

app.post("/config", (req, res) => {
  const {
    // Search
    endpoint,
    corpus_id,
    customer_id,
    api_key,


    // everything after this point isn't setup yet
    // App
    ux,
    app_title,
    enable_app_header,
    enable_app_footer,

    // App header
    app_header_logo_link,
    app_header_logo_src,
    app_header_logo_alt,
    app_header_logo_height,
    app_header_learn_more_link,
    app_header_learn_more_text,

    // Filters
    enable_source_filters,
    all_sources,
    sources,

    // summary
    summary_default_language,
    summary_num_results,
    summary_num_sentences,
    summary_prompt_name,

    // hybrid search
    hybrid_search_num_words,
    hybrid_search_lambda_long,
    hybrid_search_lambda_short,

    // rerank
    rerank,
    rerank_num_results,

    // MMR
    mmr,
    mmr_num_results,
    mmr_diversity_bias,

    // Search header
    search_logo_link,
    search_logo_src,
    search_logo_alt,
    search_logo_height,
    search_title,
    search_description,
    search_placeholder,

    // Auth
    authenticate,
    google_client_id,

    // Analytics
    google_analytics_tracking_code,
    full_story_org_id,
  } = process.env;

  res.send({
    // Search
    endpoint,
    corpus_id,
    customer_id,
    api_key,

    // everything after this point isn't setup yet
    // App
    ux,
    app_title,
    enable_app_header,
    enable_app_footer,

    // App header
    app_header_logo_link,
    app_header_logo_src,
    app_header_logo_alt,
    app_header_logo_height,
    app_header_learn_more_link,
    app_header_learn_more_text,

    // Filters
    enable_source_filters,
    all_sources,
    sources,

    // summary
    summary_default_language,
    summary_num_results,
    summary_num_sentences,
    summary_prompt_name,

    // hybrid search
    hybrid_search_num_words,
    hybrid_search_lambda_long,
    hybrid_search_lambda_short,

    // rerank
    rerank,
    rerank_num_results,

    // MMR
    mmr,
    mmr_num_results,
    mmr_diversity_bias,

    // Search header
    search_logo_link,
    search_logo_src,
    search_logo_alt,
    search_logo_height,
    search_title,
    search_description,
    search_placeholder,

    // Auth
    authenticate,
    google_client_id,

    // Analytics
    google_analytics_tracking_code,
    full_story_org_id,
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});