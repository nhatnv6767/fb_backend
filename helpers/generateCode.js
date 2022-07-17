function generateCode(length) {
    let code = "";
    let schema = "0123456789";

    for (let i = 0; i < length; i++) {
        /* Generating a random number between 0 and the length of the schema string. */
        code += schema.charAt(Math.floor(Math.random() * schema.length));
    }
    return code;
};

module.exports = generateCode;