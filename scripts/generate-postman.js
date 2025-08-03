const fs = require("fs");
const path = require("path");
const axios = require("axios");

/**
 * Generate Postman Collection from Swagger/OpenAPI
 * This script fetches the Swagger JSON and converts it to a Postman collection
 */
class PostmanCollectionGenerator {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
    this.swaggerUrl = `${this.baseUrl}/api-docs.json`;
    this.outputPath = path.join(
      __dirname,
      "../postman/HR-Backend-API.postman_collection.json"
    );
  }

  /**
   * Generate Postman collection
   */
  async generate() {
    try {
      console.log("🔄 Fetching Swagger documentation...");

      // Fetch Swagger JSON
      const swaggerSpec = await this.fetchSwaggerSpec();

      // Convert to Postman collection
      const postmanCollection = this.convertToPostmanCollection(swaggerSpec);

      // Ensure output directory exists
      this.ensureOutputDirectory();

      // Write collection to file
      await this.writeCollection(postmanCollection);

      console.log("✅ Postman collection generated successfully!");
      console.log(`📁 Location: ${this.outputPath}`);
    } catch (error) {
      console.error("❌ Failed to generate Postman collection:", error.message);
      process.exit(1);
    }
  }

  /**
   * Fetch Swagger specification
   * @returns {Object} Swagger specification
   */
  async fetchSwaggerSpec() {
    try {
      const response = await axios.get(this.swaggerUrl);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Swagger spec: ${error.message}`);
    }
  }

  /**
   * Convert Swagger spec to Postman collection
   * @param {Object} swaggerSpec - Swagger specification
   * @returns {Object} Postman collection
   */
  convertToPostmanCollection(swaggerSpec) {
    const collection = {
      info: {
        name: swaggerSpec.info.title || "HR Backend API",
        description:
          swaggerSpec.info.description || "Complete HR Management System API",
        schema:
          "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        _postman_id: this.generateId(),
      },
      auth: {
        type: "bearer",
        bearer: [
          {
            key: "token",
            value: "{{accessToken}}",
            type: "string",
          },
        ],
      },
      variable: [
        {
          key: "baseUrl",
          value: this.baseUrl,
          type: "string",
        },
        {
          key: "apiVersion",
          value: "v1",
          type: "string",
        },
        {
          key: "accessToken",
          value: "",
          type: "string",
        },
      ],
      item: [],
    };

    // Group endpoints by tags
    const groupedEndpoints = this.groupEndpointsByTags(swaggerSpec.paths);

    // Convert each group to Postman folder
    Object.keys(groupedEndpoints).forEach((tag) => {
      const folder = {
        name: tag,
        item: [],
      };

      groupedEndpoints[tag].forEach((endpoint) => {
        const item = this.convertEndpointToPostmanItem(endpoint, swaggerSpec);
        folder.item.push(item);
      });

      collection.item.push(folder);
    });

    return collection;
  }

  /**
   * Group endpoints by tags
   * @param {Object} paths - Swagger paths
   * @returns {Object} Grouped endpoints
   */
  groupEndpointsByTags(paths) {
    const grouped = {};

    Object.keys(paths).forEach((path) => {
      const pathItem = paths[path];

      Object.keys(pathItem).forEach((method) => {
        const operation = pathItem[method];

        if (operation.tags && operation.tags.length > 0) {
          const tag = operation.tags[0]; // Use first tag

          if (!grouped[tag]) {
            grouped[tag] = [];
          }

          grouped[tag].push({
            path,
            method: method.toUpperCase(),
            operation,
          });
        }
      });
    });

    return grouped;
  }

  /**
   * Convert endpoint to Postman item
   * @param {Object} endpoint - Endpoint object
   * @param {Object} swaggerSpec - Swagger specification
   * @returns {Object} Postman item
   */
  convertEndpointToPostmanItem(endpoint, swaggerSpec) {
    const { path, method, operation } = endpoint;

    const item = {
      name: operation.summary || operation.operationId || `${method} ${path}`,
      request: {
        method: method,
        header: this.getHeaders(operation),
        url: {
          raw: `{{baseUrl}}/api/{{apiVersion}}${path}`,
          host: ["{{baseUrl}}"],
          path: ["api", "{{apiVersion}}", ...path.split("/").filter(Boolean)],
          query: this.getQueryParams(operation),
        },
        description: operation.description || "",
      },
      response: [],
    };

    // Add body if required
    if (operation.requestBody) {
      item.request.body = this.getRequestBody(
        operation.requestBody,
        swaggerSpec
      );
    }

    return item;
  }

  /**
   * Get headers for request
   * @param {Object} operation - Operation object
   * @returns {Array} Headers array
   */
  getHeaders(operation) {
    const headers = [
      {
        key: "Content-Type",
        value: "application/json",
        type: "text",
      },
    ];

    // Add authorization header if required
    if (operation.security && operation.security.length > 0) {
      headers.push({
        key: "Authorization",
        value: "Bearer {{accessToken}}",
        type: "text",
      });
    }

    return headers;
  }

  /**
   * Get query parameters
   * @param {Object} operation - Operation object
   * @returns {Array} Query parameters array
   */
  getQueryParams(operation) {
    const queryParams = [];

    if (operation.parameters) {
      operation.parameters.forEach((param) => {
        if (param.in === "query") {
          queryParams.push({
            key: param.name,
            value: param.example || "",
            description: param.description || "",
            disabled: !param.required,
          });
        }
      });
    }

    return queryParams;
  }

  /**
   * Get request body
   * @param {Object} requestBody - Request body object
   * @param {Object} swaggerSpec - Swagger specification
   * @returns {Object} Request body object
   */
  getRequestBody(requestBody, swaggerSpec) {
    const contentType =
      Object.keys(requestBody.content)[0] || "application/json";
    const schema = requestBody.content[contentType].schema;

    return {
      mode: "raw",
      raw: this.generateExampleFromSchema(schema, swaggerSpec),
      options: {
        raw: {
          language: "json",
        },
      },
    };
  }

  /**
   * Generate example from schema
   * @param {Object} schema - Schema object
   * @param {Object} swaggerSpec - Swagger specification
   * @returns {string} JSON example
   */
  generateExampleFromSchema(schema, swaggerSpec) {
    if (!schema) return "{}";

    if (schema.$ref) {
      const refSchema = this.resolveRef(schema.$ref, swaggerSpec);
      return JSON.stringify(
        this.generateExampleFromProperties(refSchema.properties),
        null,
        2
      );
    }

    if (schema.properties) {
      return JSON.stringify(
        this.generateExampleFromProperties(schema.properties),
        null,
        2
      );
    }

    return "{}";
  }

  /**
   * Generate example from properties
   * @param {Object} properties - Properties object
   * @returns {Object} Example object
   */
  generateExampleFromProperties(properties) {
    const example = {};

    if (!properties) return example;

    Object.keys(properties).forEach((prop) => {
      const property = properties[prop];

      if (property.example !== undefined) {
        example[prop] = property.example;
      } else if (property.type === "string") {
        if (property.enum && property.enum.length > 0) {
          example[prop] = property.enum[0];
        } else if (property.format === "email") {
          example[prop] = "user@example.com";
        } else if (property.format === "date") {
          example[prop] = "2024-01-01";
        } else if (property.format === "date-time") {
          example[prop] = "2024-01-01T00:00:00Z";
        } else if (property.format === "uuid") {
          example[prop] = "123e4567-e89b-12d3-a456-426614174000";
        } else {
          example[prop] = "string";
        }
      } else if (property.type === "number" || property.type === "integer") {
        example[prop] = 0;
      } else if (property.type === "boolean") {
        example[prop] = false;
      } else if (property.type === "array") {
        example[prop] = [];
      } else if (property.type === "object") {
        example[prop] = {};
      }
    });

    return example;
  }

  /**
   * Resolve reference
   * @param {string} ref - Reference string
   * @param {Object} swaggerSpec - Swagger specification
   * @returns {Object} Referenced schema
   */
  resolveRef(ref, swaggerSpec) {
    const path = ref.replace("#/", "").split("/");
    let result = swaggerSpec;

    path.forEach((segment) => {
      result = result[segment];
    });

    return result;
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDirectory() {
    const outputDir = path.dirname(this.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  /**
   * Write collection to file
   * @param {Object} collection - Postman collection
   */
  async writeCollection(collection) {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        this.outputPath,
        JSON.stringify(collection, null, 2),
        "utf8",
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
}

// Run the generator
if (require.main === module) {
  const generator = new PostmanCollectionGenerator();
  generator.generate();
}

module.exports = PostmanCollectionGenerator;
