try {
    const { v4: uuidv4 } = require('uuid');
    console.log("UUID v4:", uuidv4());
} catch (e) {
    console.error("UUID load failed:", e.message);
}
