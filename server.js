const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // Import the Swagger configuration
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 4444; // 4444 for local dev, 3000 for Docker

app.use(express.json());
app.use("/", express.static("build"));

app.use(cors());

// Serve the Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.get("/", function (req, res) {
//   res.render("build/index.html");
// });

// Swagger for the /helth endpoint
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

// Swagger for the //new/data.feed endpoint
/**
 * @swagger
 * /new/data.feed:
 *   get:
 *     summary: Get data from new legislation feed.
 *     description: Fetch data from the new legislation feed at legislation.gov.uk.
 *     responses:
 *       200:
 *         description: Successful response.
 *       500:
 *         description: Internal server error.
 */

const proxyOptionsNewLegislation = {
  target: 'https://www.legislation.gov.uk', // Target URL without /new/data.feed
  changeOrigin: true,
  // No need for pathRewrite in this case
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('grpc-timeout', '60S');
  },
};

app.use('/new/data.feed', createProxyMiddleware(proxyOptionsNewLegislation));


/* Swagger documentation for the /chat/completions endpoint */
/**
 * @swagger
 * /chat/completions:
 *   post:
 *     summary: Get chat completions.
 *     description: Get chat completions from an external API.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *               messages:
 *                 type: array
 *               temperature:
 *                 type: number
 *           example:
 *             model: "meta-llama/Llama-2-70b-chat-hf"
 *             messages:
 *               - role: "system"
 *                 content: "You are a helpful assistant."
 *               - role: "user"
 *                 content: "I need help with my legal matter."
 *             temperature: 0.7
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Internal server error
 */

