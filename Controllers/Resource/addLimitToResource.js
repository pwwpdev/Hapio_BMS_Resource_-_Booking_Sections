// this class would be adding a parameter called capacity to an object , which is generally the metadata object.

function addLimitToResource(metadata, capacity) {
    metadata.capacity = capacity;
    return metadata;
}

module.exports = { addLimitToResource }

// {capacity : ${capacity}}
