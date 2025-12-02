const { decryptValue, isEncryptedObject } = require("../utils/cryptoUtil");

function getByPath(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

function setByPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object")
      cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function applyDecrypt(doc, paths) {
  if (!doc || typeof doc !== "object") return;
  for (const path of paths) {
    const value = getByPath(doc, path);
    if (isEncryptedObject(value)) {
      try {
        const dec = decryptValue(value);
        setByPath(doc, path, dec);
      } catch {}
    }
  }
}

module.exports = function mongooseDecryptPlugin(schema) {
  const paths = schema.options.encryptedPaths || [];

  if (!paths.length) return;

  // Decrypt only on reads, not writes
  schema.post("find", function (docs) {
    if (Array.isArray(docs)) {
      for (const d of docs) applyDecrypt(d, paths);
    }
  });

  schema.post("findOne", function (doc) {
    applyDecrypt(doc, paths);
  });

  schema.post("findOneAndUpdate", function (doc) {
    applyDecrypt(doc, paths);
  });

  // For JSON output
  schema.set("toJSON", {
    transform: function (_, ret) {
      applyDecrypt(ret, paths);
      return ret;
    },
  });
};
