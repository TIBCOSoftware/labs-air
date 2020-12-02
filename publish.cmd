@echo off 

echo generated Docs using HUGO
rmdir /Q /S docs
cd docs-src
set HUGO_ENV=production
hugo
cd ..


