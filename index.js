module.exports = function (schema, options) {
    var mongoose = options.mongoose;
    var message = options.message || 'unique';
    schema.eachPath(function (path, schemaType) {
        if (schemaTypeHasUniqueIndex(schemaType)) {
            var validator = buildUniqueValidator(path, mongoose);
            schemaType.validate(validator, message.replace(/{}/i,path));
        }
    });
};

function schemaTypeHasUniqueIndex(schemaType) {
    return schemaType._index && schemaType._index.unique;
}

function buildUniqueValidator(path, mongoose) {
    return function (value, respond) {
        var model = mongoose.connection.model(this.constructor.modelName);
        var query = buildQuery(path, value);
        var callback = buildValidationCallback(respond);
        model.findOne(query, callback);
    };
}

function buildQuery(field, value) {
    var query = {};
    query[field] = value;
    return query;
}

function buildValidationCallback(respond) {
    return function (err, document) {
        respond(!document);
    };
}
