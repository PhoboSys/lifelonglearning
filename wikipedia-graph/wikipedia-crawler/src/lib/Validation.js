const { partial } = require("lodash")

const isRequireType = (type, value) => {
    if (typeof value !== type) {
        throw new Error("String value is required, received " + typeof value);
    }
    return value
}
module.exports = {
    isRequireType,
    isRequireString: partial(isRequireType, "string")
}