// Proxy route for making the POST request
const proxyOptionsChat = {
  target: `https://${process.env.llm_url}`,
  changeOrigin: true,
  pathRewrite: { '^/chat/completions': '/chat/completions' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader("Content-Type", "application/json");
    proxyReq.setHeader("Accept", "application/json");
    proxyReq.setHeader("Authorization", `Bearer ${process.env.token}`);
    proxyReq.setHeader("grpc-timeout", "60S");

    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
};

app.use('/chat/completions', createProxyMiddleware(proxyOptionsChat));

// Swagger for the /v1/query endpoint
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
 *             properties:
 *               query:
 *                 type: string
 *                 description: The query to be sent to the external service.
 *               language:
 *                 type: string
 *                 description: The language of the query.
 *               sources:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: The sources to search.
 *               rerank:
 *                 type: boolean
 *                 description: Whether to rerank the results.
 *               rerank_num_results:
 *                 type: number
 *                 description: The number of results to rerank.
 *               mmr:
 *                 type: boolean
 *                 description: Whether to rerank the results using MMR.
 *               mmr_num_results:
 *                 type: number
 *                 description: The number of results to rerank using MMR.
 *               mmr_diversity_bias:
 *                 type: number
 *                 description: The diversity bias to use for MMR.
 *               hybrid_search_num_words:
 *                 type: number
 *                 description: The number of words to use for hybrid search.
 *               hybrid_search_lambda_long:
 *                 type: number
 *                 description: The lambda long to use for hybrid search.
 *               hybrid_search_lambda_short:
 *                 type: number
 *                 description: The lambda short to use for hybrid search.
 *               summary_num_results:
 *                 type: number
 *                 description: The number of results to use for summary.
 *               summary_num_sentences:
 *                 type: number
 *                 description: The number of sentences to use for summary.
 *               summary_default_language:
 *                 type: string
 *                 description: The default language to use for summary.
 *               summary_prompt_name:
 *                 type: string
 *                 description: The prompt name to use for summary.
 *               enable_source_filters:
 *                 type: boolean
 *                 description: Whether to enable source filters.
 *           example:
 *             query: [
 *               {
 *                 query: "i need help with a legal matter pertaining to data in schools what legislation can help me?",
 *                 start: 0,
 *                 numResults: 10,
 *                 contextConfig: {
 *                   charsBefore: 30,
 *                   charsAfter: 30,
 *                   sentencesBefore: 3,
 *                   sentencesAfter: 3,
 *                   startTag: "<b>",
 *                   endTag: "</b>"
 *                 },
 *                 corpusKey: [
 *                   {
 *                     customerId: 1236398232,
 *                     corpusId: 3,
 *                     semantics: "DEFAULT",
 *                     dim: [
 *                       {
 *                         name: "string",
 *                         weight: 0
 *                       }
 *                     ],
 *                     metadataFilter: "part.lang = 'eng'",
 *                     lexicalInterpolationConfig: {
 *                       lambda: 0
 *                     }
 *                   }
 *                 ],
 *                 summary: [
 *                   {
 *                     summarizerPromptName: "vectara-summary-ext-v1.2.0",
 *                     maxSummarizedResults: 3,
 *                     responseLang: "eng"
 *                   }
 *                 ]
 *               }
 *             ]
 *     responses:
 *       200:
 *         description: Successfully proxied the request.
 *       500:
 *         description: Failed to proxy the request.
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

// app.post("/config", (req, res) => {
//   const {
//     // Search
//     endpoint,
//     corpus_id,
//     customer_id,
//     api_key,


//     // everything after this point isn't setup yet
//     // App
//     ux,
//     app_title,
//     enable_app_header,
//     enable_app_footer,

//     // App header
//     app_header_logo_link,
//     app_header_logo_src,
//     app_header_logo_alt,
//     app_header_logo_height,
//     app_header_learn_more_link,
//     app_header_learn_more_text,

//     // Filters
//     enable_source_filters,
//     all_sources,
//     sources,

//     // summary
//     summary_default_language,
//     summary_num_results,
//     summary_num_sentences,
//     summary_prompt_name,

//     // hybrid search
//     hybrid_search_num_words,
//     hybrid_search_lambda_long,
//     hybrid_search_lambda_short,

//     // rerank
//     rerank,
//     rerank_num_results,

//     // MMR
//     mmr,
//     mmr_num_results,
//     mmr_diversity_bias,

//     // Search header
//     search_logo_link,
//     search_logo_src,
//     search_logo_alt,
//     search_logo_height,
//     search_title,
//     search_description,
//     search_placeholder,

//     // Auth
//     authenticate,
//     google_client_id,

//     // Analytics
//     google_analytics_tracking_code,
//     full_story_org_id,
//   } = process.env;

//   res.send({
//     // Search
//     endpoint,
//     corpus_id,
//     customer_id,
//     api_key,

//     // everything after this point isn't setup yet
//     // App
//     ux,
//     app_title,
//     enable_app_header,
//     enable_app_footer,

//     // App header
//     app_header_logo_link,
//     app_header_logo_src,
//     app_header_logo_alt,
//     app_header_logo_height,
//     app_header_learn_more_link,
//     app_header_learn_more_text,

//     // Filters
//     enable_source_filters,
//     all_sources,
//     sources,

//     // summary
//     summary_default_language,
//     summary_num_results,
//     summary_num_sentences,
//     summary_prompt_name,

//     // hybrid search
//     hybrid_search_num_words,
//     hybrid_search_lambda_long,
//     hybrid_search_lambda_short,

//     // rerank
//     rerank,
//     rerank_num_results,

//     // MMR
//     mmr,
//     mmr_num_results,
//     mmr_diversity_bias,

//     // Search header
//     search_logo_link,
//     search_logo_src,
//     search_logo_alt,
//     search_logo_height,
//     search_title,
//     search_description,
//     search_placeholder,

//     // Auth
//     authenticate,
//     google_client_id,

//     // Analytics
//     google_analytics_tracking_code,
//     full_story_org_id,
//   });
// });

app.listen(port, () => {
  console.log(`Example app listening at ${process.env.server_endpoint}`); // https://legisense-backend.onrender.com for deployment
});