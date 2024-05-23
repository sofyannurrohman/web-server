const Hapi = require("@hapi/hapi");
const { nanoid } = require("nanoid");

const { loadModel, predict } = require("./inference");
const { store_data } = require("./firestore");

const init = async () => {
  const model = await loadModel();
  const server = Hapi.server({
    host: "localhost",
    port: 3000,
  });

  server.route({
    method: "GET",
    path: "/",
    handler: async (request, h) => {
      return h.response("hello world");
    },
  });

  server.route({
    method: "POST",
    path: "/predicts",
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        maxBytes: 1000000,
      },
    },
    handler: async (request, h) => {
      try {
        const { image } = request.payload;
        const prediction = await predict(model, image);
        if (!image) {
          return h.response("Missing image in request body");
        }

        if (image.length > 1000000) {
          return h.response("Image size exceeds maximum (1MB)");
        }
        console.log(prediction);
        if (!image) {
          return h.response("Missing image in request body");
        }
        if (prediction > 0.5) {
          const response = {
            status: "success",
            message: "Model is predicted successfully",
            data: {
              id: nanoid(),
              result: "Cancer",
              suggestion: "Segera periksa ke dokter!",
              createdAt: new Date().toISOString(),
            },
          };
          const id = response.data.id;
          const result = response.data.result;
          const suggestion = response.data.suggestion;
          const createdAt = response.data.createdAt;
          await store_data(id, result, suggestion, createdAt);
          return h.response(response).code(200);
        }
        const responseNonCancer = {
          status: "success",
          message: "Model is predicted successfully",
          data: {
            id: nanoid(),
            result: "Non-Cancer",
            suggestion: "Apabila terdapat tanda-tanda segera check",
            createdAt: new Date().toISOString(),
          },
        };
        const id = responseNonCancer.data.id;
        const result = responseNonCancer.data.result;
        const suggestion = responseNonCancer.data.suggestion;
        const createdAt = responseNonCancer.data.createdAt;
        await store_data(id, result, suggestion, createdAt);

        return h.response(responseNonCancer).code(200);
      } catch (error) {
        console.log(error);
      }
      // get image that uploaded by user
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
