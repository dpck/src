## bundles chunks
test/fixture/chunks/chunkA.js test/fixture/chunks/chunkB.js

/* expected */
# $weak$.js




# chunkA.js

console.log("chunk a");console.log("common");c();


# chunkB.js

console.log("chunk b");console.log("common");c();


# common.js

function c(){var a=void 0===a?{}:a;a=a.a;window.b&&a&&console.log("test")};

/**/