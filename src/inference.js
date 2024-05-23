const tfjs = require("@tensorflow/tfjs-node");
function loadModel() {
  const modelUrl =
    "https://storage.googleapis.com/cancer-models/models/model.json";
  return tfjs.loadGraphModel(modelUrl);
}

function predict(model, imageBuffer) {
  const imageTensor = tfjs.node
    .decodeImage(imageBuffer)
    .resizeBilinear([224, 224])
    .expandDims();
  return model.predict(imageTensor).data();
}

module.exports = { loadModel, predict };
