#!/bin/sh

echo "Patching dist/index.js for relative path to zeebe.proto in GitHub Action"
# add proto file for packaged action
cp node_modules/zeebe-node/proto/zeebe.proto proto/

# Change path to proto file for packaged action
sed 's/..\/..\/proto/..\/proto/' dist/index.js > dist/index-patched.js

rm dist/index.js
mv dist/index-patched.js dist/index.js