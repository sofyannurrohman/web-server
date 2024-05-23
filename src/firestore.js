const admin = require("firebase-admin");
const serviceAccount = require("./submissionmlgc-sofyan-f806a3f63a51");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

async function store_data(id, result, suggestion, createdAt) {
  const predictCollection = firestore.collection("predictions");
  const predictions = await predictCollection.doc(id);
  const payload = {
    result: result,
    suggestion: suggestion,
    createdAt: createdAt,
  };
  return await predictions.set(payload);
}

module.exports = { store_data };
