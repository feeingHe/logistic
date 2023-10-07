function getUuid(len) {
    const abc = '123456789abcdefghigklmnopqrstuvwxyz'.split('');
    const [max, min] = [Math.floor(Math.random() * (10 - 7 + 1) + 1), Math.floor(Math.random() * (17 - 10 + 1) + 17)];
    return abc
        .sort(() => 0.4 - Math.random())
        .slice(max, min)
        .slice(0, len || 16)
        .join('');
}

// check required fields
const checkRequiredField = (fields) => {
    const requiredFields = [];
    Object.entries(fields).forEach(([fieldKey, fieldVal]) => {
        if (fieldVal === undefined) {
            requiredFields.push(fieldKey);
        }
    })
    return requiredFields;
}

module.exports = {
    getUuid,
    checkRequiredField
};