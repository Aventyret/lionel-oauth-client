PACKAGE_VERSION="v$(node -pe "require('./package.json')['version']")"

git add .
git commit -m "v${PACKAGE_VERSION}"
git push

git tag "${PACKAGE_VERSION}"
git push --tags

echo "Created tag $PACKAGE_VERSION"
