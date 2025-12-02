// plugins/encryptFieldsPlugin.js
const { encryptValue, decryptValue, isEncryptedObject } = require('../utils/cryptoUtil');

// Get nested value: a.b.c
function getByPath(obj, path) {
  if (!obj) return undefined;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}

// Set nested value: a.b.c = value (create branches if needed)
function setByPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

// Encrypt a single field on a doc-like object
function encryptFieldOnDoc(doc, path) {
  const val = getByPath(doc, path);
  if (val === undefined || val === null) return;
  if (isEncryptedObject(val)) return; // already encrypted

  const enc = encryptValue(val);
  setByPath(doc, path, enc);
}

// Decrypt a single field on a doc-like object
function decryptFieldOnDoc(doc, path) {
  const val = getByPath(doc, path);
  if (!isEncryptedObject(val)) return;

  try {
    const dec = decryptValue(val);
    setByPath(doc, path, dec);
  } catch {
    // ignore bad decrypt
  }
}

module.exports = function encryptFieldsPlugin(schema, options) {
  if (!options || !Array.isArray(options.paths)) {
    throw new Error('encryptFieldsPlugin requires { paths: [..] }');
  }
  const paths = options.paths;

  //
  // 🔐 ENCRYPT ON SAVE
  //
  schema.pre('save', function (next) {
    try {
      for (const path of paths) {
        encryptFieldOnDoc(this, path);
      }
      next();
    } catch (err) {
      next(err);
    }
  });

  //
  // 🔐 ENCRYPT ON UPDATEs (updateOne, updateMany, findOneAndUpdate, update)
  //
  async function encryptUpdate(next) {
    try {
      const update = this.getUpdate && this.getUpdate();
      if (!update) return next();

      const fineTargets = ['$set', '$setOnInsert'];

      for (const path of paths) {
        // Handle $set / $setOnInsert
        for (const op of fineTargets) {
          if (update[op] && Object.prototype.hasOwnProperty.call(update[op], path)) {
            const raw = update[op][path];
            if (raw !== undefined && raw !== null && !isEncryptedObject(raw)) {
              update[op][path] = encryptValue(raw);
            }
          }
        }
        // Direct top-level path in update
        if (Object.prototype.hasOwnProperty.call(update, path)) {
          const raw = update[path];
          if (raw !== undefined && raw !== null && !isEncryptedObject(raw)) {
            update[path] = encryptValue(raw);
          }
        }
      }

      this.setUpdate(update);
      next();
    } catch (err) {
      next(err);
    }
  }

  schema.pre('findOneAndUpdate', encryptUpdate);
  schema.pre('updateOne', encryptUpdate);
  schema.pre('updateMany', encryptUpdate);
  schema.pre('update', encryptUpdate);

  //
  // 🔓 DECRYPT ON READ (find, findOne, findOneAndUpdate)
  //
  schema.post('find', function (docs) {
    if (!Array.isArray(docs)) return;
    for (const doc of docs) {
      for (const path of paths) {
        decryptFieldOnDoc(doc, path);
      }
    }
  });

  schema.post('findOne', function (doc) {
    if (!doc) return;
    for (const path of paths) {
      decryptFieldOnDoc(doc, path);
    }
  });

  schema.post('findOneAndUpdate', function (doc) {
    if (!doc) return;
    for (const path of paths) {
      decryptFieldOnDoc(doc, path);
    }
  });

  //
  // 🔓 DECRYPT IN toJSON (for res.json)
  //
  schema.set('toJSON', {
    transform: function (_, ret) {
      for (const path of paths) {
        decryptFieldOnDoc(ret, path);
      }
      return ret;
    },
  });
};
