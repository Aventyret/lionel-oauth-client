PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

git add .
git commit -m "v$PACKAGE_VERSION"
git push

git tag "v$PACKAGE_VERSION"
git push --tags

echo "Created tag $PACKAGE_VERSION"
